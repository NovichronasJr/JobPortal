
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionToken = request.cookies.get('COOKIE')?.value;

  const isPublicPath = path === '/auth/login' || path === '/auth/signup';

  
  if (!sessionToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

 
  if (sessionToken && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};