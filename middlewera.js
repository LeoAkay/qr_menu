import { NextResponse } from "next/server";

export function middleware(request) {
  const userRole= "Admin";
  const url = request.nextUrl.clone();
  if(url.pathname === '/admin_login' && userRole !== 'Admin') {
    url.pathname = '/';
    return NextResponse.redirect(url);
}
if (url.pathname === '/' && userRole === 'Admin') {
    url.pathname = '/admin_dashboard';
    return NextResponse.redirect(url);

}
    return NextResponse.next();
}
export const config = {
  matcher: ['/admin_login']
};