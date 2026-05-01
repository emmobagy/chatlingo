'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PRONUNCIATION_SETS } from '@/lib/pronunciationData';

const DIFFICULTY_COLORS = {
  beginner:     { badge: 'bg-emerald-100 text-emerald-700', ring: 'border-emerald-200' },
  intermediate: { badge: 'bg-amber-100 text-amber-700',   ring: 'border-amber-200' },
  advanced:     { badge: 'bg-red-100 text-red-700',        ring: 'border-red-200' },
};

export default function PronunciationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const groups = [
    { label: 'Beginner', sets: PRONUNCIATION_SETS.filter((s) => s.difficulty === 'beginner') },
    { label: 'Intermediate', sets: PRONUNCIATION_SETS.filter((s) => s.difficulty === 'intermediate') },
    { label: 'Advanced', sets: PRONUNCIATION_SETS.filter((s) => s.difficulty === 'advanced') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/learn" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Pronunciation</span>
            </div>
          </div>
          <span className="text-sm text-gray-400">{PRONUNCIATION_SETS.length} drills</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pronunciation Drill</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pick a sound category. The AI will guide you through each word, give real-time feedback, and help you nail difficult sounds.
          </p>
        </div>

        {/* Difficulty groups */}
        {groups.map(({ label, sets }) => {
          const colors = DIFFICULTY_COLORS[sets[0]?.difficulty ?? 'beginner'];
          return (
            <section key={label}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
                  {label}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="space-y-3">
                {sets.map((set) => (
                  <Link
                    key={set.id}
                    href={`/conversation?pronunciation=${set.id}`}
                    className="group flex items-center gap-4 bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-sm rounded-2xl px-5 py-4 transition-all"
                  >
                    {/* Emoji */}
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {set.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{set.category}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{set.targetSound}</p>
                      <p className="text-xs text-gray-400 mt-1 italic truncate">{set.tip}</p>
                    </div>

                    {/* Time + arrow */}
                    <div className="shrink-0 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {set.timeEstimate}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <div className="pb-8" />
      </main>
    </div>
  );
}
