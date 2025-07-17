import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
}

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value
  const token = req.cookies.get('auth-token')?.value;
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  const isAdminLoginRoute = pathname.startsWith("/admin_login");
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/'];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Redirect to login if accessing /admin_login but not an admin
  if (isAdminLoginRoute && pathname !== "/admin_login" && role !== "Admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect already authenticated admin away from login page
  if (pathname === "/admin_login" && role === "Admin") {
    return NextResponse.redirect(new URL("/admin_login", req.url));
  }

  // If accessing login and already authenticated → redirect accordingly
  if (pathname === '/login' && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
      return NextResponse.redirect(new URL('/admin_login', req.url));
    } catch (error) {
      // Invalid token, allow to proceed to login
    }
  }

  // Require authentication for protected routes
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Verify token and inject headers
  if (!isPublicRoute && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;

      if (pathname.startsWith('/admin') && decoded.roleName !== 'Admin') {
        return NextResponse.redirect(new URL('/admin_login', req.url));
      }

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-role', decoded.roleName);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/admin_login/:path*',
  ],
}
