import { NextResponse } from 'next/server';
import { validateAuthentication } from './app/lib/middleware-helpers.js';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  
  const publicRoutes = ['/login'];
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') ||
      pathname.includes('.') ||
      pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const { isAuthenticated, authToken, userId, details } = validateAuthentication(req);

  if (publicRoutes.includes(pathname) && isAuthenticated) {
    const homeUrl = new URL('/', req.url);
    return NextResponse.redirect(homeUrl);
  }

  if (!publicRoutes.includes(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
