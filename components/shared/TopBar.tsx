'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Bell, Sun, Moon, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getCommonT } from '@/lib/commonTranslations';

interface TopBarProps {
  breadcrumb?: { label: string; href?: string }[];
}

export default function TopBar({ breadcrumb }: TopBarProps) {
  const { user, userProfile } = useAuth();
  const { theme, toggle } = useTheme();
  const { uiLang } = useUILanguage();
  const ct = getCommonT(uiLang);
  const [search, setSearch] = useState('');

  const displayName = userProfile?.userName ?? userProfile?.displayName ?? user?.email?.split('@')[0] ?? '?';

  return (
    <header className="h-14 shrink-0 bg-[var(--app-sidebar)] border-b border-[var(--app-sidebar-border)] flex items-center gap-4 px-5 sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="hidden lg:flex items-center gap-1.5 text-sm shrink-0">
        {breadcrumb?.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--app-muted)]" />}
            {crumb.href ? (
              <Link href={crumb.href} className="text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[var(--app-text)] font-semibold">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto lg:mx-0 lg:ml-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ct.searchPlaceholder}
            className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {/* Notifications */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)] transition-all">
          <Bell className="w-[18px] h-[18px]" />
        </button>

        {/* Theme toggle — pill style like in reference */}
        <div className="flex items-center bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl p-1 gap-0.5">
          <button
            onClick={() => theme === 'dark' && toggle()}
            title={ct.themeLight}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              theme === 'light' ? 'bg-[var(--app-surface)] shadow-sm text-[var(--app-text)]' : 'text-[var(--app-muted)]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => theme === 'light' && toggle()}
            title={ct.themeDark}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              theme === 'dark' ? 'bg-[var(--app-surface)] shadow-sm text-[var(--app-text)]' : 'text-[var(--app-muted)]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Avatar */}
        <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-indigo-500/20 flex items-center justify-center ring-2 ring-[var(--app-border)] hover:ring-indigo-500/40 transition-all shrink-0">
          {userProfile?.photoURL ? (
            <Image src={userProfile.photoURL} alt="avatar" width={32} height={32} className="object-cover w-full h-full" />
          ) : (
            <span className="text-xs font-bold text-indigo-400">{displayName[0]?.toUpperCase()}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
