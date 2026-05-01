import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SuspiciousEvent {
  uid: string | null;
  email: string | null;
  type: string;
  severity: SeverityLevel;
  description: string;
  metadata: Record<string, unknown>;
}

export async function flagSuspicious(event: SuspiciousEvent): Promise<void> {
  try {
    const ref = doc(collection(db, 'suspicious_events'));
    await setDoc(ref, {
      ...event,
      timestamp: serverTimestamp(),
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
    });
  } catch {
    // Non-critical — fail silently
  }
}

// ── Detection rules ────────────────────────────────────────────────────────

export function checkConversationAbuse(params: {
  uid: string;
  email: string | null;
  conversationsToday: number;
  sessionMinutes: number;
}): void {
  const { uid, email, conversationsToday, sessionMinutes } = params;

  if (sessionMinutes > 45) {
    flagSuspicious({
      uid, email,
      type: 'long_session',
      severity: 'medium',
      description: `Session lasted ${sessionMinutes.toFixed(1)} minutes — unusually long.`,
      metadata: { sessionMinutes },
    });
  }

  if (conversationsToday > 15) {
    flagSuspicious({
      uid, email,
      type: 'too_many_conversations',
      severity: 'high',
      description: `${conversationsToday} conversations today — possible API abuse.`,
      metadata: { conversationsToday },
    });
  } else if (conversationsToday > 8) {
    flagSuspicious({
      uid, email,
      type: 'excessive_usage',
      severity: 'medium',
      description: `${conversationsToday} conversations today — above average.`,
      metadata: { conversationsToday },
    });
  }
}

export function checkAdminAccessAttempt(uid: string, email: string | null): void {
  flagSuspicious({
    uid, email,
    type: 'admin_access_attempt',
    severity: 'high',
    description: `Non-admin user attempted to access the admin panel.`,
    metadata: { uid, email },
  });
}

export function checkFailedAdminLogin(uid: string, attemptCount: number): void {
  if (attemptCount >= 3) {
    flagSuspicious({
      uid, email: null,
      type: 'admin_brute_force',
      severity: 'critical',
      description: `${attemptCount} failed admin login attempts from UID ${uid.slice(0, 8)}…`,
      metadata: { uid, attemptCount },
    });
  }
}

export function checkApiCostSpike(date: string, totalCostUsd: number, threshold: number): void {
  if (totalCostUsd > threshold) {
    flagSuspicious({
      uid: null, email: null,
      type: 'api_cost_spike',
      severity: totalCostUsd > threshold * 2 ? 'critical' : 'high',
      description: `API cost today: $${totalCostUsd.toFixed(2)} — exceeded threshold of $${threshold}.`,
      metadata: { date, totalCostUsd, threshold },
    });
  }
}

export function checkRapidSignups(newUsersInHour: number): void {
  if (newUsersInHour > 20) {
    flagSuspicious({
      uid: null, email: null,
      type: 'rapid_signups',
      severity: 'high',
      description: `${newUsersInHour} new accounts created in the last hour — possible bot activity.`,
      metadata: { newUsersInHour },
    });
  }
}
