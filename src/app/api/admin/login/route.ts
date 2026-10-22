import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { getAdminDb, isDemoEnabled, isRole } from "@/lib/admin-auth";
import { DEMO_COOKIE, TOKEN_COOKIE } from "@/lib/admin-nav";

export const runtime = "nodejs";

const bodySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("demo"),
    role: z.enum(["owner", "cashier", "barista"]),
  }),
  z.object({
    mode: z.literal("password"),
    email: z.string().trim().email("Email tidak valid."),
    password: z.string().min(1, "Kata sandi wajib diisi."),
  }),
]);

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    json = null;
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }
  const body = parsed.data;

  // Demo mode: set role cookie (also used by the "Ganti peran" dropdown).
  if (body.mode === "demo") {
    if (!isDemoEnabled() || !isRole(body.role)) {
      return NextResponse.json({ error: "Mode demo tidak aktif." }, { status: 403 });
    }
    const res = NextResponse.json({ ok: true, role: body.role });
    res.cookies.set(DEMO_COOKIE, body.role, { ...cookieBase, maxAge: 60 * 60 * 8 });
    res.cookies.delete(TOKEN_COOKIE);
    return res;
  }

  // Password mode: Supabase Auth, then require an admin_profiles row.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Konfigurasi server belum lengkap." }, { status: 500 });
  }

  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error || !data.session || !data.user) {
    return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }

  const { data: profile } = await getAdminDb()
    .from("admin_profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || !isRole(profile.role)) {
    return NextResponse.json({ error: "Akun ini bukan akun admin." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true, role: profile.role });
  res.cookies.set(TOKEN_COOKIE, data.session.access_token, {
    ...cookieBase,
    maxAge: data.session.expires_in,
  });
  res.cookies.delete(DEMO_COOKIE);
  return res;
}