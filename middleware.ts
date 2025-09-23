import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const url = req.nextUrl.pathname;

  // If not logged in → block protected routes
  if (
    !token &&
    (url.startsWith("/dashboard") ||
      url.startsWith("/analytics") ||
      url.startsWith("/products") ||
      url.startsWith("/test") || // 👈 added
      url.startsWith("/reports") ||
      url.startsWith("/surveys") ||
      url.startsWith("/team"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Superadmin protection
  if (
    (url.startsWith("/dashboard") ||
      url.startsWith("/analytics") ||
      url.startsWith("/products") ||
      url.startsWith("/test") || // 👈 added
      url.startsWith("/reports") ||
      url.startsWith("/surveys") ||
      url.startsWith("/cameras") ||
      url.startsWith("/locations") ||
      url.startsWith("/map") ||
      url.startsWith("/boq") ||
      url.startsWith("/settings") ||
      url.startsWith("/team")) &&
    role !== "superadmin"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Admin protection
  if (url.startsWith("/purchase") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Technician protection
  if (url.startsWith("/technician") && role !== "technician") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/products/:path*",
    "/test/:path*", // 👈 added
    "/reports/:path*",
    "/surveys/:path*",
    "/cameras/:path*",
    "/locations/:path*",
    "/map/:path*",
    "/boq/:path*",
    "/settings/:path*",
    "/team/:path*",
    "/admin/:path*",
    "/technician/:path*",
  ],
};
