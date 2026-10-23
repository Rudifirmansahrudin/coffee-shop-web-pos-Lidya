import { NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { demoActionSchema } from "@/lib/validators/admin-content";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DUMMY_NAMES = ["Raka", "Sinta", "Dimas", "Nadia", "Bagas", "Putri", "Fajar", "Laras", "Yoga", "Mira"];

type ProductRow = { id: string; name: string; price: number; price_large: number | null };

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeCode(used: Set<string>) {
  let code = "";
  do {
    let suffix = "";
    for (let i = 0; i < 4; i++) suffix += CODE_ALPHABET[randInt(0, CODE_ALPHABET.length - 1)];
    code = `SPC-${suffix}`;
  } while (used.has(code));
  used.add(code);
  return code;
}

// Builds a timestamp "daysAgo" days back at a Jakarta hour (UTC+7, no DST).
function jakartaTime(daysAgo: number, jakartaHour: number) {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  d.setUTCHours(jakartaHour - 7, randInt(0, 59), randInt(0, 59), 0);
  return d.toISOString();
}

export async function POST(req: Request) {
  const role = await getAdminRole();
  if (role !== "owner") {
    return NextResponse.json({ error: "Hanya Owner yang boleh memakai panel demo." }, { status: 403 });
  }

  const parsed = demoActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
  }

  const db = createSupabaseAdminClient();
  const { action } = parsed.data;

  if (action === "confirm-pending") {
    const { data, error } = await db
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString(), payment_method: "demo" })
      .eq("status", "pending_payment")
      .eq("is_dummy", true)
      .select("id");
    if (error) {
      return NextResponse.json({ error: "Gagal mengonfirmasi order." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: `${data?.length ?? 0} order dummy dikonfirmasi.` });
  }

  if (action === "reset") {
    const { data: dummy, error: findError } = await db.from("orders").select("id").eq("is_dummy", true);
    if (findError) {
      return NextResponse.json({ error: "Gagal membaca data demo." }, { status: 500 });
    }
    const ids = (dummy ?? []).map((o) => o.id as string);
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, message: "Tidak ada data demo untuk dihapus." });
    }
    // Reviews have no cascade, so remove them first.
    await db.from("reviews").delete().in("order_id", ids);
    const { error } = await db.from("orders").delete().in("id", ids);
    if (error) {
      return NextResponse.json({ error: "Gagal menghapus data demo." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: `${ids.length} order dummy dihapus.` });
  }

  // action === "seed-week"
  const { data: products, error: prodError } = await db
    .from("products")
    .select("id,name,price,price_large")
    .eq("is_available", true);
  if (prodError || !products || products.length === 0) {
    return NextResponse.json({ error: "Belum ada produk tersedia untuk dibuat order." }, { status: 400 });
  }

  const used = new Set<string>();
  const orderRows: Record<string, unknown>[] = [];
  const itemsByCode = new Map<string, Record<string, unknown>[]>();

  for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
    const count = randInt(4, 8);
    for (let n = 0; n < count; n++) {
      const code = makeCode(used);
      const createdAt = jakartaTime(daysAgo, randInt(9, 21));
      const items: Record<string, unknown>[] = [];
      let total = 0;

      for (let i = 0; i < randInt(1, 3); i++) {
        const p = products[randInt(0, products.length - 1)] as ProductRow;
        const useLarge = p.price_large !== null && Math.random() < 0.4;
        const price = useLarge ? (p.price_large as number) : p.price;
        const qty = randInt(1, 2);
        total += price * qty;
        items.push({
          product_id: p.id,
          name: p.name,
          size: useLarge ? LRG : "REG",
          toppings: [],
          price,
          qty,
        });
      }

      itemsByCode.set(code, items);
      orderRows.push({
        code,
        customer_name: DUMMY_NAMES[randInt(0, DUMMY_NAMES.length - 1)],
        total,
        status: "completed",
        payment_method: "demo",
        paid_at: createdAt,
        is_dummy: true,
        consent_at: createdAt,
        created_at: createdAt,
      });
    }
  }

  const { data: inserted, error: insertError } = await db.from("orders").insert(orderRows).select("id,code");
  if (insertError || !inserted) {
    return NextResponse.json({ error: "Gagal membuat data 7 hari." }, { status: 500 });
  }

  const itemRows = inserted.flatMap((o) =>
    (itemsByCode.get(o.code as string) ?? []).map((it) => ({ ...it, order_id: o.id }))
  );
  const { error: itemError } = await db.from("order_items").insert(itemRows);
  if (itemError) {
    return NextResponse.json({ error: "Order dibuat, tetapi item gagal disimpan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: `${inserted.length} order dummy (7 hari) dibuat.` });
}