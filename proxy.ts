import { NextRequest, NextResponse } from 'next/server';

// Edge-compatible HMAC verification using Web Crypto API
async function verifySessionEdge(token: string | undefined): Promise<boolean> {
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

  // Only protect /admin routes (not /api/admin/verify-totp which handles its own auth)
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const token = req.cookies.get('admin_session')?.value;
  const valid = await verifySessionEdge(token);

  if (!valid) {
    // Clear any stale cookie and let the client-side TotpGate handle login
    const res = NextResponse.next();
    if (token) res.cookies.set('admin_session', '', { maxAge: 0, path: '/' });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
