import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidToken } from "./lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page and the login API through
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin/reset") ||
    (pathname.startsWith("/api/contestants") && req.method !== "GET")
  ) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!isValidToken(token)) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/contestants/:path*", "/api/admin/reset"],
};
