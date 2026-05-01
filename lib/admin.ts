/**
 * Admin utilities — all operations are async/non-blocking and fail silently
 * so they never impact the main app UX.
 */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ── Log an admin action ──────────────────────────────────────────────────────
export async function logAdminAction(
  adminUid: string,
  action: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    await addDoc(collection(db, 'admin_logs'), {
      adminUid,
      action,
      details,
      timestamp: serverTimestamp(),
    });
  } catch { /* silent */ }
}

// ── Track an analytics event ─────────────────────────────────────────────────
export async function trackEvent(
  uid: string,
  event: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  try {
    await addDoc(collection(db, 'analytics_events'), {
      uid,
      event,
      properties,
      timestamp: serverTimestamp(),
    });
  } catch { /* silent */ }
}

// ── Report a bug ─────────────────────────────────────────────────────────────
export async function reportBug(data: {
  uid?: string;
  email?: string;
  description: string;
  page?: string;
  context?: Record<string, unknown>;
  priority?: 'low' | 'medium' | 'high';
}): Promise<void> {
  try {
    await addDoc(collection(db, 'bug_reports'), {
      uid: data.uid ?? null,
      email: data.email ?? null,
      description: data.description,
      page: data.page ?? (typeof window !== 'undefined' ? window.location.pathname : null),
      context: data.context ?? {},
      priority: data.priority ?? 'medium',
      status: 'new',
      adminNotes: '',
      timestamp: serverTimestamp(),
    });
  } catch { /* silent */ }
}

// ── Rate limiter (in-memory, per session) ────────────────────────────────────
const actionCounts: Record<string, { count: number; resetAt: number }> = {};

export function checkRateLimit(key: string, maxPerMinute = 5): boolean {
  const now = Date.now();
  const entry = actionCounts[key];
  if (!entry || now > entry.resetAt) {
    actionCounts[key] = { count: 1, resetAt: now + 60_000 };
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}
