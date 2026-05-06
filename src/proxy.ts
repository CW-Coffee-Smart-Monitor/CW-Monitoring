import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/staff', '/auth/forgot-password', '/auth/reset-password', '/landing', '/'];

// Static file extensions that should always pass through
const STATIC_EXT = /\.(jpg|jpeg|png|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js|map)$/i;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets, Next.js internals, and API routes
  if (
    STATIC_EXT.test(pathname) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow public pages
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const session = req.cookies.get('cw_session');

  // Admin routes → redirect to staff login
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const staffLoginUrl = new URL('/auth/staff', req.url);
      return NextResponse.redirect(staffLoginUrl);
    }
    return NextResponse.next();
  }

  // Other protected routes → redirect to customer login
  if (!session) {
    const loginUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
