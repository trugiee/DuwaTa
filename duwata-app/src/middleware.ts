import { auth } from "@/backend/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes - no auth needed
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/tournaments"];
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/tournaments/") ||
    pathname.startsWith("/api/auth");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // API routes - check auth
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin-only API routes
    const adminApiRoutes = [
      "/api/admin",
    ];
    const isAdminRoute = adminApiRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isAdminRoute && (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  }

  // Dashboard routes - require auth
  if (!session) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin dashboard routes
  if (pathname.startsWith("/admin")) {
    if ((session.user as any)?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Team dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/team")) {
    if ((session.user as any)?.role !== "TEAM") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)",
  ],
};
