'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, Flame, MessageCircle, Clock, TrendingUp, BookOpen, Shield } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from '@/components/shared/AppSidebar';
import TopBar from '@/components/shared/TopBar';
import { getTutorAvatar } from '@/lib/tutorAvatars';
import { localDateStr } from '@/lib/localDate';

const LANGUAGE_NAMES: Record<string, string> = {
  'en-US': 'English (US)', 'en-GB': 'English (UK)',
  'it': 'Italiano', 'es': 'Español', 'fr': 'Français',
  'de': 'Deutsch', 'pt': 'Português', 'nl': 'Nederlands',
  'pl': 'Polski', 'ru': 'Русский', 'ja': '日本語',
  'zh': '中文', 'ko': '한국어',
};

const LANGUAGE_FLAGS: Record<string, string> = {
  'en-US': '🇺🇸', 'en-GB': '🇬🇧', 'it': '🇮🇹', 'es': '🇪🇸',
  'fr': '🇫🇷', 'de': '🇩🇪', 'pt': '🇵🇹', 'nl': '🇳🇱',
  'pl': '🇵🇱', 'ru': '🇷🇺', 'ja': '🇯🇵', 'zh': '🇨🇳', 'ko': '🇰🇷',
};

const GOAL_LABELS: Record<string, string> = {
  traveler: '✈️ Traveler',
  student: '🎓 Student',
  professional: '💼 Professional',
  parent: '👨‍👩‍👧 Parent',
};

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial',
  starter: 'Starter',
  pro: 'Pro',
  ultra: 'Ultra',
  expired: 'Expired',
};

const PLAN_COLORS: Record<string, string> = {
  trial: 'bg-yellow-400 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-900',
  starter: 'bg-blue-500/20 text-blue-300',
  pro: 'bg-indigo-500/20 text-indigo-300',
  ultra: 'bg-purple-500/20 text-purple-300',
  expired: 'bg-red-500/20 text-red-300',
};

