'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mic, Flame, TrendingUp, Clock,
  BookOpen, Camera, RotateCcw, Trash2, ChevronRight, Star,
  MessageCircle, Globe2, CalendarDays,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { SIMULATOR_SCENARIOS } from '@/lib/simulatorData';
import { getTutorAvatar } from '@/lib/tutorAvatars';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getDashboardT } from '@/lib/dashboardTranslations';
import { getDailyGoalT } from '@/lib/dailyGoalTranslations';
import { getCommonT } from '@/lib/commonTranslations';
import { localDateStr } from '@/lib/localDate';
import { getDifficultyLabel } from '@/lib/difficultyTranslations';
import PullToRefresh from '@/components/shared/PullToRefresh';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import AppSidebar from '@/components/shared/AppSidebar';
import TopBar from '@/components/shared/TopBar';

interface DifficultWord {
  id: string;
  word: string;
  createdAt: Date;
}

const LANGUAGE_NAMES: Record<string, string> = {
  'en-US': 'English (US)', 'en-GB': 'English (UK)',
  'it': 'Italian', 'es': 'Spanish', 'fr': 'French',
  'de': 'German', 'pt': 'Portuguese', 'nl': 'Dutch',
  'pl': 'Polish', 'ru': 'Russian', 'ja': 'Japanese',
  'zh': 'Chinese', 'ko': 'Korean',
};

const LANGUAGE_FLAGS: Record<string, string> = {
  'en-US': '🇺🇸', 'en-GB': '🇬🇧', 'it': '🇮🇹', 'es': '🇪🇸',
  'fr': '🇫🇷', 'de': '🇩🇪', 'pt': '🇵🇹', 'nl': '🇳🇱',
  'pl': '🇵🇱', 'ru': '🇷🇺', 'ja': '🇯🇵', 'zh': '🇨🇳', 'ko': '🇰🇷',
};

