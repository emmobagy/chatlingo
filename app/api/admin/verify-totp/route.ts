import { NextResponse } from 'next/server';
import { verify as totpVerify } from 'otplib';
import { createHmac } from 'crypto';
import { getAdminDb } from '@/lib/firebaseAdmin';

// In-memory rate limiting + failed attempt tracking
const attempts: Map<string, { count: number; resetAt: number; failed: number }> = new Map();
function checkRate(key: string): { allowed: boolean; failedCount: number } {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + 60_000, failed: 0 });
    return { allowed: true, failedCount: 0 };
  }
  if (entry.count >= 5) return { allowed: false, failedCount: entry.failed };
  entry.count++;
  return { allowed: true, failedCount: entry.failed };
}
function recordFailedAttempt(key: string): number {
  const entry = attempts.get(key);
  if (!entry) return 1;
  entry.failed++;
  return entry.failed;
}

function signSession(uid: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_TOTP_SECRET ?? '';
  const exp = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
  const payload = Buffer.from(JSON.stringify({ uid, exp })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export async function POST(req: Request) {
  try {
    const { code, uid } = await req.json();
    if (!uid || !code) return NextResponse.json({ ok: false }, { status: 400 });

    const { allowed, failedCount } = checkRate(uid);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: 'Too many attempts. Wait 1 minute.' }, { status: 429 });
    }
    void failedCount; // used below

    // Verify admin status server-side
    const adminUids = (process.env.NEXT_PUBLIC_ADMIN_UID ?? '').split(',').map((s) => s.trim());
    let isAuthorized = adminUids.includes(uid);

    try {
      const db = getAdminDb();
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        isAuthorized = isAuthorized || data?.role === 'admin';
      }
      // Also check admins collection
      const adminDoc = await db.collection('admins').doc(uid).get();
      isAuthorized = isAuthorized || adminDoc.exists;
    } catch {
      // Firebase Admin not configured — fall back to env UID list
    }

    if (!isAuthorized) return NextResponse.json({ ok: false }, { status: 403 });

    // Verify TOTP or password
    const totpSecret = process.env.ADMIN_TOTP_SECRET;
    const adminPassword = process.env.ADMIN_PASSWORD;
    let valid = false;

    if (totpSecret && /^\d{6}$/.test(String(code).trim())) {
      try {
        const result = await totpVerify({ secret: totpSecret, token: String(code).trim() });
        valid = typeof result === 'object' ? result.valid : !!result;
      } catch { /* invalid format */ }
    }

    if (!valid && adminPassword) {
      valid = String(code).trim() === adminPassword;
    }

    if (!valid) {
      const failed = recordFailedAttempt(uid);
      // Log to Firestore if >= 3 failed attempts (non-blocking)
      if (failed >= 3) {
        try {
          const db = getAdminDb();
          await db.collection('suspicious_events').add({
            uid, email: null,
            type: 'admin_brute_force',
            severity: failed >= 5 ? 'critical' : 'high',
            description: `${failed} failed admin login attempts from UID ${uid.slice(0, 8)}…`,
            metadata: { uid, failedCount: failed },
            timestamp: new Date(),
            resolved: false,
            resolvedBy: null,
            resolvedAt: null,
          });
        } catch { /* ignore */ }
      }
      return NextResponse.json({ ok: false });
    }

    // Set httpOnly signed cookie (8h expiry)
    const session = signSession(uid);
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
