import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPaymentMode } from "@/lib/midtrans";
import { checkRole } from "@/lib/admin-auth";
import { broadcastOrderUpdate } from "@/lib/admin-orders-server";

export const dynamic = "force-dynamic";

// Unknown keys (e.g. orderId) are stripped by zod, so the admin board can send them safely.
const bodySchema = z.object({
  code: z.string().regex(/^SPC-[A-Z0-9]+$/, "Kode pesanan tidak valid"),
});

export async function POST(request: Request) {
  // Only owner and cashier may confirm payments
  const guard = await checkRole(["owner", "cashier"]);
  if (!guard.ok) return guard.response;

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

  // Notify the customer tracking page (order:<code>); polling there is the fallback
  await broadcastOrderUpdate(data.code as string, "paid");
  return NextResponse.json({ ok: true, code: data.code });
}