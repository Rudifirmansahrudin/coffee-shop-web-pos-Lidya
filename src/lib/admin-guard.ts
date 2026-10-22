import "server-only";
import { NextResponse } from "next/server";
import { getRole, isRole } from "@/lib/admin-auth";

export type AdminRole = "owner" | "cashier" | "barista";

// getRole() returns a session object (or null); extract the role string safely
export async function getAdminRole(): Promise<AdminRole | null> {
  const session = await getRole();
  const value = (session as { role?: unknown } | null)?.role;
  return isRole(value) ? (value as AdminRole) : null;
}

export async function requireRole(allowed: AdminRole[]) {
  const role = await getAdminRole();
  if (!role || !allowed.includes(role)) {
    return {
      role: null,
      error: NextResponse.json(
        { message: "Kamu tidak punya akses untuk aksi ini." },
        { status: 403 }
      ),
    };
  }
  return { role, error: null };
}

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}