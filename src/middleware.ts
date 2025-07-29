import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value
  const url = req.nextUrl.clone()

  // === Admin Routes Protection ===
  if (url.pathname.startsWith("/admin_login")) {
    if (role !== "Admin" && url.pathname !== "/admin_login") {
      return NextResponse.redirect(new URL("/admin_login", req.url))
    }

    if (url.pathname === "/admin_login" && role === "Admin") {
      url.pathname = "/admin_login/view_companies"
      return NextResponse.redirect(url)
    }
  }

  // === User Routes Protection ===
  if (url.pathname.startsWith("/QR_Portal/user_dashboard")) {
    if (role !== "User") {
      return NextResponse.redirect(new URL("/QR_Portal/user_login", req.url))
    }
  }

  if (url.pathname === "/QR_Portal/user_login" && role === "User") {
    return NextResponse.redirect(new URL("/QR_Portal/user_dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin_login/:path*",
    "/QR_Portal/user_dashboard/:path*",
    "/QR_Portal/user_login",
    "/admin_login", // add this explicitly since `/admin_login` won't match `:path*`
  ],
}
