import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidSignature, orderCodeFromMidtransId } from "@/lib/midtrans";

const notificationSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
  payment_type: z.string().optional(),
  transaction_id: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = notificationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const n = parsed.data;

  const valid = isValidSignature({
    orderId: n.order_id,
    statusCode: n.status_code,
    grossAmount: n.gross_amount,
    signatureKey: n.signature_key,
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const code = orderCodeFromMidtransId(n.order_id);
  const { data: order } = await admin
    .from("orders")
    .select("code, total, status")
    .eq("code", code)
    .maybeSingle();

  // Unknown order (e.g. Midtrans dashboard test ping): acknowledge and ignore
  if (!order) return NextResponse.json({ ok: true, ignored: true });

  // Amount must match what we stored
  if (Number(n.gross_amount) !== order.total) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const isPaid =
    n.transaction_status === "settlement" ||
    (n.transaction_status === "capture" && (n.fraud_status ?? "accept") === "accept");

  if (isPaid) {
    await admin
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_method: n.payment_type ?? "midtrans",
        payment_ref: n.transaction_id ?? n.order_id,
      })
      .eq("code", code)
      .eq("status", "pending_payment");
  } else if (n.transaction_status === "expire") {
    await admin.from("orders").update({ status: "expired" }).eq("code", code).eq("status", "pending_payment");
  } else if (n.transaction_status === "cancel" || n.transaction_status === "deny") {
    await admin.from("orders").update({ status: "cancelled" }).eq("code", code).eq("status", "pending_payment");
  }

  return NextResponse.json({ ok: true });
}