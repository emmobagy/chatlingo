import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // During coming-soon phase, only allow /coming-soon route
  // Redirect all other routes to /coming-soon
  if (pathname !== '/coming-soon') {
    return NextResponse.redirect(new URL('/coming-soon', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, API routes, and next.js internals
    '/((?!_next/static|_next/data|api|favicon.ico).*)',
  ],
};
