'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export const UI_LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ko', flag: '🇰🇷', name: '한국어' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
];

const SUPPORTED = UI_LANGUAGES.map(l => l.code);

interface UILanguageContextType {
  uiLang: string;
  setUILang: (code: string) => void;
  flag: string;
  mounted: boolean;
}

const UILanguageContext = createContext<UILanguageContextType>({
  uiLang: 'en',
  setUILang: () => {},
  flag: '🇬🇧',
  mounted: false,
});

export function UILanguageProvider({ children }: { children: ReactNode }) {
  const [uiLang, setUILangState] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Check localStorage (user previously chose)
    const saved = localStorage.getItem('chatlingo-ui-lang');
    if (saved && SUPPORTED.includes(saved)) {
      setUILangState(saved);
      setMounted(true);
      return;
    }
    // 2. Detect from browser
    const browserCode = navigator.language?.split('-')[0] ?? 'en';
    if (SUPPORTED.includes(browserCode)) {
      setUILangState(browserCode);
    }
    setMounted(true);
  }, []);

  function setUILang(code: string) {
    setUILangState(code);
    localStorage.setItem('chatlingo-ui-lang', code);
  }

  const flag = UI_LANGUAGES.find(l => l.code === uiLang)?.flag ?? '🇬🇧';

  return (
    <UILanguageContext.Provider value={{ uiLang, setUILang, flag, mounted }}>
      {children}
    </UILanguageContext.Provider>
  );
}

export function useUILanguage() {
  return useContext(UILanguageContext);
}
