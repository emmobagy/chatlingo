'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage, googleProvider } from '@/lib/firebase';
import { UserProfile } from '@/types';

// Detect Capacitor native app
function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ isNewUser: boolean }>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updatePhoto: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid, ...docSnap.data() } as UserProfile;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function createUserProfile(user: User, displayName?: string): Promise<void> {
    const defaultProfile = {
      email: user.email!,
      displayName: displayName || user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      targetLanguage: 'en',
      nativeLanguage: 'it',
      level: 'A1',
      goal: 'traveler',
      subscription: 'trial',
      subscriptionStatus: 'active',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionEndsAt: null,
      trialUsed: false,
      stats: {
        streak: 0,
        longestStreak: 0,
        lastActiveDate: '',
        totalConversations: 0,
        conversationsToday: 0,
        conversationsThisWeek: 0,
        conversationsThisMonth: 0,
        minutesToday: 0,
        correctionsReceived: 0,
      },
      settings: {
        notifications: true,
        emailReminders: true,
      },
    };

    await setDoc(doc(db, 'users', user.uid), defaultProfile);
  }

  async function refreshProfile() {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
    }
  }

  async function updatePhoto(file: File) {
    if (!user) return;
    const storageRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL: url });
    await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
    await refreshProfile();
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);

        // Force sign out if account is banned
        if (profile && (profile as any).banned === true) {
          await signOut(auth);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        // Bootstrap: se l'UID è nella lista admin env, assegna role:'admin' automaticamente
        const adminUids = (process.env.NEXT_PUBLIC_ADMIN_UID ?? '').split(',').map((s) => s.trim());
        if (adminUids.includes(firebaseUser.uid) && profile && profile.role !== 'admin') {
          await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' }).catch(() => {});
          profile.role = 'admin';
        }

        setUser(firebaseUser);
        setUserProfile(profile);

        // Set cookies for middleware access check
        const isAdmin = adminUids.includes(firebaseUser.uid);
        const isEnabled = isAdmin || profile?.enabled === true;
        document.cookie = `cl_uid=${firebaseUser.uid}; path=/; SameSite=Lax`;
        document.cookie = `cl_enabled=${isEnabled}; path=/; SameSite=Lax`;
      } else {
        setUser(null);
        setUserProfile(null);
        // Clear cookies on logout
        document.cookie = 'cl_uid=; path=/; max-age=0';
        document.cookie = 'cl_enabled=; path=/; max-age=0';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Heartbeat — update lastSeen every 60s so admin can see online users
  useEffect(() => {
    if (!user) return;
    const beat = () => {
      updateDoc(doc(db, 'users', user.uid), { lastSeen: serverTimestamp() }).catch(() => {});
    };
    beat();
    const interval = setInterval(beat, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  async function signUp(email: string, password: string, displayName: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(credential.user, displayName);
    await sendEmailVerification(credential.user);
  }

  async function signIn(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (!credential.user.emailVerified) {
      await sendEmailVerification(credential.user).catch(() => {});
      await signOut(auth);
      throw new Error('EMAIL_NOT_VERIFIED');
    }
  }

  async function signInWithGoogle(): Promise<{ isNewUser: boolean }> {
    if (isNativeApp()) {
      // Native iOS — use @capacitor-firebase/authentication (Capacitor 8 + SPM compatible)
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      const result = await FirebaseAuthentication.signInWithGoogle();
      if (!result.credential?.idToken) throw new Error('No ID token from Google');
      const firebaseCredential = GoogleAuthProvider.credential(result.credential.idToken);
      const firebaseResult = await signInWithCredential(auth, firebaseCredential);
      const profile = await fetchUserProfile(firebaseResult.user.uid);
      if (!profile) {
        await createUserProfile(firebaseResult.user);
        return { isNewUser: true };
      }
      return { isNewUser: !profile.onboardingComplete };
    }

    // Web — standard popup flow
    const credential = await signInWithPopup(auth, googleProvider);
    const profile = await fetchUserProfile(credential.user.uid);
    if (!profile) {
      await createUserProfile(credential.user);
      return { isNewUser: true };
    }
    return { isNewUser: !profile.onboardingComplete };
  }

  async function logOut() {
    if (isNativeApp()) {
      try {
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
        await FirebaseAuthentication.signOut();
      } catch { /* ignore */ }
    }
    await signOut(auth);
    setUserProfile(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        logOut,
        resetPassword,
        refreshProfile,
        updatePhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
