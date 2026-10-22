import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PayClient, { type PayItem } from "@/components/pay/PayClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pembayaran | Space Coffee and Matcha" };

type Props = { params: { code: string } };

export default async function PayPage({ params }: Props) {
  const code = params.code.toUpperCase();
  if (!/^SPC-[A-Z0-9]+$/.test(code)) notFound();

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, code, customer_name, total, status")
    .eq("code", code)
    .maybeSingle();
  if (!order) notFound();

  // Already paid or further along: go to tracking
  if (["paid", "preparing", "ready", "completed"].includes(order.status)) {
    redirect(`/track/${order.code}`);
  }

  if (order.status !== "pending_payment") {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl border border-line bg-surface p-6 text-center">
          <h1 className="font-heading text-xl font-semibold text-space-navy">
            Pesanan tidak aktif
          </h1>
          <p className="mt-2 text-muted">
            Pesanan {order.code} sudah dibatalkan atau kedaluwarsa. Silakan buat pesanan baru.
          </p>
          <Link
            href="/menu"
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-matcha px-5 font-semibold text-space-navy"
          >
            Kembali ke Menu
          </Link>
        </div>
      </main>
    );
  }

  const { data: items } = await admin
    .from("order_items")
    .select("name, size, toppings, price, qty")
    .eq("order_id", order.id);

  const payItems: PayItem[] = (items ?? []).map((i) => ({
    name: i.name,
    size: i.size,
    qty: i.qty,
    price: i.price,
    toppings: Array.isArray(i.toppings)
      ? (i.toppings as { name: string }[]).map((t) => t.name)
      : [],
  }));

  return (
    <main className="mx-auto max-w-lg px-4 py-6 lg:py-10">
      <PayClient
        code={order.code}
        customerName={order.customer_name}
        total={order.total}
        items={payItems}
      />
    </main>
  );
}