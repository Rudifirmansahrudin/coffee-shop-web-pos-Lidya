import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireRole, type AdminRole } from "@/lib/admin-guard";

const idSchema = z.string().uuid();
const bodySchema = z.object({
  action: z.enum(["preparing", "ready", "completed", "cancelled"]),
});

type Action = z.infer<typeof bodySchema>["action"];

const STAFF: AdminRole[] = ["owner", "cashier"];

// Allowed previous statuses and roles for each target status.
// Simplified flow: a paid order can be completed directly (older preparing/ready orders too).
const FLOW: Record<Action, { from: string[]; roles: AdminRole[] }> = {
  preparing: { from: ["paid"], roles: STAFF },
  ready: { from: ["preparing"], roles: STAFF },
  completed: { from: ["paid", "preparing", "ready"], roles: STAFF },
  cancelled: { from: ["pending_payment", "paid", "preparing", "ready"], roles: STAFF },
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { role, error } = await requireRole(STAFF);
  if (error || !role) return error;

  if (!idSchema.safeParse(params.id).success) {
    return NextResponse.json({ error: "ID pesanan tidak valid." }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  }

  const action = parsed.data.action;
  const rule = FLOW[action];
  if (!rule.roles.includes(role)) {
    return NextResponse.json(
      { error: "Peranmu tidak punya akses untuk aksi ini." },
      { status: 403 }
    );
  }

  const db = createSupabaseAdminClient();
  // Conditional update: only moves the order if it is in an allowed previous status
  const { data, error: dbError } = await db
    .from("orders")
    .update({ status: action })
    .eq("id", params.id)
    .in("status", rule.from)
    .select("id");

  if (dbError) {
    console.error("order status update failed", dbError);
    return NextResponse.json({ error: "Gagal memperbarui status pesanan." }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Status pesanan sudah berubah. Muat ulang lalu coba lagi." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}