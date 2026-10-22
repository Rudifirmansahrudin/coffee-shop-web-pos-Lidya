import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validators/order";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alike chars

function makeCode(): string {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return `SPC-${suffix}`;
}

function fail(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(req: Request) {
  // 1. Rate limit per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`orders:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return fail(
      `Terlalu banyak percobaan. Coba lagi dalam ${limit.retryAfterSec} detik.`,
      429
    );
  }

  // 2. Validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Permintaan tidak valid.", 400);
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fail("Data pesanan belum lengkap atau tidak valid.", 422, { fieldErrors });
  }
  const input = parsed.data;

  const supabase = createSupabaseAdminClient();

  // 3. Load prices from DB (never trust client prices)
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const toppingIds = [...new Set(input.items.flatMap((i) => i.toppingIds))];

  const { data: products, error: productErr } = await supabase
    .from("products")
    .select("id, name, price, price_large, is_available")
    .in("id", productIds);

  if (productErr || !products) {
    console.error("orders: load products failed", productErr);
    return fail("Gagal memproses pesanan. Coba lagi sebentar.", 500);
  }

  let toppings: { id: string; name: string; price: number; is_available: boolean }[] = [];
  if (toppingIds.length > 0) {
    const { data, error } = await supabase
      .from("toppings")
      .select("id, name, price, is_available")
      .in("id", toppingIds);
    if (error || !data) {
      console.error("orders: load toppings failed", error);
      return fail("Gagal memproses pesanan. Coba lagi sebentar.", 500);
    }
    toppings = data;
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const toppingMap = new Map(toppings.map((t) => [t.id, t]));

  // 4. Recalculate each line
  let total = 0;
  const itemRows: {
    product_id: string;
    name: string;
    size: "REG" | "LRG";
    toppings: { id: string; name: string; price: number }[];
    price: number;
    qty: number;
    note: string | null;
  }[] = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) return fail("Ada produk yang tidak ditemukan. Muat ulang menu.", 400);
    if (!product.is_available) {
      return fail(`Maaf, ${product.name} sedang habis. Hapus dari keranjang ya.`, 409);
    }
    if (item.size === "LRG" && product.price_large == null) {
      return fail(`${product.name} hanya tersedia ukuran REG.`, 400);
    }

    const uniqueToppingIds = [...new Set(item.toppingIds)];
    const chosen: { id: string; name: string; price: number }[] = [];
    for (const tid of uniqueToppingIds) {
      const topping = toppingMap.get(tid);
      if (!topping) return fail("Ada topping yang tidak ditemukan. Muat ulang menu.", 400);
      if (!topping.is_available) {
        return fail(`Maaf, topping ${topping.name} sedang habis.`, 409);
      }
      chosen.push({ id: topping.id, name: topping.name, price: topping.price });
    }

    const base = item.size === "LRG" ? (product.price_large as number) : product.price;
    const unitPrice = base + chosen.reduce((sum, t) => sum + t.price, 0);
    total += unitPrice * item.qty;

    itemRows.push({
      product_id: product.id,
      name: product.name,
      size: item.size,
      toppings: chosen,
      price: unitPrice,
      qty: item.qty,
      note: item.note ? item.note : null,
    });
  }

  // 5. Create order with a unique code (retry on collision)
  let order: { id: string; code: string } | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        code: makeCode(),
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        note: input.note,
        total,
        consent_at: new Date().toISOString(),
      })
      .select("id, code")
      .single();

    if (!error && data) {
      order = data;
      break;
    }
    if (error?.code !== "23505") {
      console.error("orders: insert failed", error);
      return fail("Gagal membuat pesanan. Coba lagi sebentar.", 500);
    }
  }
  if (!order) return fail("Gagal membuat kode pesanan. Coba lagi.", 500);

  // 6. Insert items; roll back the order if this fails
  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemRows.map((row) => ({ ...row, order_id: order!.id })));

  if (itemsErr) {
    console.error("orders: insert items failed", itemsErr);
    await supabase.from("orders").delete().eq("id", order.id);
    return fail("Gagal menyimpan item pesanan. Coba lagi.", 500);
  }

  return NextResponse.json({ code: order.code }, { status: 201 });
}