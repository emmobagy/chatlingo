'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Mic, BookOpen, User,
  Settings, Shield, LogOut, Menu, X, Sun, Moon, History,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getCommonT } from '@/lib/commonTranslations';
import { useState } from 'react';

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { uiLang } = useUILanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ct = getCommonT(uiLang);

  const NAV_ITEMS = [
    { href: '/dashboard',       label: ct.nav_dashboard,    icon: LayoutDashboard },
    { href: '/learn/simulator', label: ct.nav_conversation, icon: Mic },
    { href: '/learn',           label: ct.nav_practice,     icon: BookOpen },
    { href: '/history',         label: ct.nav_history,      icon: History },
    { href: '/profile',         label: ct.nav_profile,      icon: User },
    { href: '/settings',        label: ct.nav_settings,     icon: Settings },
  ];

  const isAdmin = userProfile?.role === 'admin';
  const displayName = userProfile?.userName ?? userProfile?.displayName ?? user?.email?.split('@')[0] ?? '?';
  const email = user?.email ?? '';
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleLogOut() {
    await logOut();
    router.push('/');
  }

  return (
    <>
      {/* Desktop sidebar — expands on hover */}
      <aside className="group relative hidden lg:flex flex-col w-16 hover:w-56 bg-[var(--app-sidebar)] border-r border-[var(--app-sidebar-border)] h-screen sticky top-0 shrink-0 overflow-hidden transition-all duration-200 z-30">

        {/* Logo */}
        <div className="flex items-center gap-3 px-3.5 py-4 mb-2 shrink-0">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
          <span className="text-[var(--app-text)] font-bold text-base whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            ChatLingo
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-all duration-150 ${
                  active
                    ? 'bg-indigo-500/10 text-indigo-500'
                    : 'text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)]'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
                )}
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {label}
                </span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-all duration-150 ${
                pathname === '/admin'
                  ? 'bg-indigo-500/10 text-indigo-500'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)]'
              }`}
            >
              {pathname === '/admin' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <Shield className="w-[18px] h-[18px] shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Admin
              </span>
            </Link>
          )}
        </nav>

        {/* Bottom section */}
        <div className="px-2 pb-4 pt-3 space-y-0.5 border-t border-[var(--app-sidebar-border)]">
          {/* User info */}
          <div className="flex items-center gap-3 px-2.5 py-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 ring-2 ring-[var(--app-border)]">
              {userProfile?.photoURL ? (
                <Image src={userProfile.photoURL} alt="avatar" width={32} height={32} className="rounded-full object-cover w-full h-full" />
              ) : (
                <span className="text-xs font-bold text-indigo-400">{initials}</span>
              )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 min-w-0">
              <p className="text-sm font-semibold text-[var(--app-text)] whitespace-nowrap">{displayName}</p>
              <p className="text-xs text-[var(--app-muted)] truncate max-w-[120px]">{email}</p>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 w-full text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)] transition-all duration-150"
          >
            {theme === 'dark'
              ? <Sun className="w-[18px] h-[18px] shrink-0" />
              : <Moon className="w-[18px] h-[18px] shrink-0" />
            }
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {ct.nav_theme}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogOut}
            className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 w-full text-[var(--app-muted)] hover:text-red-400 hover:bg-red-500/8 transition-all duration-150"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {ct.nav_logout}
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 w-9 h-9 bg-[var(--app-sidebar)] border border-[var(--app-sidebar-border)] rounded-xl flex items-center justify-center text-[var(--app-muted)] hover:text-[var(--app-text)] shadow-sm"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-60 bg-[var(--app-sidebar)] z-50 flex flex-col border-r border-[var(--app-sidebar-border)]">
            <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--app-sidebar-border)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">CL</span>
                </div>
                <span className="font-bold text-base text-[var(--app-text)]">ChatLingo</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-[var(--app-muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-3 space-y-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-500/10 text-indigo-500'
                        : 'text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)]'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-2 pb-4 border-t border-[var(--app-sidebar-border)] pt-2 space-y-0.5">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  {userProfile?.photoURL ? (
                    <Image src={userProfile.photoURL} alt="avatar" width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-indigo-400">{initials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--app-text)]">{displayName}</p>
                  <p className="text-xs text-[var(--app-muted)] truncate">{email}</p>
                </div>
              </div>
              <button
                onClick={toggle}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)] transition-all w-full"
              >
                {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                {ct.nav_theme}
              </button>
              <button
                onClick={handleLogOut}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--app-muted)] hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
              >
                <LogOut className="w-[18px] h-[18px]" />
                {ct.nav_logout}
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
