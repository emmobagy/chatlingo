import { NextRequest, NextResponse } from 'next/server';

// Routes that are always public (no access check needed)
const PUBLIC_PATHS = [
  '/',
  '/coming-soon',
  '/login',
  '/signup',
  '/reset-password',
  '/pricing',
  '/api/',
];

const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UID ?? '')
  .split(',').map((s) => s.trim()).filter(Boolean);

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths and static assets
  if (isPublicPath(pathname) || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Read the enabled/admin status from a cookie set at login
  const enabledCookie = req.cookies.get('cl_enabled')?.value;
  const uidCookie = req.cookies.get('cl_uid')?.value;

  // Admin always passes through
  if (uidCookie && ADMIN_UIDS.includes(uidCookie)) {
    return NextResponse.next();
  }

  // Not enabled → redirect to coming soon
  if (enabledCookie !== 'true') {
    return NextResponse.redirect(new URL('/coming-soon', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
