import { NextRequest, NextResponse } from 'next/server';

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

async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return false;
    const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_TOTP_SECRET ?? '';
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    );
    const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSig = Array.from(new Uint8Array(expectedSigBuffer))
      .map((b) => b.toString(16).padStart(2, '0')).join('');
    if (sig !== expectedSig) return false;
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return Date.now() < exp;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname) || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Admin panel: verify TOTP session
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_session')?.value;
    const valid = await verifyAdminSession(token);
    const res = NextResponse.next();
    if (!valid && token) res.cookies.set('admin_session', '', { maxAge: 0, path: '/' });
    return res;
  }

  // App access: check if user is enabled
  const uidCookie = req.cookies.get('cl_uid')?.value;
  const enabledCookie = req.cookies.get('cl_enabled')?.value;

  if (uidCookie && ADMIN_UIDS.includes(uidCookie)) return NextResponse.next();
  if (enabledCookie !== 'true') {
    return NextResponse.redirect(new URL('/coming-soon', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
