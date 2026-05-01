'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getSuccessT } from '@/lib/successTranslations';

export default function SuccessPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const { uiLang } = useUILanguage();
  const t = getSuccessT(uiLang);

  useEffect(() => {
    refreshProfile().catch(() => {});
    const timer = setTimeout(() => router.push('/dashboard'), 3000);
    return () => clearTimeout(timer);
  }, [refreshProfile, router]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-9 h-9 text-green-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2 text-center">{t.paymentSuccessful}</h1>
      <p className="text-gray-400 text-sm text-center mb-8">{t.subscriptionActive}</p>
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
