import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireRole, badRequest } from "@/lib/admin-guard";
import { toppingUpdateSchema, toppingToggleSchema } from "@/lib/validators/product";

const idSchema = z.string().uuid();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { role, error } = await requireRole(["owner", "cashier", "barista"]);
  if (error) return error;
  if (!idSchema.safeParse(params.id).success) return badRequest("ID tidak valid");

  const json = await req.json().catch(() => null);
  const schema = role === "owner" ? toppingUpdateSchema : toppingToggleSchema;
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
  }
  if (Object.keys(parsed.data).length === 0) return badRequest("Tidak ada perubahan");

  const db = createSupabaseAdminClient();
  const { error: dbError } = await db
    .from("toppings")
    .update(parsed.data)
    .eq("id", params.id);

  if (dbError) return badRequest("Gagal memperbarui topping.");

  revalidatePath("/menu");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireRole(["owner"]);
  if (error) return error;
  if (!idSchema.safeParse(params.id).success) return badRequest("ID tidak valid");

  const db = createSupabaseAdminClient();
  // order_items stores a topping snapshot (jsonb), so deleting is safe
  const { error: dbError } = await db.from("toppings").delete().eq("id", params.id);
  if (dbError) return badRequest("Gagal menghapus topping.");

  revalidatePath("/menu");
  return NextResponse.json({ ok: true });
}