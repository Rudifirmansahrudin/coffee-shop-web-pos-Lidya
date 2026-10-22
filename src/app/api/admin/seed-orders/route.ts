import { NextResponse } from "next/server";
import { getRole } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeRole } from "@/lib/admin-orders";

export const dynamic = "force-dynamic";

const NAMES = ["Rani", "Dimas", "Salsa", "Bagas", "Nadia", "Fajar", "Putri", "Reza", "Intan", "Aldi"];
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type ProductRow = { id: string; name: string; price: number; price_large: number | null };
type ToppingRow = { id: string; name: string; price: number };

function makeCode(): string {
  let s = "";
  for (let i = 0; i < 4; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `SPC-${s}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Generates 5 dummy pending orders using real products from the DB (Owner only)
export async function POST() {
  const role = normalizeRole(await getRole());
  if (!role) {
    return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  }
  if (role !== "owner") {
    return NextResponse.json({ error: "Hanya Owner yang boleh membuat data demo." }, { status: 403 });
  }

  const db = createSupabaseAdminClient();

  const [productsRes, toppingsRes] = await Promise.all([
    db.from("products").select("id, name, price, price_large").eq("is_available", true),
    db.from("toppings").select("id, name, price").eq("is_available", true),
  ]);

  if (productsRes.error || toppingsRes.error) {
    return NextResponse.json({ error: "Gagal membaca menu dari database." }, { status: 500 });
  }

  const products = (productsRes.data ?? []) as ProductRow[];
  const toppings = (toppingsRes.data ?? []) as ToppingRow[];
  if (products.length === 0) {
    return NextResponse.json({ error: "Belum ada produk tersedia untuk dijadikan order dummy." }, { status: 409 });
  }

  const createdCodes: string[] = [];

  for (let n = 0; n < 5; n++) {
    const itemCount = Math.min(products.length, 1 + Math.floor(Math.random() * 3));
    const items = shuffle(products)
      .slice(0, itemCount)
      .map((p) => {
        const useLarge = p.price_large !== null && Math.random() < 0.5;
        const base = useLarge ? (p.price_large as number) : p.price;
        const chosenToppings = toppings.length > 0 && Math.random() < 0.3 ? [pick(toppings)] : [];
        const unitPrice = base + chosenToppings.reduce((sum, t) => sum + t.price, 0);
        return {
          product_id: p.id,
          name: p.name,
          size: useLarge ? "LRG" : "REG",
          toppings: chosenToppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
          price: unitPrice,
          qty: 1 + Math.floor(Math.random() * 2),
        };
      });

    const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

    // Insert order, retry when the random code collides (unique violation)
    let orderId: string | null = null;
    let orderCode = "";
    for (let attempt = 0; attempt < 5 && !orderId; attempt++) {
      const code = makeCode();
      const { data, error } = await db
        .from("orders")
        .insert({
          code,
          customer_name: pick(NAMES),
          total,
          status: "pending_payment",
          is_dummy: true,
          consent_at: new Date().toISOString(),
        })
        .select("id, code")
        .single();

      if (!error && data) {
        orderId = data.id as string;
        orderCode = data.code as string;
      } else if (error && error.code !== "23505") {
        return NextResponse.json({ error: "Gagal membuat order dummy." }, { status: 500 });
      }
    }
    if (!orderId) continue;

    const { error: itemsError } = await db
      .from("order_items")
      .insert(items.map((it) => ({ ...it, order_id: orderId })));

    if (itemsError) {
      // Clean up the half-created order
      await db.from("orders").delete().eq("id", orderId);
      return NextResponse.json({ error: "Gagal membuat item order dummy." }, { status: 500 });
    }

    createdCodes.push(orderCode);
  }

  return NextResponse.json({ ok: true, created: createdCodes });
}