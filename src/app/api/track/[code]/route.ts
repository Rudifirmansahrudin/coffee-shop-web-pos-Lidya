import { NextResponse } from "next/server";
import { getServiceClient, ORDER_CODE_REGEX } from "@/lib/track-db";
import type { OrderStatus } from "@/lib/order-status";

// Order status changes often: never serve it from Next's data cache or route cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();
  if (!ORDER_CODE_REGEX.test(code)) {
    return NextResponse.json({ error: "Kode pesanan tidak valid." }, { status: 400 });
  }

  try {
    const db = getServiceClient();

    // Select only public-safe columns (no phone number)
    const { data: order, error } = await db
      .from("orders")
      .select("id, code, customer_name, status, total, created_at, paid_at")
      .eq("code", code)
      .maybeSingle();

    if (error) throw error;
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const [itemsRes, reviewRes, contactRes] = await Promise.all([
      db
        .from("order_items")
        .select("name, size, toppings, price, qty, note")
        .eq("order_id", order.id),
      db
        .from("reviews")
        .select("rating, comment")
        .eq("order_id", order.id)
        .maybeSingle(),
      db.from("site_content").select("value").eq("key", "contact").maybeSingle(),
    ]);

    if (itemsRes.error) throw itemsRes.error;

    const items = (itemsRes.data ?? []).map((it) => ({
      name: it.name as string,
      size: (it.size ?? null) as "REG" | "LRG" | null,
      toppings: Array.isArray(it.toppings)
        ? (it.toppings as { name?: string }[])
            .map((t) => t.name)
            .filter((n): n is string => Boolean(n))
        : [],
      qty: it.qty as number,
      price: it.price as number,
      note: (it.note ?? null) as string | null,
    }));

    const rawWa = (contactRes.data?.value as { whatsapp?: string } | null)?.whatsapp;
    const whatsapp = rawWa ? rawWa.replace(/\D/g, "") || null : null;

    return NextResponse.json(
      {
        order: {
          code: order.code,
          customerName: order.customer_name,
          status: order.status as OrderStatus,
          total: order.total,
          createdAt: order.created_at,
          paidAt: order.paid_at,
        },
        items,
        review: reviewRes.data
          ? { rating: reviewRes.data.rating, comment: reviewRes.data.comment }
          : null,
        whatsapp,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi sebentar." },
      { status: 500 }
    );
  }
}