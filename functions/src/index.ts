import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();

// Runs every day at 00:05 UTC — resets daily stats for users who haven't been active today
export const resetDailyStats = onSchedule(
  { schedule: '5 0 * * *', timeZone: 'UTC', region: 'europe-west1' },
  async () => {
    const db = getFirestore();
    const today = new Date().toISOString().split('T')[0];

    // Query users where lastActiveDate is not today (stale daily counters)
    const snapshot = await db
      .collection('users')
      .where('stats.lastActiveDate', '<', today)
      .get();

    if (snapshot.empty) {
      console.log('No stale daily stats to reset.');
      return;
    }

    const batch = db.batch();
    let count = 0;

    for (const docSnap of snapshot.docs) {
      batch.update(docSnap.ref, {
        'stats.conversationsToday': 0,
        'stats.minutesToday': 0,
      });
      count++;

      // Firestore batch limit is 500
      if (count % 499 === 0) {
        await batch.commit();
      }
    }

    await batch.commit();
    console.log(`Reset daily stats for ${count} users.`);
  },
);
