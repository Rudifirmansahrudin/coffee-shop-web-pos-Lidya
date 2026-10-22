import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireRole, badRequest } from "@/lib/admin-guard";
import { toppingSchema } from "@/lib/validators/product";

export async function POST(req: Request) {
  const { error } = await requireRole(["owner"]);
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = toppingSchema.safeParse(json);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
  }

  const db = createSupabaseAdminClient();
  const { data, error: dbError } = await db
    .from("toppings")
    .insert(parsed.data)
    .select("id")
    .single();

  if (dbError) return badRequest("Gagal menyimpan topping.");

  revalidatePath("/menu");
  return NextResponse.json({ id: data.id }, { status: 201 });
}