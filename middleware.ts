import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const url = req.nextUrl.pathname;

  console.log("🚀 Middleware triggered for:", role);

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

  if (url.startsWith("/district") && role !== "district coordinator") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (url.startsWith("/assembly") && role !== "assembly coordinator") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (url.startsWith("/block") && role !== "block coordinator") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (url.startsWith("/booth") && role !== "booth coordinator") {
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
    "/district/:path*",
    "/assembly/:path*",
    "/block/:path*",
    "/booth/:path*",
    // "/purchase/:path*",
  ],
};

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;
//   const role = req.cookies.get("role")?.value?.toLowerCase() || "";
//   const url = req.nextUrl.pathname;

//   // 🟥 No token = redirect to login
//   const protectedRoutes = [
//     "/dashboard",
//     "/analytics",
//     "/products",
//     "/reports",
//     "/surveys",
//     "/team",
//     "/district",
//     "/assembly",
//   ];

//   if (!token && protectedRoutes.some((path) => url.startsWith(path))) {
//     console.warn("🚫 No token found, redirecting to /");
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   // 🟩 Superadmin access
//   const superadminRoutes = [
//     "/dashboard",
//     "/analytics",
//     "/products",
//     "/reports",
//     "/settings",
//     "/team",
//   ];

//   if (
//     superadminRoutes.some((path) => url.startsWith(path)) &&
//     role !== "superadmin"
//   ) {
//     console.warn(`⚠️ Blocked ${role} from superadmin route`);
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   // 🟨 District coordinator access
//   if (url.startsWith("/district") && role !== "district coordinator") {
//     console.warn(`⚠️ Blocked ${role} from district route`);
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   // 🟦 Assembly coordinator or app-user access
//   if (
//     url.startsWith("/assembly") &&
//     !["assembly coordinator", "app-user"].includes(role)
//   ) {
//     console.warn(`⚠️ Blocked ${role} from assembly route`);
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   // ✅ All good
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/analytics/:path*",
//     "/products/:path*",
//     "/reports/:path*",
//     "/surveys/:path*",
//     "/team/:path*",
//     "/district/:path*",
//     "/assembly/:path*",
//     "/settings/:path*",
//   ],
// };
