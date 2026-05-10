import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAdminLogin = pathname.startsWith('/admin/login');
  const isAdminRoute = pathname.startsWith('/admin') && !isAdminLogin;

  if (isAuthPage) {
    if (token) {
      if (token === 'mock-admin-token') return NextResponse.redirect(new URL('/admin', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isAdminLogin) {
    if (token === 'mock-admin-token') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (token !== 'mock-admin-token') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/trips');

  if (isDashboardRoute && token === 'mock-admin-token') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/trips/:path*', '/login', '/signup', '/admin/:path*'],
};
