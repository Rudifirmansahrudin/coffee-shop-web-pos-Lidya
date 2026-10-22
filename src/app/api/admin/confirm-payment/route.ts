import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPaymentMode } from "@/lib/midtrans";

const bodySchema = z.object({
  code: z.string().regex(/^SPC-[A-Z0-9]+$/, "Kode pesanan tidak valid"),
});

// TEMPORARY STUB: real role check (owner/cashier) comes in P10
function canConfirmPayment(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_ADMIN === "true";
}

export async function POST(request: Request) {
  if (!canConfirmPayment()) {
    return NextResponse.json({ error: "Tidak punya akses." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: getPaymentMode() === "demo" ? "demo" : "manual",
    })
    .eq("code", parsed.data.code)
    .eq("status", "pending_payment")
    .select("code")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Gagal menyimpan. Coba lagi." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: "Pesanan tidak ditemukan atau sudah diproses." },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true, code: data.code });
}