import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value
  const url = req.nextUrl.clone()

  // If user tries to access any /admin_login/* route except login page but is NOT admin → redirect to login
  if (url.pathname !== "/admin_login" && url.pathname.startsWith("/admin_login") && role !== "Admin") {
    return NextResponse.redirect(new URL("/admin_login", req.url))
  }

  // If already admin and tries to go to login page → redirect to admin home
  if (url.pathname === "/admin_login" && role === "Admin") {
    url.pathname = "/admin_login/view_companies"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin_login/:path*"],
}
