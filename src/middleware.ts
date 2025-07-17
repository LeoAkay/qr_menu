import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value
  const url = req.nextUrl.clone()

  // Admin routes protection
  if (url.pathname !== "/admin_login" && url.pathname.startsWith("/admin_login") && role !== "Admin") {
    return NextResponse.redirect(new URL("/admin_login", req.url))
  }

  if (url.pathname === "/admin_login" && role === "Admin") {
    url.pathname = "/admin_login/view_companies"
    return NextResponse.redirect(url)
  }

  // User routes protection
  if (url.pathname.startsWith("/QR_Portal/user_dashboard") && role !== "User") {
    return NextResponse.redirect(new URL("/QR_Portal/user_login", req.url))
  }

  if (url.pathname === "/QR_Portal/user_login" && role === "User") {
    return NextResponse.redirect(new URL("/QR_Portal/user_dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin_login/:path*", "/QR_Portal/user_dashboard/:path*", "/QR_Portal/user_login"],
}
