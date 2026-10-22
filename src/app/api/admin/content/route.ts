import { NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { contentSchema } from "@/lib/validators/admin-content";

export async function PUT(req: Request) {
  const role = await getAdminRole();
  if (role !== "owner") {
    return NextResponse.json({ error: "Hanya Owner yang boleh mengubah konten." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = contentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }

  const db = createSupabaseAdminClient();
  const { error } = await db.from("site_content").upsert({
    key: parsed.data.key,
    value: parsed.data.value,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Gagal menyimpan konten. Coba lagi." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}