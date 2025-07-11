// middleware.ts
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value
  const url = req.nextUrl.clone()

  // Block non-admin access to /admin_dashboard
  if (url.pathname.startsWith("/admin_dashboard") && role !== "Admin") {
    url.pathname = "/admin_login"
    return NextResponse.redirect(url)
  }

  // Prevent logged-in admin from visiting login page
  if (url.pathname === "/admin_login" && role === "Admin") {
    url.pathname = "/admin_dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin_login/:path*"], // matches /admin_login and any nested paths
}
