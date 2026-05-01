import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../check-session/route';

// Returns the TOTP setup URI — only accessible with a valid admin session cookie
// The secret NEVER leaves the server as a NEXT_PUBLIC env var
export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  const { valid } = verifySession(token);
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const secret = process.env.ADMIN_TOTP_SECRET;
  if (!secret) return NextResponse.json({ uri: null });

  const uri = `otpauth://totp/ChatLingo%20Admin?secret=${secret}&issuer=ChatLingo`;
  return NextResponse.json({ uri, secret });
}
