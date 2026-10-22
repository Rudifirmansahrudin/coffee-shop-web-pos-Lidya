import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DEMO_COOKIE, ROLES, ROLE_LABELS, TOKEN_COOKIE, type Role } from "@/lib/admin-nav";

export type AdminSession = {
  role: Role;
  name: string;
  mode: "demo" | "auth";
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

export function isDemoEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_ADMIN === "true";
}

// Service-role client. Server only, never import from client components.
export function getAdminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env belum diisi (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Resolve the current admin session from cookies, or null if not signed in.
export async function getRole(): Promise<AdminSession | null> {
  const store = cookies();

  const token = store.get(TOKEN_COOKIE)?.value;
  if (token) {
    try {
      const db = getAdminDb();
      const { data } = await db.auth.getUser(token);
      if (data.user) {
        const { data: profile } = await db
          .from("admin_profiles")
          .select("name, role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile && isRole(profile.role)) {
          return {
            role: profile.role,
            name: profile.name ?? data.user.email ?? "Admin",
            mode: "auth",
          };
        }
      }
    } catch {
      // Fall through to demo check / unauthenticated.
    }
  }

  if (isDemoEnabled()) {
    const demo = store.get(DEMO_COOKIE)?.value;
    if (isRole(demo)) {
      return { role: demo, name: `Demo ${ROLE_LABELS[demo]}`, mode: "demo" };
    }
  }

  return null;
}

// Use at the top of admin API routes.
export async function checkRole(allowed: Role[]) {
  const session = await getRole();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 }),
    };
  }
  if (!allowed.includes(session.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Peranmu tidak punya akses untuk aksi ini." },
        { status: 403 }
      ),
    };
  }
  return { ok: true as const, session };
}