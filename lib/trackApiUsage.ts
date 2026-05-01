import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Estimated cost rates (USD) — update as pricing changes
export const API_RATES = {
  geminiPerMin: 0.08,   // gemini-2.5-flash-native-audio estimate
  elevenLabsPer1kChars: 0.30,
};

export async function trackConversationUsage(durationMinutes: number): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0];
    const ref = doc(db, 'api_usage', date);
    const geminiCost = Math.round(durationMinutes * API_RATES.geminiPerMin * 1000) / 1000;
    await setDoc(ref, {
      date,
      geminiSessions: increment(1),
      geminiMinutes: increment(Math.round(durationMinutes * 10) / 10),
      geminiCostUsd: increment(geminiCost),
      totalCostUsd: increment(geminiCost),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch {
    // Non-critical — fail silently
  }
}
