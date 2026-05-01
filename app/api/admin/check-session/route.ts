import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export function verifySession(token: string | undefined): { valid: boolean; uid?: string } {
  if (!token) return { valid: false };
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return { valid: false };

    const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_TOTP_SECRET ?? '';
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    if (sig !== expected) return { valid: false };

    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() > exp) return { valid: false };

    return { valid: true, uid };
  } catch {
    return { valid: false };
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  const result = verifySession(token);
  return NextResponse.json(result);
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', '', { maxAge: 0, path: '/' });
  return res;
}
