'use client';

import Link from "next/link";
import { MessageCircle, Mic, TrendingUp, Shield, Star, ChevronRight, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useUILanguage } from "@/contexts/UILanguageContext";
import { getHomeT } from "@/lib/homeTranslations";
import { useAuth } from "@/contexts/AuthContext";

const LANG_SLIDES = [
  { flag: '🇬🇧', line1: 'Learn to', line2: 'actually speak', line3: 'a new language' },
  { flag: '🇮🇹', line1: 'Impara a', line2: 'parlare davvero', line3: 'una nuova lingua' },
  { flag: '🇪🇸', line1: 'Aprende a', line2: 'hablar de verdad', line3: 'un nuevo idioma' },
  { flag: '🇫🇷', line1: 'Apprends à', line2: 'vraiment parler', line3: 'une nouvelle langue' },
  { flag: '🇩🇪', line1: 'Lerne wirklich', line2: 'zu sprechen', line3: 'eine neue Sprache' },
  { flag: '🇧🇷', line1: 'Aprenda a', line2: 'falar de verdade', line3: 'um novo idioma' },
  { flag: '🇯🇵', line1: '本当に話せる', line2: '新しい言語を', line3: '学ぼう' },
  { flag: '🇨🇳', line1: '学会真正地', line2: '说一门', line3: '新语言' },
  { flag: '🇰🇷', line1: '새로운 언어를', line2: '진짜로 말하는', line3: '법을 배우세요' },
  { flag: '🇷🇺', line1: 'Научись', line2: 'реально говорить', line3: 'на новом языке' },
  { flag: '🇸🇦', line1: 'تعلّم كيف', line2: 'تتحدث فعلاً', line3: 'لغة جديدة' },
  { flag: '🇮🇳', line1: 'एक नई भाषा', line2: 'सच में बोलना', line3: 'सीखें' },
  { flag: '🇹🇷', line1: 'Yeni bir dili', line2: 'gerçekten konuşmayı', line3: 'öğren' },
  { flag: '🇳🇱', line1: 'Leer echt', line2: 'te spreken', line3: 'in een nieuwe taal' },
  { flag: '🇵🇱', line1: 'Naucz się', line2: 'naprawdę mówić', line3: 'w nowym języku' },
];

function AnimatedHero() {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % LANG_SLIDES.length);
        setVisible(true);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const slide = LANG_SLIDES[index];

  // Render a static placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col items-center mb-6">
        <span className="text-4xl mb-3">🇬🇧</span>
        <h1
          className="font-extrabold text-gray-900 leading-tight text-center w-full"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)' }}
        >
          {LANG_SLIDES[0].line1}<br />
          <span className="text-indigo-600">{LANG_SLIDES[0].line2}</span><br />
          {LANG_SLIDES[0].line3}
        </h1>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center mb-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(12px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <span className="text-4xl mb-3">{slide.flag}</span>
      <h1
        className="font-extrabold text-gray-900 leading-tight text-center w-full"
        style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)' }}
      >
        {slide.line1}<br />
        <span className="text-indigo-600">{slide.line2}</span><br />
        {slide.line3}
      </h1>
    </div>
  );
}

export default function HomePage() {
  const { uiLang, mounted } = useUILanguage();
  const t = getHomeT(mounted ? uiLang : 'en');
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  // Show nothing while checking auth to avoid flash of landing page
  if (loading || user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">ChatLingo</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">{t.nav_features}</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">{t.nav_pricing}</a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              {t.nav_login}
            </Link>
            <Link href="/signup" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              {t.nav_cta}
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 fill-indigo-500" />
              {t.hero_badge}
            </div>
            <AnimatedHero />
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
              {t.hero_sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors text-lg shadow-lg shadow-indigo-200"
              >
                {t.hero_cta}
                <ChevronRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500">{t.hero_nocredit}</p>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900">10k+</span>
                <span>{t.hero_learners}</span>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900">4</span>
                <span>{t.hero_languages}</span>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900">4.9★</span>
                <span>{t.hero_rating}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.features_title}</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">{t.features_sub}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Mic className="w-6 h-6 text-indigo-600" />,      ...t.features[0] },
                { icon: <MessageCircle className="w-6 h-6 text-indigo-600" />, ...t.features[1] },
                { icon: <TrendingUp className="w-6 h-6 text-indigo-600" />, ...t.features[2] },
                { icon: <Shield className="w-6 h-6 text-indigo-600" />,   ...t.features[3] },
                { icon: <Star className="w-6 h-6 text-indigo-600" />,     ...t.features[4] },
                { icon: <ChevronRight className="w-6 h-6 text-indigo-600" />, ...t.features[5] },
              ].map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.pricing_title}</h2>
              <p className="text-lg text-gray-500">{t.pricing_sub}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-1">Starter</h3>
                <div className="text-3xl font-extrabold mb-1">€9.99</div>
                <p className="text-sm text-gray-500 mb-6">{t.pricing_month}</p>
                <ul className="space-y-3 text-sm text-gray-700 mb-8">
                  {t.pricing_starter_features.map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link href="/signup" className="block text-center border border-indigo-600 text-indigo-600 font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors">
                  {t.pricing_cta}
                </Link>
              </div>
              <div className="border-2 border-indigo-600 rounded-2xl p-6 relative shadow-lg shadow-indigo-100">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {t.pricing_popular}
                </div>
                <h3 className="font-bold text-lg mb-1">Pro</h3>
                <div className="text-3xl font-extrabold mb-1">€19.99</div>
                <p className="text-sm text-gray-500 mb-6">{t.pricing_month}</p>
                <ul className="space-y-3 text-sm text-gray-700 mb-8">
                  {t.pricing_pro_features.map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link href="/signup" className="block text-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
                  {t.pricing_cta}
                </Link>
              </div>
              <div className="border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-1">Ultra</h3>
                <div className="text-3xl font-extrabold mb-1">€39.99</div>
                <p className="text-sm text-gray-500 mb-6">{t.pricing_month}</p>
                <ul className="space-y-3 text-sm text-gray-700 mb-8">
                  {t.pricing_ultra_features.map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link href="/signup" className="block text-center border border-indigo-600 text-indigo-600 font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors">
                  {t.pricing_cta}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-indigo-600 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.cta_title}</h2>
            <p className="text-indigo-200 text-lg mb-8">{t.cta_sub}</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg">
              {t.cta_btn} <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">ChatLingo</span>
          </div>
          <p>{t.footer_rights}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">{t.footer_privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer_terms}</a>
            <a href="mailto:support@chatlingo.app" className="hover:text-white transition-colors">{t.footer_support}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
