'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, MessageCircle, ChevronLeft, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getPricingT } from '@/lib/pricingTranslations';

type BillingPeriod = 'monthly' | 'quarterly' | 'annual' | 'launch';

interface PlanOption {
  id: BillingPeriod;
  totalPrice: number;
  perDay: number;
  priceIdEnvKey: string;
  isPopular?: boolean;
  isLaunch?: boolean;
}

const PLANS: PlanOption[] = [
  { id: 'monthly',   totalPrice: 9.99,  perDay: 0.33, priceIdEnvKey: 'NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID' },
  { id: 'quarterly', totalPrice: 19.99, perDay: 0.22, priceIdEnvKey: 'NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID' },
  { id: 'annual',    totalPrice: 49.99, perDay: 0.14, priceIdEnvKey: 'NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID', isPopular: true },
  { id: 'launch',    totalPrice: 29.99, perDay: 0.08, priceIdEnvKey: 'NEXT_PUBLIC_STRIPE_LAUNCH_PRICE_ID', isLaunch: true },
];

export default function PricingPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const { uiLang } = useUILanguage();
  const t = getPricingT(uiLang);

  const [selected, setSelected] = useState<BillingPeriod>('annual');
  const [loading, setLoading] = useState(false);

  const activePlan = PLANS.find((p) => p.id === selected)!;
  const hasPlan = userProfile?.subscription && userProfile.subscription !== 'trial' && userProfile.subscription !== 'expired';

  async function handleSubscribe() {
    if (!user) { router.push('/login'); return; }
    const priceId = process.env[`NEXT_PUBLIC_STRIPE_${selected.toUpperCase()}_PRICE_ID`]
      ?? process.env.NEXT_PUBLIC_STRIPE_LAUNCH_PRICE_ID!;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, uid: user.uid, email: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const TRUST = [
    { emoji: '🔒', title: t.securePayments, desc: t.securePaymentsDesc },
    { emoji: '📧', title: t.renewalReminder, desc: t.renewalReminderDesc },
    { emoji: '❌', title: t.cancelAnytime, desc: t.cancelAnytimeDesc },
  ];

  const saveBadge: Partial<Record<BillingPeriod, string>> = {
    quarterly: t.save33,
    annual: t.save58,
    launch: t.save70,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">ChatLingo</span>
          </Link>
          {user && (
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <ChevronLeft className="w-4 h-4" /> {t.backToDashboard}
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">{t.title}</h1>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">{t.subtitle}</p>
          {!user && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-4">{t.freeTrialNote}</p>
          )}
        </div>

        {/* Billing selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PLANS.map((plan) => {
            const isActive = selected === plan.id;
            const badge = saveBadge[plan.id];
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative flex flex-col items-center px-5 py-3 rounded-2xl border-2 transition-all text-sm font-semibold ${
                  isActive
                    ? plan.isLaunch
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                      : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {t.mostPopular}
                  </span>
                )}
                {plan.isLaunch && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> {t.limitedOffer}
                  </span>
                )}
                <span className={plan.isPopular || plan.isLaunch ? 'mt-1' : ''}>
                  {plan.isLaunch ? t.limitedOffer.replace('🔥 ', '') : plan.id === 'monthly' ? t.monthly : plan.id === 'quarterly' ? t.quarterly : t.annual}
                </span>
                {badge && (
                  <span className={`text-[10px] font-bold mt-0.5 ${plan.isLaunch ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pricing card */}
        <div className={`bg-white dark:bg-gray-900 rounded-3xl border-2 p-8 shadow-xl mb-6 transition-all ${
          activePlan.isLaunch
            ? 'border-orange-400 shadow-orange-100 dark:shadow-orange-950/30'
            : 'border-indigo-200 dark:border-indigo-800 shadow-indigo-100 dark:shadow-indigo-950/30'
        }`}>
          {activePlan.isLaunch && (
            <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-2.5 mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500 shrink-0" />
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">{t.limitedOfferDesc}</p>
            </div>
          )}

          {/* Price display */}
          <div className="flex items-end gap-3 mb-1">
            <div className="flex items-start">
              <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 mt-2">€</span>
              <span className="text-6xl font-extrabold text-gray-900 dark:text-white leading-none">
                {Math.floor(activePlan.totalPrice)}
              </span>
              <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 mt-2">
                .{(activePlan.totalPrice % 1).toFixed(2).slice(2)}
              </span>
            </div>
            <span className="text-gray-400 dark:text-gray-500 mb-2 text-sm">
              {activePlan.id === 'monthly' ? t.perMonth : `/ ${activePlan.id === 'quarterly' ? t.quarterly.toLowerCase() : activePlan.id === 'annual' ? t.annual.toLowerCase() : t.annual.toLowerCase()}`}
            </span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
            €{activePlan.perDay.toFixed(2)}{t.perDay}
          </p>

          {/* Features */}
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t.everythingIncluded}</p>
          <ul className="space-y-3 mb-8">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          {hasPlan ? (
            <div className="w-full text-center text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 py-3.5 rounded-2xl">
              {t.currentPlan}
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 ${
                activePlan.isLaunch
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.subscribe}
            </button>
          )}
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {TRUST.map((item) => (
            <div key={item.title} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <div className="text-2xl mb-2">{item.emoji}</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs mb-1">{item.title}</div>
              <p className="text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
