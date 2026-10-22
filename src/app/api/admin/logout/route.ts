import { NextResponse } from "next/server";
import { DEMO_COOKIE, TOKEN_COOKIE } from "@/lib/admin-nav";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(TOKEN_COOKIE);
  res.cookies.delete(DEMO_COOKIE);
  return res;
}