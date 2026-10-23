import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validators/order";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Simple in-memory rate limit: 5 orders per minute per IP
const hits = new Map<string, number[]>();
function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode() {
  let s = "";
  for (let i = 0; i < 4; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `SPC-${s}`;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { error: "Data pesanan belum lengkap atau tidak valid.", fieldErrors },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const db = createSupabaseAdminClient();

  // Load prices from DB (never trust client prices)
  const productIds = Array.from(new Set(input.items.map((i) => i.productId)));
  const toppingIds = Array.from(new Set(input.items.flatMap((i) => i.toppingIds ?? [])));

  const { data: products, error: pErr } = await db
    .from("products")
    .select("id, name, price, price_large, is_available")
    .in("id", productIds);
  if (pErr || !products) {
    console.error("orders: load products failed", pErr);
    return NextResponse.json({ error: "Gagal memuat menu. Coba lagi." }, { status: 500 });
  }

  let toppings: { id: string; name: string; price: number; is_available: boolean }[] = [];
  if (toppingIds.length > 0) {
    const { data, error: tErr } = await db
      .from("toppings")
      .select("id, name, price, is_available")
      .in("id", toppingIds);
    if (tErr || !data) {
      console.error("orders: load toppings failed", tErr);
      return NextResponse.json({ error: "Gagal memuat topping. Coba lagi." }, { status: 500 });
    }
    toppings = data;
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const toppingMap = new Map(toppings.map((t) => [t.id, t]));

  let total = 0;
  const itemRows: {
    product_id: string;
    name: string;
    size: "REG" | LRG;
    toppings: { id: string; name: string; price: number }[];
    price: number;
    qty: number;
    note: string | null;
  }[] = [];

  for (const it of input.items) {
    const product = productMap.get(it.productId);
    if (!product) {
      return NextResponse.json({ error: "Ada produk yang tidak ditemukan." }, { status: 400 });
    }
    if (!product.is_available) {
      return NextResponse.json(
        { error: `${product.name} sedang habis. Hapus dari keranjang lalu coba lagi.` },
        { status: 400 }
      );
    }
    const size = it.size === "LRG" ? "LRG" : "REG";
    if (size === "LRG" && product.price_large == null) {
      return NextResponse.json(
        { error: `${product.name} hanya tersedia satu ukuran.` },
        { status: 400 }
      );
    }

    const chosen = [];
    for (const tid of it.toppingIds ?? []) {
      const t = toppingMap.get(tid);
      if (!t || !t.is_available) {
        return NextResponse.json({ error: "Ada topping yang tidak tersedia." }, { status: 400 });
      }
      chosen.push({ id: t.id, name: t.name, price: t.price });
    }

    const base = size === LRG ? (product.price_large as number) : product.price;
    const unitPrice = base + chosen.reduce((s, t) => s + t.price, 0);
    total += unitPrice * it.qty;

    itemRows.push({
      product_id: product.id,
      name: product.name,
      size,
      toppings: chosen,
      price: unitPrice,
      qty: it.qty,
      note: it.note ?? null,
    });
  }

  // Create order with a unique code (retry on collision)
  let order: { id: string; code: string } | null = null;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    const { data, error } = await db
      .from("orders")
      .insert({
        code: makeCode(),
        customer_name: input.customerName,
        customer_phone: input.customerPhone || null,
        note: input.note || null,
        total,
        status: "pending_payment",
        consent_at: new Date().toISOString(),
      })
      .select("id, code")
      .single();

    if (!error && data) {
      order = data;
    } else if (error && error.code !== "23505") {
      console.error("orders: insert order failed", error);
      return NextResponse.json({ error: "Gagal membuat pesanan. Coba lagi." }, { status: 500 });
    }
  }
  if (!order) {
    return NextResponse.json({ error: "Gagal membuat kode pesanan. Coba lagi." }, { status: 500 });
  }

  const { error: iErr } = await db
    .from("order_items")
    .insert(itemRows.map((r) => ({ ...r, order_id: order!.id })));
  if (iErr) {
    console.error("orders: insert items failed", iErr);
    await db.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Gagal menyimpan item pesanan. Coba lagi." }, { status: 500 });
  }

  return NextResponse.json({ code: order.code }, { status: 201 });
}