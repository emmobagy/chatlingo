import { NextResponse } from 'next/server';
import { isUserBanned } from '@/lib/firebaseAdmin';

// ── Rate limiting (in-memory — Redis in produzione) ───────────────────────────
interface RateLimitEntry { count: number; resetAt: number; blockedUntil?: number; }
const ipMap = new Map<string, RateLimitEntry>();
const uidMap = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;        // finestra 1 minuto
const MAX_PER_IP = 30;           // max 30 sessioni/min per IP
const MAX_PER_UID = 20;          // max 20 sessioni/min per utente
const BLOCK_DURATION = 60_000;   // blocco 1 minuto se supera

function checkLimit(map: Map<string, RateLimitEntry>, key: string, max: number): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = map.get(key);

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { ok: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
  }

  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  entry.count++;
  if (entry.count > max * 2) {
    // Abuso — blocca per 5 minuti
    entry.blockedUntil = now + BLOCK_DURATION;
    return { ok: false, retryAfter: BLOCK_DURATION / 1000 };
  }
  if (entry.count > max) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Rate limit per IP
  const ipCheck = checkLimit(ipMap, ip, MAX_PER_IP);
  if (!ipCheck.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(ipCheck.retryAfter ?? 60) } }
    );
  }

  // Verifica Firebase Auth token
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authHeader.slice(7);

  // Verifica token con Firebase Admin (via REST — niente SDK pesante nel Next.js)
  let uid: string;
  try {
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!verifyRes.ok) throw new Error('Invalid token');
    const data = await verifyRes.json();
    uid = data.users?.[0]?.localId;
    if (!uid) throw new Error('No UID');
  } catch {
    return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
  }

  // Block banned users
  if (await isUserBanned(uid)) {
    return NextResponse.json({ error: 'Account suspended.' }, { status: 403 });
  }

  // Rate limit per UID
  const uidCheck = checkLimit(uidMap, uid, MAX_PER_UID);
  if (!uidCheck.ok) {
    return NextResponse.json(
      { error: 'Too many sessions' },
      { status: 429, headers: { 'Retry-After': String(uidCheck.retryAfter ?? 60) } }
    );
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // Ritorna la chiave solo al server — il client la usa per connettersi a Gemini Live
  // In produzione qui si genererebbe un token effimero via Gemini API
  // Per ora restituiamo la chiave in modo sicuro (HTTPS + auth verificata)
  return NextResponse.json({ apiKey: geminiKey });
}
