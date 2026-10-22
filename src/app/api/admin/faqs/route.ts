import { NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  faqCreateSchema,
  faqDeleteSchema,
  faqUpdateSchema,
} from "@/lib/validators/admin-content";

async function ownerOnly() {
  const role = await getAdminRole();
  if (role !== "owner") {
    return NextResponse.json({ error: "Hanya Owner yang boleh mengubah FAQ." }, { status: 403 });
  }
  return null;
}

function badRequest(message?: string) {
  return NextResponse.json({ error: message ?? "Data tidak valid." }, { status: 400 });
}

export async function POST(req: Request) {
  const denied = await ownerOnly();
  if (denied) return denied;

  const parsed = faqCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("faqs").insert(parsed.data).select("*").single();
  if (error) {
    return NextResponse.json({ error: "Gagal menambah FAQ." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, faq: data });
}

export async function PUT(req: Request) {
  const denied = await ownerOnly();
  if (denied) return denied;

  const parsed = faqUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  const { id, ...fields } = parsed.data;
  const db = createSupabaseAdminClient();
  const { error } = await db.from("faqs").update(fields).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Gagal menyimpan FAQ." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await ownerOnly();
  if (denied) return denied;

  const parsed = faqDeleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);

  const db = createSupabaseAdminClient();
  const { error } = await db.from("faqs").delete().eq("id", parsed.data.id);
  if (error) {
    return NextResponse.json({ error: "Gagal menghapus FAQ." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}