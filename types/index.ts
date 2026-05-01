export type SubscriptionTier = 'trial' | 'starter' | 'pro' | 'ultra' | 'expired';
export type SubscriptionStatus = 'active' | 'canceling' | 'cancelled';
export type LanguageCode = 'en' | 'en-US' | 'en-GB' | 'en-AU' | 'it' | 'es' | 'fr' | 'de' | 'pt' | 'nl' | 'pl' | 'ru' | 'ja' | 'zh' | 'ko' | 'ar' | 'hi' | 'tr';
export type EnglishAccent = 'en-US' | 'en-GB' | 'en-AU';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type UserGoal = 'student' | 'professional' | 'traveler' | 'parent';

export interface UserStats {
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalConversations: number;
  conversationsToday: number;
  conversationsThisWeek: number;
  conversationsThisMonth: number;
  minutesToday: number;
  correctionsReceived: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  role?: 'admin' | 'user';
  banned?: boolean;
  enabled?: boolean;
  bannedAt?: Date | null;
  bannedBy?: string | null;
  bannedReason?: string | null;
  displayName: string | null;
  userName?: string;
  photoURL: string | null;
  createdAt: Date;
  targetLanguage: LanguageCode;
  nativeLanguage: LanguageCode;
  accent?: EnglishAccent;
  level: CEFRLevel;
  goal: UserGoal;
  subscription: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionEndsAt: Date | null;
  trialUsed: boolean;
  onboardingComplete?: boolean;
  tutor: { id: string; gender: string; ethnicity: string; name: string } | null;
  stats: UserStats;
  settings: {
    notifications: boolean;
    emailReminders: boolean;
    dailyGoalMinutes?: 5 | 10 | 15;
    showLiveTranscript?: boolean;
  };
  practiceProgress?: {
    currentDay: number;
    completedDays: number[];
    lastPracticeDate: string;
    phase: 'fluency' | 'accent';
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  correction?: string;
}

export interface Conversation {
  id: string;
  timestamp: Date;
  duration: number;
  messages: Message[];
  level: CEFRLevel;
  corrections: number;
  model: string;
  tokensUsed: number;
}

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  conversationsPerDay: number | 'unlimited';
  popular?: boolean;
}
