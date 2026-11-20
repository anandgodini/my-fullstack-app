import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin pages
  const isAdminRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/blogs") && !pathname.startsWith("/blogs/") && !request.headers.get("accept")?.includes("text/html") === false;

  // We will group CMS dashboard routes cleanly under /admin/* or protect dashboard/blogs/etc.
  const protectedPrefixes = [
    "/admin",
    "/dashboard",
  ];

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /login, redirect to /admin/dashboard
  if (pathname === "/login") {
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
  ],
};
