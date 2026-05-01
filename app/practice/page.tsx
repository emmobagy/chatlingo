'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Lock, Mic, ChevronRight, Clock } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getPracticeT } from '@/lib/practiceTranslations';
import { PRACTICE_DAYS, WEEK_TITLES, PracticeDay } from '@/lib/practiceData';
import AppSidebar from '@/components/shared/AppSidebar';
import TopBar from '@/components/shared/TopBar';

const WEEK_BADGE: Record<number, string> = {
  1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  2: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  3: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  4: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function PracticePage() {
  const { user, userProfile, loading, refreshProfile } = useAuth();
  const { uiLang, mounted } = useUILanguage();
  const router = useRouter();
  const t = getPracticeT(mounted ? uiLang : 'en');

  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1, 2, 3, 4]));

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = userProfile.practiceProgress ?? {
    currentDay: 1,
    completedDays: [],
    lastPracticeDate: '',
    phase: 'fluency' as const,
  };

  const completedSet = new Set(progress.completedDays);
  const currentDay = progress.currentDay;
  const totalCompleted = completedSet.size;
  const allDone = totalCompleted >= 30;

  function toggleWeek(week: number) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  }

  function getCardState(day: PracticeDay): 'completed' | 'today' | 'next' | 'locked' {
    if (completedSet.has(day.day)) return 'completed';
    if (day.day === currentDay) return 'today';
    if (day.day === currentDay + 1 && completedSet.has(currentDay)) return 'next';
    return 'locked';
  }

  const weeks = [1, 2, 3, 4] as const;

  return (
    <div className="flex h-screen bg-[var(--app-bg)] overflow-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: t.title }]} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-10 space-y-4 pb-12 mt-2 lg:mt-0">

          {/* Header */}
          <div className="bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] p-6 pt-8 lg:pt-6">
            <h1 className="text-2xl font-bold text-[var(--app-text)] mb-1">{t.title}</h1>
            <p className="text-[var(--app-muted)] text-sm mb-4">{t.subtitle}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[var(--app-muted)]">
                <span>{t.fluencyPhase}</span>
                <span>{totalCompleted}/30</span>
              </div>
              <div className="w-full h-3 bg-[var(--app-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(totalCompleted / 30) * 100}%` }}
                />
              </div>
            </div>

            {allDone && (
              <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3 text-sm text-indigo-700 dark:text-indigo-400 font-medium">
                {t.completedAll}
              </div>
            )}
          </div>

          {/* Weeks */}
          {weeks.map((week) => {
            const weekDays = PRACTICE_DAYS.filter((d) => d.week === week);
            const weekCompleted = weekDays.filter((d) => completedSet.has(d.day)).length;
            const isExpanded = expandedWeeks.has(week);

            return (
              <div key={week} className="bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] overflow-hidden">
                <button
                  onClick={() => toggleWeek(week)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--app-bg)]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${WEEK_BADGE[week]}`}>
                      {t.week(week)}
                    </span>
                    <div className="text-left">
                      <p className="font-semibold text-[var(--app-text)]">{WEEK_TITLES[week].split(' — ')[1]}</p>
                      <p className="text-xs text-[var(--app-muted)]">{weekCompleted}/{weekDays.length} {t.completed.toLowerCase()}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-[var(--app-muted)] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--app-border)] divide-y divide-[var(--app-border)]">
                    {weekDays.map((day) => {
                      const state = getCardState(day);
                      const isLocked = state === 'locked';
                      const isCompleted = state === 'completed';
                      const isToday = state === 'today';

                      return (
                        <div
                          key={day.day}
                          className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                            isLocked ? 'opacity-50' : isToday ? 'bg-indigo-500/10' : 'hover:bg-[var(--app-bg)]/40'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isCompleted ? 'bg-green-100 dark:bg-green-900/30' :
                            isToday    ? 'bg-indigo-600' :
                                         'bg-[var(--app-bg)]'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : isToday ? (
                              <Mic className="w-5 h-5 text-white" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4 text-[var(--app-muted)]" />
                            ) : (
                              <span className="text-sm font-bold text-[var(--app-muted)]">{day.day}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-lg">{day.emoji}</span>
                              <p className={`font-semibold text-sm truncate ${isToday ? 'text-indigo-400' : 'text-[var(--app-text)]'}`}>
                                {day.title}
                              </p>
                            </div>
                            <p className="text-xs text-[var(--app-muted)] truncate">{day.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[day.difficulty]}`}>
                                {day.difficulty}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-[var(--app-muted)]">
                                <Clock className="w-3 h-3" />
                                {day.timeEstimate}
                              </span>
                            </div>
                          </div>

                          {!isLocked && (
                            <Link
                              href={`/conversation?topic=${day.topic}&day=${day.day}`}
                              className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                                isToday
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  : 'bg-[var(--app-bg)] text-[var(--app-muted)] hover:text-[var(--app-text)]'
                              }`}
                            >
                              <Mic className="w-3.5 h-3.5" />
                              {isCompleted ? t.redo : isToday ? t.startToday : t.redo}
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pb-8" />
        </div>
      </main>
      </div>
    </div>
  );
}
