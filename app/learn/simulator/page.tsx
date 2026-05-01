'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChevronLeft, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getDifficultyLabel } from '@/lib/difficultyTranslations';
import { getSimulatorT } from '@/lib/simulatorTranslations';
import { getCommonT } from '@/lib/commonTranslations';
import { SIMULATOR_SCENARIOS } from '@/lib/simulatorData';
import AppSidebar from '@/components/shared/AppSidebar';
import TopBar from '@/components/shared/TopBar';
import type { UserGoal } from '@/types';


const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     'bg-emerald-500 text-white',
  intermediate: 'bg-amber-500 text-white',
  advanced:     'bg-red-500 text-white',
};

const CARD_PALETTES = [
  'from-violet-400/30 to-indigo-400/30',
  'from-pink-400/30 to-rose-400/30',
  'from-amber-400/30 to-orange-400/30',
  'from-cyan-400/30 to-blue-400/30',
  'from-emerald-400/30 to-teal-400/30',
  'from-fuchsia-400/30 to-purple-400/30',
];

export default function SimulatorPage() {
  const { user, userProfile, loading } = useAuth();
  const { uiLang } = useUILanguage();
  const router = useRouter();
  const st = getSimulatorT(uiLang);
  const ct = getCommonT(uiLang);

  const GOAL_META: Record<string, { label: string; emoji: string }> = {
    all:          { label: st.goalAll,          emoji: '🌍' },
    traveler:     { label: st.goalTraveler,     emoji: '✈️' },
    student:      { label: st.goalStudent,      emoji: '🎓' },
    professional: { label: st.goalProfessional, emoji: '💼' },
    parent:       { label: st.goalParent,       emoji: '🏡' },
  };

  const userGoal = userProfile?.goal ?? 'traveler';
  const [activeGoal, setActiveGoal] = useState<UserGoal | 'all'>('all');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile?.goal) setActiveGoal(userProfile.goal);
  }, [userProfile]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const DIFFICULTY_ORDER: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
  const tabs = ['all', 'traveler', 'student', 'professional', 'parent'] as const;
  const visibleScenarios = (activeGoal === 'all'
    ? SIMULATOR_SCENARIOS
    : SIMULATOR_SCENARIOS.filter((s) => s.goal === activeGoal || s.goal === 'all')
  ).slice().sort((a, b) => {
    if (a.id === 'free-chat') return -1;
    if (b.id === 'free-chat') return 1;
    return (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0);
  });

  return (
    <div className="flex h-screen bg-[var(--app-bg)] overflow-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar breadcrumb={[{ label: ct.nav_practice, href: '/learn' }, { label: ct.nav_conversation }]} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors mb-3"
            >
              <ChevronLeft className="w-4 h-4" />
              {ct.back}
            </button>
            <h1 className="text-2xl font-bold text-[var(--app-text)]">{st.title}</h1>
            <p className="text-sm text-[var(--app-muted)] mt-1">
              {st.subtitle}
            </p>
          </div>

          {/* Goal tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {tabs.map((goal) => {
              const meta = GOAL_META[goal];
              const isActive = activeGoal === goal;
              return (
                <button
                  key={goal}
                  onClick={() => setActiveGoal(goal)}
                  className={`shrink-0 flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text)] shadow-sm'
                      : 'border-transparent text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface)]/60'
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                  {goal !== 'all' && goal === userGoal && (
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                      {st.youBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scenario cards — grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleScenarios.map((scenario, idx) => {
              const palette = CARD_PALETTES[idx % CARD_PALETTES.length];
              return (
                <Link
                  key={scenario.id}
                  href={`/conversation?scenario=${scenario.id}`}
                  className="group bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-500/30 transition-all"
                >
                  {/* Illustration */}
                  <div className={`h-36 relative overflow-hidden ${!scenario.image ? `bg-gradient-to-br ${palette} bg-[var(--app-bg)] flex items-center justify-center` : ''}`}>
                    {scenario.image ? (
                      <Image src={scenario.image} alt={scenario.title} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{scenario.emoji}</span>
                    )}
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[11px] text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {scenario.timeEstimate}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-sm font-bold text-[var(--app-text)] leading-snug mb-1">{scenario.title}</p>
                    <p className="text-xs text-[var(--app-muted)] leading-relaxed line-clamp-2 mb-3">{scenario.description}</p>
                    {/* Objectives */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {scenario.objectives.slice(0, 2).map((obj, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] text-[var(--app-muted)] bg-[var(--app-bg)] px-2 py-0.5 rounded-full">
                          <Target className="w-2 h-2 text-purple-400 shrink-0" />
                          {obj}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[scenario.difficulty]}`}>
                        {getDifficultyLabel(scenario.difficulty, uiLang)}
                      </span>
                    </div>
                    <div className="w-full mt-3 bg-indigo-600 group-hover:bg-indigo-700 text-white text-xs font-semibold text-center py-2 rounded-xl transition-colors">
                      {ct.startNow}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="pb-8" />
        </div>
      </main>
      </div>
    </div>
  );
}
