import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

export function getAdminDb(): Firestore {
  if (!db) {
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey) {
      throw new Error('Firebase Admin credentials not configured');
    }

    if (!getApps().length) {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    }
    db = getFirestore(app ?? getApps()[0]);
  }
  return db;
}

export async function isUserBanned(uid: string): Promise<boolean> {
  try {
    const doc = await getAdminDb().collection('users').doc(uid).get();
    return doc.exists && doc.data()?.banned === true;
  } catch {
    return false;
  }
}
