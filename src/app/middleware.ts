import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, TOKEN_COOKIE } from "@/lib/admin-nav";

// Light gate: redirect to login when no admin cookie exists.
// Real verification happens in getRole() on the server.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasCookie =
    req.cookies.get(TOKEN_COOKIE)?.value || req.cookies.get(DEMO_COOKIE)?.value;

  if (!hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};