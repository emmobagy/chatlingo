'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useUILanguage, UI_LANGUAGES } from '@/contexts/UILanguageContext';

export default function LanguageSwitcher() {
  const { uiLang, setUILang, flag, mounted } = useUILanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!mounted) return null;

  const current = UI_LANGUAGES.find(l => l.code === uiLang);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
        aria-label="Change language"
      >
        <span className="text-base leading-none">{flag}</span>
        <span className="hidden sm:inline font-medium">{current?.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-72 overflow-y-auto">
          {UI_LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setUILang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${uiLang === l.code ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-gray-700'}`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
