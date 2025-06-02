import { NextResponse } from 'next/server';
import { validateAuthentication } from './app/lib/middleware-helpers.js';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login'];
  
  // Excluir rutas estáticas y de sistema de Next.js
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') ||
      pathname.includes('.') ||
      pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const { isAuthenticated } = validateAuthentication(req);

  // Si estás autenticado y tratas de acceder al login, redirigir al inicio
  if (publicRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Si NO estás autenticado y tratas de acceder a rutas protegidas, redirigir al login
  if (!publicRoutes.includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
