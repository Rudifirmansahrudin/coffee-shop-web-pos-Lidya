import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  path: z
    .string()
    .min(1)
    .max(100)
    .regex(/^\/[A-Za-z0-9\-_/]*$/),
});

// Strip identifiers (order codes) so no personal data is stored
function normalizePath(path: string): string {
  if (path.startsWith("/track/")) return "/track";
  if (path.startsWith("/pay/")) return "/pay";
  return path;
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Path tidak valid." }, { status: 400 });
  }

  const path = normalizePath(parsed.data.path);
  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("page_views").insert({ path });
  if (error) {
    return NextResponse.json({ ok: false, message: "Gagal mencatat." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}