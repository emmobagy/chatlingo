'use client';

import { useRouter } from 'next/navigation';
import { Lock, MessageCircle, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getPaywallT } from '@/lib/paywallTranslations';

export default function PaywallPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const { uiLang } = useUILanguage();
  const t = getPaywallT(uiLang);

  const tutorName = userProfile?.tutor?.name ?? 'your tutor';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6">
        <Lock className="w-7 h-7 text-indigo-400" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2 text-center">
        {t.sessionOver}
      </h1>
      <p className="text-gray-400 text-sm text-center mb-8 max-w-xs">
        {t.completedAssessment(tutorName)}
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => router.push('/pricing')}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <Zap className="w-4 h-4" />
          {t.seePlans}
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {t.backToDashboard}
        </button>
      </div>
    </div>
  );
}