function DonutChart({ value, max, color }: { value: number; max: number; color: string }) {
  const filled = Math.min(value, max);
  const empty = Math.max(max - filled, 0);
  const data = [{ value: filled }, { value: empty || 1 }];
  const pct = max > 0 ? Math.round((filled / max) * 100) : 0;
  return (
    <div className="relative w-[88px] h-[88px]">
      <PieChart width={88} height={88}>
        <Pie data={data} innerRadius={30} outerRadius={42} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
          <Cell fill={color} />
          <Cell fill="var(--app-border)" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-extrabold text-[var(--app-text)]">{pct}%</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, userProfile, loading, updatePhoto, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [difficultWords, setDifficultWords] = useState<DifficultWord[]>([]);
  const { uiLang, mounted } = useUILanguage();
  const router = useRouter();
  const t = getDashboardT(mounted ? uiLang : 'en');
  const ct = getCommonT(mounted ? uiLang : 'en');

  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'difficultWords')).then((snap) => {
      const words: DifficultWord[] = snap.docs.map((d) => ({
        id: d.id,
        word: d.data().word as string,
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      }));
      const seen = new Map<string, DifficultWord>();
      for (const w of words) {
        const existing = seen.get(w.word.toLowerCase());
        if (!existing || w.createdAt > existing.createdAt) seen.set(w.word.toLowerCase(), w);
      }
      setDifficultWords(Array.from(seen.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }).catch(() => {});
  }, [user]);

  async function handleDeleteWord(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'difficultWords', id)).catch(() => {});
    setDifficultWords((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleClearAllWords() {
    if (!user || difficultWords.length === 0) return;
    await Promise.all(difficultWords.map((w) => deleteDoc(doc(db, 'users', user.uid, 'difficultWords', w.id)).catch(() => {})));
    setDifficultWords([]);
  }

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !userProfile) return <DashboardSkeleton />;

  const isAdmin = userProfile?.role === 'admin';
  const stats = userProfile.stats;
  const isTrialUsed = isAdmin ? false : userProfile.trialUsed;
  const isPaid = isAdmin ? true : ['starter', 'pro', 'ultra'].includes(userProfile.subscription);

  const flag = LANGUAGE_FLAGS[userProfile.targetLanguage] ?? '🌍';
  const langName = LANGUAGE_NAMES[userProfile.targetLanguage] ?? userProfile.targetLanguage;
  const tutorName = userProfile.tutor?.name ?? 'your tutor';

  const gt = getDailyGoalT(uiLang);
  const dailyGoal = userProfile.settings?.dailyGoalMinutes ?? null;
  const today = localDateStr();

  // Use secondsToday only — no fallback to minutesToday to avoid stale/inflated data
  const rawStats = stats as unknown as Record<string, unknown>;
  const secondsToday = stats.lastActiveDate === today
    ? ((rawStats.secondsToday as number | undefined) ?? 0)
    : 0;
  const minutesToday = secondsToday / 60; // float, used for goal comparison
  const dailyGoalSec = (dailyGoal ?? 0) * 60;
  const goalProgress = dailyGoal ? Math.min(secondsToday / dailyGoalSec, 1) : 0;
  const goalComplete = dailyGoal !== null && secondsToday >= dailyGoalSec;
  const secondsRemaining = dailyGoal ? Math.max(dailyGoalSec - secondsToday, 0) : 0;
  const msgIndex = Math.floor(minutesToday) % gt.remainingMessages.length;
  const completedMsgIndex = Math.floor(minutesToday) % gt.completedMessages.length;

  function fmtDuration(secs: number): string {
    if (secs < 60) return `${Math.floor(secs)}s`;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }

  function goalBarColor(pct: number): string {
    if (pct >= 1) return '#10b981';
    if (pct >= 0.6) return '#84cc16';
    if (pct >= 0.35) return '#f59e0b';
    return '#f43f5e';
  }

  async function saveGoal(mins: 5 | 10 | 15) {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { 'settings.dailyGoalMinutes': mins });
    await refreshProfile();
  }

  const completedDays = userProfile.practiceProgress?.completedDays?.length ?? 0;
  const currentDay = userProfile.practiceProgress?.currentDay ?? 1;
  const displayName = userProfile.userName ?? userProfile.displayName ?? user?.email?.split('@')[0] ?? '?';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? ct.morning : hour < 18 ? ct.afternoon : ct.evening;

  // Weekly minutes chart — last 7 days (using secondsByDay for accuracy)
  const secondsByDay = (rawStats?.secondsByDay ?? {}) as Record<string, number>;
  const minutesByDay = (rawStats?.minutesByDay ?? {}) as Record<string, number>; // legacy fallback
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = localDateStr(d);
    const label = d.toLocaleDateString('it-IT', { weekday: 'short' });
    const secs = key === today
      ? secondsToday
      : (secondsByDay[key] ?? (minutesByDay[key] ?? 0) * 60);
    const mins = secs / 60;
    return { label: label.charAt(0).toUpperCase() + label.slice(1), mins, isToday: key === today };
  });
  const maxWeeklyMins = Math.max(...weeklyData.map((d) => d.mins), dailyGoal ?? 10, 1);

  // 3 featured scenarios for the user's goal
  const userGoal = userProfile.goal ?? 'traveler';
  const featuredScenarios = SIMULATOR_SCENARIOS
    .filter((s) => s.goal === userGoal || s.goal === 'all')
    .slice(0, 3);

  // Tutor avatar
  const tutorAvatarSrc = getTutorAvatar(userProfile.tutor?.id);

  // Language banner — for English, use accent (en-US / en-GB / en-AU)
  const LANGUAGE_BANNER: Record<string, string> = {
    'it':    '/banners/Banner-Italiano.png',
    'en':    '/banners/Banner-Inglese-USA.png', // fallback if no accent set
    'en-US': '/banners/Banner-Inglese-USA.png',
    'en-GB': '/banners/Banner-Uk.png',
    'en-AU': '/banners/Banner-Australia.png',
    'es':    '/banners/Banner-Spagnolo.png',
    'fr':    '/banners/Banner-Francese.png',
    'de':    '/banners/Banner-Tedesco.png',
    'pt':    '/banners/Banner-Portoghese.png',
    'nl':    '/banners/Banner-Olandese.png',
    'pl':    '/banners/Banner-Polacco.png',
    'ru':    '/banners/Banner-Russo.png',
    'ja':    '/banners/Banner-Giappone.png',
    'zh':    '/banners/Banner-Cinese.png',
    'ko':    '/banners/Banner-Coreano.png',
    'ar':    '/banners/Banner-Arabo.png',
    'hi':    '/banners/Banner-Indiano.png',
    'tr':    '/banners/Banner-Turchia.png',
  };
  const bannerKey = userProfile.targetLanguage === 'en'
    ? ((userProfile as unknown as Record<string, unknown>).accent as string | undefined) ?? 'en'
    : userProfile.targetLanguage;
  const bannerSrc = LANGUAGE_BANNER[bannerKey] ?? null;

  return (
    <div className="flex h-screen bg-[var(--app-bg)] overflow-hidden">
      <AppSidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: displayName }]} />

        <PullToRefresh onRefresh={refreshProfile} className="flex-1 overflow-y-auto">
          <div className="flex gap-5 p-5 lg:p-6 min-h-full">

            {/* ── LEFT: Main content ── */}
            <main className="flex-1 min-w-0 space-y-5">

              {/* Hero banner */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 p-6 flex flex-col justify-between shadow-lg shadow-indigo-600/20" style={{ minHeight: 'clamp(160px, 22vw, 220px)' }}>
                {/* Language banner image — covers the full banner */}
                {bannerSrc && (
                  <Image
                    src={bannerSrc}
                    alt={langName}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 900px"
                    priority
                  />
                )}
                {/* Dark overlay — stronger on left for text, fades right */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                <div className="relative">
                  <p className="text-white/70 text-sm font-medium">{greeting}</p>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">{displayName}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base">{flag}</span>
                    <span className="text-white/80 text-sm">{langName}</span>
                    <span className="text-white/40 select-none">·</span>
                    <span className="text-sm font-semibold text-white bg-white/15 px-2 py-0.5 rounded-lg">{userProfile.level}</span>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="relative flex items-center gap-3 mt-5 flex-wrap">
                  <Link
                    href="/learn/simulator"
                    className="flex items-center gap-2 bg-white text-indigo-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    <Mic className="w-4 h-4" />
                    {t.startConversation}
                  </Link>
                  <Link
                    href="/learn"
                    className="flex items-center gap-2 bg-white/15 text-white font-medium px-4 py-2 rounded-xl text-sm hover:bg-white/20 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    {ct.nav_practice}
                  </Link>
                  {!isTrialUsed && !isPaid && (
                    <Link
                      href="/conversation"
                      className="flex items-center gap-2 bg-amber-400 text-amber-900 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-amber-300 transition-colors shadow-sm"
                    >
                      <Star className="w-4 h-4" />
                      {t.startFreeTrial}
                    </Link>
                  )}
                </div>
              </div>

              {/* Daily goal — bare progress bar, no card */}
              {dailyGoal && !goalComplete && (
                <div className="px-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-[var(--app-text)]">{gt.todayProgress}</span>
                    <span className="text-xs text-[var(--app-muted)]">{fmtDuration(secondsToday)} / {dailyGoal} min</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--app-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${goalProgress * 100}%`, backgroundColor: goalBarColor(goalProgress) }}
                    />
                  </div>
                </div>
              )}
              {dailyGoal && goalComplete && (
                <div className="px-1 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-500">{gt.completedTitle}</span>
                </div>
              )}

              {/* Tutor card */}
              <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5 flex items-center gap-4">
                <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image src={tutorAvatarSrc} alt={tutorName} fill className="object-cover object-top" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--app-muted)] uppercase tracking-wide mb-0.5">{t.yourTutor}</p>
                  <p className="text-base font-bold text-[var(--app-text)]">{tutorName}</p>
                  <p className="text-xs text-[var(--app-muted)] mt-1">
                    {stats.totalConversations > 0
                      ? t.sessionsWith(stats.totalConversations)
                      : t.readyToStart}
                  </p>
                </div>
                <Link
                  href="/conversation"
                  className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  {t.talk}
                </Link>
              </div>

              {/* Practice modes quick links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { href: '/practice', icon: <CalendarDays className="w-5 h-5" />, label: '30-Day Journey', sub: t.daysSlash30(currentDay), color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                  { href: '/learn/simulator', icon: <Globe2 className="w-5 h-5" />, label: 'Simulator', sub: t.chooseScenario, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  { href: '/learn', icon: <RotateCcw className="w-5 h-5" />, label: 'Word Review', sub: t.wordsSaved(difficultWords.length), color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-4 flex items-center gap-3 hover:border-indigo-500/30 hover:shadow-sm transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--app-text)] truncate">{item.label}</p>
                      <p className="text-xs text-[var(--app-muted)] truncate">{item.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <MessageCircle className="w-4 h-4 text-indigo-500" />, label: t.today, value: stats.conversationsToday, color: 'bg-indigo-500/10' },
                  { icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, label: t.thisWeek, value: stats.conversationsThisWeek, color: 'bg-emerald-500/10' },
                  { icon: <Clock className="w-4 h-4 text-blue-500" />, label: t.minutesToday, value: fmtDuration(secondsToday), color: 'bg-blue-500/10' },
                  { icon: <BookOpen className="w-4 h-4 text-purple-500" />, label: t.corrections, value: stats.correctionsReceived, color: 'bg-purple-500/10' },
                ].map((s) => (
                  <div key={s.label} className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-4">
                    <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
                    <div className="text-2xl font-bold text-[var(--app-text)] tracking-tight">{s.value ?? 0}</div>
                    <div className="text-xs text-[var(--app-muted)] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>


              {/* Weekly minutes bar chart */}
              <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {t.minutesThisWeek}
                  </h2>
                  <span className="text-xs text-[var(--app-muted)]">
                    {fmtDuration(weeklyData.reduce((s, d) => s + d.mins * 60, 0))} {t.totalSuffix}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={weeklyData} barSize={28} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--app-muted)' }} />
                    <YAxis domain={[0, maxWeeklyMins]} hide />
                    <Tooltip
                      cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                      contentStyle={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 10, fontSize: 12, color: 'var(--app-text)' }}
                      formatter={(v) => [v != null && (v as number) < 1 ? `${Math.round((v as number) * 60)}s` : `${Math.round(v as number)}m`, t.practiceTooltip]}
                    />
                    <Bar dataKey="mins" radius={[5, 5, 0, 0]}>
                      {weeklyData.map((entry, i) => (
                        <Cell key={i} fill={entry.isToday ? '#6366f1' : entry.mins > 0 ? '#a5b4fc' : 'var(--app-border)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {dailyGoal && (
                  <p className="text-xs text-[var(--app-muted)] mt-1 text-right">{t.dailyGoalFooter(dailyGoal!)}</p>
                )}
              </div>

              {/* Featured scenarios — card grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-purple-500" />
                    {t.recommendedScenarios}
                  </h2>
                  <Link href="/learn/simulator" className="text-xs text-indigo-500 hover:text-indigo-400 font-medium transition-colors">
                    {ct.seeAll}
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {featuredScenarios.map((sc, idx) => {
                    const palettes = [
                      { bg: 'from-violet-400/30 to-indigo-400/30', text: 'text-violet-500' },
                      { bg: 'from-pink-400/30 to-rose-400/30',     text: 'text-pink-500'   },
                      { bg: 'from-amber-400/30 to-orange-400/30',  text: 'text-amber-500'  },
                    ];
                    const palette = palettes[idx % palettes.length];
                    const diffColor = sc.difficulty === 'beginner'
                      ? 'bg-emerald-500 text-white' : sc.difficulty === 'intermediate'
                      ? 'bg-amber-500 text-white' : 'bg-red-500 text-white';
                    return (
                      <Link
                        key={sc.id}
                        href={`/conversation?scenario=${sc.id}`}
                        className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-500/30 transition-all group"
                      >
                        {/* Illustration area */}
                        <div className={`h-32 relative overflow-hidden ${!sc.image ? `bg-gradient-to-br ${palette.bg} bg-[var(--app-bg)] flex items-center justify-center` : ''}`}>
                          {sc.image ? (
                            <Image src={sc.image} alt={sc.title} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, 33vw" />
                          ) : (
                            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{sc.emoji}</span>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-4">
                          <p className="text-sm font-bold text-[var(--app-text)] leading-snug mb-1">{sc.title}</p>
                          <p className="text-xs text-[var(--app-muted)] leading-relaxed line-clamp-2">{sc.description}</p>
                          <div className="flex items-center justify-between mt-3 mb-1">
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${diffColor}`}>{getDifficultyLabel(sc.difficulty, uiLang)}</span>
                          </div>
                          <div className="w-full mt-3 bg-indigo-600 group-hover:bg-indigo-700 text-white text-xs font-semibold text-center py-2 rounded-xl transition-colors">
                            {ct.startNow}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Words to review */}
              {difficultWords.length > 0 && (
                <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-amber-500" />
                      {t.reviewWords}
                    </h2>
                    <button
                      onClick={handleClearAllWords}
                      className="flex items-center gap-1.5 text-xs text-[var(--app-muted)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.clearAll}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {difficultWords.map((w) => (
                      <div key={w.id} className="flex items-center gap-1.5 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-1.5">
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-300">{w.word}</span>
                        <button onClick={() => handleDeleteWord(w.id)} className="text-amber-400/60 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/conversation?review=${encodeURIComponent(difficultWords.map((w) => w.word).join(','))}`}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
                  >
                    <Mic className="w-4 h-4" />
                    {t.practiceReview}
                  </Link>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-[var(--app-muted)] pb-2">
                <span>{t.totalConversations(stats.totalConversations)}</span>
                <span>{t.longestStreak(stats.longestStreak)}</span>
              </div>
            </main>

            {/* ── RIGHT: User panel ── */}
            <aside className="hidden xl:flex flex-col w-72 shrink-0 space-y-4">

              {/* Profile card */}
              <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5">
                <div className="flex flex-col items-center text-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-16 h-16 rounded-full overflow-hidden bg-indigo-500/10 flex items-center justify-center group mb-3 ring-4 ring-[var(--app-border)]"
                  >
                    {userProfile.photoURL ? (
                      <Image src={userProfile.photoURL} alt="Profile" fill className="object-cover" sizes="64px" />
                    ) : (
                      <span className="text-xl font-bold text-indigo-500">{displayName[0].toUpperCase()}</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {photoUploading
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Camera className="w-4 h-4 text-white" />}
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
                  <p className="font-bold text-[var(--app-text)] text-sm leading-tight">{displayName}</p>
                  <p className="text-xs text-[var(--app-muted)] mt-0.5 truncate max-w-full">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-sm">{flag}</span>
                    <span className="text-xs font-semibold bg-indigo-600/10 text-indigo-500 px-2 py-0.5 rounded-lg">{userProfile.level}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--app-border)]">
                  {[
                    { label: t.streakLabel, value: stats.streak, icon: <Flame className={`w-4 h-4 mx-auto ${stats.streak > 0 ? 'text-orange-500' : 'text-[var(--app-muted)]'}`} /> },
                    { label: t.sessionsLabel, value: stats.totalConversations, icon: <MessageCircle className="w-4 h-4 mx-auto text-indigo-500" /> },
                    { label: t.wordsLabel, value: difficultWords.length, icon: <BookOpen className="w-4 h-4 mx-auto text-purple-500" /> },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      {s.icon}
                      <div className="text-lg font-bold text-[var(--app-text)] mt-1">{s.value ?? 0}</div>
                      <div className="text-[10px] text-[var(--app-muted)]">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily goal card */}
              <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5">
                <p className="text-xs font-semibold text-[var(--app-muted)] uppercase tracking-widest mb-4">{t.dailyGoalTitle}</p>
                {dailyGoal ? (
                  <div className="flex items-center gap-4">
                    <DonutChart value={secondsToday / 60} max={dailyGoal} color={goalBarColor(goalProgress)} />
                    <div>
                      <p className="text-sm font-bold text-[var(--app-text)]">{fmtDuration(secondsToday)} / {dailyGoal} min</p>
                      <p className="text-xs text-[var(--app-muted)] mt-0.5">{goalComplete ? ct.completed : t.todayLabel}</p>
                      {!goalComplete && dailyGoal && (
                        <p className="text-xs text-indigo-500 mt-2">{t.remainingTime(fmtDuration(secondsRemaining))}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-[var(--app-muted)] mb-3">{gt.setGoalTitle}</p>
                    <div className="flex gap-2">
                      {([5, 10, 15] as const).map((mins) => (
                        <button
                          key={mins}
                          onClick={() => saveGoal(mins)}
                          className="flex-1 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold hover:bg-indigo-600/20 transition-colors"
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Practice journey card */}
              <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-5">
                <p className="text-xs font-semibold text-[var(--app-muted)] uppercase tracking-widest mb-4">{t.practiceJourney}</p>
                <div className="flex items-center gap-4">
                  <DonutChart value={completedDays} max={30} color="#6366f1" />
                  <div>
                    <p className="text-sm font-bold text-[var(--app-text)]">{t.daysSlash30(completedDays)}</p>
                    <p className="text-xs text-[var(--app-muted)] mt-0.5">{t.completedLabel}</p>
                    <Link
                      href="/practice"
                      className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-400 font-medium mt-2 transition-colors"
                    >
                      {completedDays === 0 ? ct.startNow : `${currentDay}/30`}
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

            </aside>
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
}
