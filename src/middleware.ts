import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of protected routes (all /admin/* except /admin/login)
const protectedAdminRoute = (pathname: string) => {
  return pathname.startsWith('/admin') && pathname !== '/admin/login';
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes (except /admin/login)
  if (!protectedAdminRoute(pathname)) {
    return NextResponse.next();
  }

  // Check Supabase auth session cookie
  // Supabase sets 'sb-access-token' and 'sb-refresh-token' cookies
  const accessToken = request.cookies.get('sb-access-token');

  // If no access token, redirect to /admin/login
  if (!accessToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