export default function ProfilePage() {
  const { user, userProfile, loading, updatePhoto, refreshProfile } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) setNameValue(userProfile.userName ?? userProfile.displayName ?? '');
  }, [userProfile]);

  if (loading || !userProfile) {
    return (
      <div className="flex h-screen bg-[var(--app-bg)]">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const displayName = userProfile.userName ?? userProfile.displayName ?? user?.email?.split('@')[0] ?? '?';
  const flag = LANGUAGE_FLAGS[userProfile.targetLanguage] ?? '🌍';
  const langName = LANGUAGE_NAMES[userProfile.targetLanguage] ?? userProfile.targetLanguage;
  const nativeFlag = LANGUAGE_FLAGS[userProfile.nativeLanguage] ?? '🌍';
  const nativeLang = LANGUAGE_NAMES[userProfile.nativeLanguage] ?? userProfile.nativeLanguage;
  const stats = userProfile.stats;
  const today = localDateStr();
  const minutesToday = stats.lastActiveDate === today ? (stats.minutesToday ?? 0) : 0;
  const completedDays = userProfile.practiceProgress?.completedDays?.length ?? 0;
  const isAdmin = userProfile.role === 'admin';

  async function saveName() {
    if (!user || !nameValue.trim()) return;
    setNameSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { userName: nameValue.trim() });
      await refreshProfile();
      setEditingName(false);
    } finally {
      setNameSaving(false);
    }
  }

  const memberSince = userProfile.createdAt
    ? new Date(userProfile.createdAt as unknown as string).toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })
    : '—';

  return (
    <div className="flex h-screen bg-[var(--app-bg)] overflow-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profilo' }]} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-12">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--app-text)]">Profilo</h1>
            <p className="text-sm text-[var(--app-muted)] mt-1">Le tue informazioni personali e statistiche</p>
          </div>

          {/* Avatar + name card */}
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full overflow-hidden bg-indigo-500/20 flex items-center justify-center group focus:outline-none"
                >
                  {userProfile.photoURL ? (
                    <Image src={userProfile.photoURL} alt="Profile" fill className="object-cover" sizes="80px" />
                  ) : (
                    <span className="text-3xl font-bold text-indigo-300">{displayName[0].toUpperCase()}</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {photoUploading
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Camera className="w-5 h-5 text-[var(--app-text)]" />}
                  </div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPhotoUploading(true);
                    try { await updatePhoto(file); } finally { setPhotoUploading(false); }
                  }}
                />
              </div>

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveName()}
                      className="bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-[var(--app-text)] text-sm font-semibold focus:outline-none focus:border-indigo-500 w-full"
                      autoFocus
                    />
                    <button onClick={saveName} disabled={nameSaving}
                      className="shrink-0 bg-indigo-600 text-[var(--app-text)] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                      {nameSaving ? '...' : 'Salva'}
                    </button>
                    <button onClick={() => setEditingName(false)} className="shrink-0 text-[var(--app-muted)] hover:text-[var(--app-text)] text-xs px-2">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-[var(--app-text)] truncate">{displayName}</h2>
                    <button onClick={() => setEditingName(true)} className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0 transition-colors">
                      Modifica
                    </button>
                  </div>
                )}
                <p className="text-sm text-[var(--app-muted)] truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${PLAN_COLORS[userProfile.subscription] ?? 'bg-slate-500/20 text-slate-300'}`}>
                    {PLAN_LABELS[userProfile.subscription] ?? userProfile.subscription}
                  </span>
                  {isAdmin && (
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-emerald-500 text-white flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Admin
                    </span>
                  )}
                  <span className="text-xs text-[var(--app-muted)]">Membro da {memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Language info */}
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[var(--app-muted)] uppercase tracking-wide mb-4">Lingua & Livello</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--app-muted)] mb-1">Lingua target</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{flag}</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--app-text)]">{langName}</p>
                    <p className="text-xs text-indigo-400 font-bold">{userProfile.level}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--app-muted)] mb-1">Lingua nativa</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{nativeFlag}</span>
                  <p className="text-sm font-semibold text-[var(--app-text)]">{nativeLang}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--app-muted)] mb-1">Obiettivo</p>
                <p className="text-sm font-semibold text-[var(--app-text)]">{GOAL_LABELS[userProfile.goal] ?? userProfile.goal}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--app-muted)] mb-1">Tutor</p>
                <div className="flex items-center gap-2">
                  {userProfile.tutor?.id && (
                    <div className="w-7 h-7 rounded-lg overflow-hidden relative shrink-0">
                      <Image src={getTutorAvatar(userProfile.tutor.id)} alt="tutor" fill className="object-cover object-top" sizes="28px" />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-[var(--app-text)]">{userProfile.tutor?.name ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[var(--app-muted)] uppercase tracking-wide mb-4">Statistiche</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: <Flame className={`w-5 h-5 ${stats.streak > 0 ? 'text-orange-400' : 'text-slate-600'}`} />, label: 'Streak attuale', value: `${stats.streak} giorni` },
                { icon: <Flame className="w-5 h-5 text-amber-500" />, label: 'Record streak', value: `${stats.longestStreak ?? 0} giorni` },
                { icon: <MessageCircle className="w-5 h-5 text-indigo-400" />, label: 'Conversazioni totali', value: stats.totalConversations },
                { icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, label: 'Questa settimana', value: stats.conversationsThisWeek },
                { icon: <Clock className="w-5 h-5 text-blue-400" />, label: 'Minuti oggi', value: minutesToday },
                { icon: <BookOpen className="w-5 h-5 text-purple-400" />, label: 'Correzioni ricevute', value: stats.correctionsReceived },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">{s.icon}</div>
                  <div className="text-xl font-extrabold text-[var(--app-text)]">{s.value}</div>
                  <div className="text-xs text-[var(--app-muted)]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Practice progress */}
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[var(--app-muted)] uppercase tracking-wide mb-4">Percorso 30 Giorni</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--app-text)] font-medium">{completedDays}/30 giorni completati</span>
              <span className="text-xs text-indigo-400 font-semibold">{Math.round((completedDays / 30) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${(completedDays / 30) * 100}%` }}
              />
            </div>
            {userProfile.practiceProgress?.currentDay && (
              <p className="text-xs text-[var(--app-muted)] mt-2">
                Prossimo: Giorno {userProfile.practiceProgress.currentDay}
              </p>
            )}
          </div>

        </div>
      </main>
      </div>
    </div>
  );
}
