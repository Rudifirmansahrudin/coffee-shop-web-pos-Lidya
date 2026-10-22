import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildMidtransOrderId, createSnap, getPaymentMode } from "@/lib/midtrans";

const bodySchema = z.object({
  code: z.string().regex(/^SPC-[A-Z0-9]+$/, "Kode pesanan tidak valid"),
});

export async function POST(request: Request) {
  // Demo mode must never touch Midtrans
  if (getPaymentMode() !== "sandbox") {
    return NextResponse.json(
      { error: "Mode demo aktif. Pembayaran sandbox tidak digunakan." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("code, customer_name, total, status")
    .eq("code", parsed.data.code)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  if (order.status !== "pending_payment") {
    return NextResponse.json(
      { error: "Pesanan ini tidak menunggu pembayaran." },
      { status: 409 }
    );
  }

  try {
    const snap = createSnap();
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: buildMidtransOrderId(order.code),
        gross_amount: order.total,
      },
      customer_details: { first_name: order.customer_name },
    });
    return NextResponse.json({ token: transaction.token });
  } catch {
    return NextResponse.json(
      { error: "Gagal menyiapkan pembayaran. Coba lagi sebentar." },
      { status: 502 }
    );
  }
}