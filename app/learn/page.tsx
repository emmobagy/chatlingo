'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays, RotateCcw,
  Mic2, Globe2, ChevronRight,
} from 'lucide-react';
import AppSidebar from '@/components/shared/AppSidebar';
import TopBar from '@/components/shared/TopBar';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';

// ── Mode definitions ───────────────────────────────────────────────────────────
interface LearnMode {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: { bg: string; border: string; icon: string; badge: string };
  href?: string;
  comingSoon?: boolean;
  meta?: React.ReactNode;
}

export default function LearnPage() {
  const { user, userProfile, loading } = useAuth();
  const { uiLang } = useUILanguage();
  const router = useRouter();

  const [wordCount, setWordCount] = useState<number | null>(null);
  const [reviewHref, setReviewHref] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Fetch difficult words for the Review card
  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'difficultWords'))
      .then((snap) => {
        setWordCount(snap.size);
        if (snap.size > 0) {
          const words = snap.docs.map((d) => (d.data() as { word: string }).word).join(',');
          setReviewHref(`/conversation?review=${encodeURIComponent(words)}`);
        }
      })
      .catch(() => setWordCount(0));
  }, [user]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = userProfile.practiceProgress;
  const currentDay = progress?.currentDay ?? 1;
  const completedCount = progress?.completedDays?.length ?? 0;

  const GOAL_LABELS: Record<string, string> = {
    traveler: 'Traveler',
    student: 'Student',
    professional: 'Professional',
    parent: 'Parent',
  };

  const modes: LearnMode[] = [
    {
      id: 'journey',
      icon: <CalendarDays className="w-6 h-6" />,
      label: '30-Day Journey',
      description:
        'A structured daily path from survival phrases to complex conversations. Each session builds on the last.',
      color: {
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        border: 'border-indigo-200 dark:border-indigo-500/20',
        icon: 'bg-indigo-600 text-white',
        badge: 'bg-indigo-100 text-indigo-700',
      },
      href: '/practice',
      meta: (
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-1.5 bg-indigo-200 dark:bg-indigo-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(completedCount / 30) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 shrink-0">
            Day {currentDay}/30
          </span>
        </div>
      ),
    },
    {
      id: 'review',
      icon: <RotateCcw className="w-6 h-6" />,
      label: 'Word & Phrase Review',
      description:
        'Revisit words and phrases you struggled with in past sessions. The AI weaves them into natural conversation.',
      color: {
        bg: 'bg-yellow-50 dark:bg-yellow-500/10',
        border: 'border-yellow-200 dark:border-yellow-500/20',
        icon: 'bg-yellow-400 text-white',
        badge: 'bg-yellow-100 text-yellow-700',
      },
      href: reviewHref,
      meta:
        wordCount !== null ? (
          <p className="mt-2 text-xs font-medium text-yellow-700 dark:text-yellow-400">
            {wordCount === 0
              ? 'No words to review yet, keep practicing!'
              : `${wordCount} word${wordCount !== 1 ? 's' : ''} saved for review`}
          </p>
        ) : null,
    },
    {
      id: 'pronunciation',
      icon: <Mic2 className="w-6 h-6" />,
      label: 'Pronunciation Drill',
      description:
        'Targeted exercises on the sounds, words, and patterns that native speakers use every day, graded by difficulty.',
      color: {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/20',
        icon: 'bg-emerald-500 text-white',
        badge: 'bg-emerald-100 text-emerald-700',
      },
      href: '/learn/pronunciation',
    },
    {
      id: 'simulator',
      icon: <Globe2 className="w-6 h-6" />,
      label: 'Context Simulator',
      description:
        'Immerse yourself in real-life scenarios tailored to your goal: airport, job interview, university, parenting, and more.',
      color: {
        bg: 'bg-purple-50 dark:bg-purple-500/10',
        border: 'border-purple-200 dark:border-purple-500/20',
        icon: 'bg-purple-600 text-white',
        badge: 'bg-purple-100 text-purple-700',
      },
      href: '/learn/simulator',
      meta: userProfile.goal ? (
        <p className="mt-2 text-xs font-medium text-purple-600 dark:text-purple-400">
          Optimized for: {GOAL_LABELS[userProfile.goal] ?? userProfile.goal}
        </p>
      ) : null,
    },
  ];

  return (
    <div className="flex h-screen bg-[var(--app-bg)] overflow-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Pratica' }]} />
      <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4 pb-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--app-text)]">Pratica</h1>
          <p className="text-sm text-[var(--app-muted)] mt-1">
            Scegli come vuoi allenarti oggi.
          </p>
        </div>

        {/* Mode cards */}
        {modes.map((mode) => {
          const isAvailable = !mode.comingSoon && !!mode.href;
          const CardWrapper = isAvailable
            ? ({ children }: { children: React.ReactNode }) => (
                <Link href={mode.href!} className="block group">
                  {children}
                </Link>
              )
            : ({ children }: { children: React.ReactNode }) => (
                <div className={mode.comingSoon ? 'opacity-70 cursor-default' : ''}>
                  {children}
                </div>
              );

          return (
            <CardWrapper key={mode.id}>
              <div
                className={`rounded-2xl border p-5 transition-all ${mode.color.bg} ${mode.color.border} ${
                  isAvailable ? 'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mode.color.icon}`}>
                    {mode.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-[var(--app-text)] text-base">{mode.label}</h2>
                      {mode.comingSoon && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200/80 text-gray-600">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--app-muted)] mt-1 leading-relaxed">
                      {mode.description}
                    </p>
                    {mode.meta}
                  </div>

                  {/* Arrow */}
                  {isAvailable && (
                    <ChevronRight className="w-5 h-5 text-[var(--app-muted)] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
              </div>
            </CardWrapper>
          );
        })}

        <div className="pb-8" />
      </div>
      </main>
      </div>
    </div>
  );
}
