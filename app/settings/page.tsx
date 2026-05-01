'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import AppSidebar from '@/components/shared/AppSidebar';
import TopBar from '@/components/shared/TopBar';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage, UI_LANGUAGES } from '@/contexts/UILanguageContext';
import { getSettingsT } from '@/lib/settingsTranslations';
import { deleteAccount, exportUserData, createPortalSession } from '@/lib/api';

const LANGUAGE_OPTIONS = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish' },
  { code: 'fr', flag: '🇫🇷', name: 'French' },
  { code: 'de', flag: '🇩🇪', name: 'German' },
  { code: 'it', flag: '🇮🇹', name: 'Italian' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic' },
  { code: 'hi', flag: '🇮🇳', name: 'Hindi' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish' },
  { code: 'nl', flag: '🇳🇱', name: 'Dutch' },
  { code: 'pl', flag: '🇵🇱', name: 'Polish' },
];

const inputCls = 'w-full border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-[var(--app-muted)]';
const selectCls = 'w-full border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-[var(--app-text)] mb-1';
const subLabelCls = 'text-xs text-[var(--app-muted)] mb-2';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-[var(--app-border)]'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, userProfile, loading, logOut, refreshProfile } = useAuth();
  const { uiLang, setUILang, mounted } = useUILanguage();
  const router = useRouter();
  const t = getSettingsT(mounted ? uiLang : 'en');

  const [displayName, setDisplayName] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const [nativeLang, setNativeLang] = useState('en');
  const [targetLang, setTargetLang] = useState('en');
  const [accent, setAccent] = useState('en-US');
  const [langSaved, setLangSaved] = useState(false);

  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifTranscript, setNotifTranscript] = useState(true);
  const [notifSaved, setNotifSaved] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (userProfile) {
      setDisplayName(userProfile.displayName ?? '');
      setNativeLang(userProfile.nativeLanguage ?? 'en');
      setTargetLang(userProfile.targetLanguage ?? 'en');
      setAccent((userProfile as unknown as Record<string, unknown>).accent as string ?? 'en-US');
      setNotifPush(userProfile.settings?.notifications ?? true);
      setNotifEmail(userProfile.settings?.emailReminders ?? true);
      setNotifTranscript(userProfile.settings?.showLiveTranscript ?? true);
    }
  }, [user, userProfile, loading, router]);

  async function saveProfile() {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { displayName });
    await refreshProfile();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function saveLang() {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      nativeLanguage: nativeLang,
      targetLanguage: targetLang,
      ...(targetLang === 'en' ? { accent } : { accent: null }),
    });
    await refreshProfile();
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 2000);
  }

  async function saveNotif() {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      'settings.notifications': notifPush,
      'settings.emailReminders': notifEmail,
      'settings.showLiveTranscript': notifTranscript,
    });
    await refreshProfile();
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const url = await exportUserData();
      window.open(url, '_blank');
    } catch { /* silent */ } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      router.push('/');
    } catch { setDeleting(false); }
  }

  async function handleManageSub() {
    try {
      const url = await createPortalSession();
      window.location.href = url;
    } catch { /* silent */ }
  }

  const planLabel: Record<string, string> = {
    trial: t.sub_trial,
    starter: t.sub_starter,
    pro: t.sub_pro,
    ultra: t.sub_ultra,
    expired: t.sub_expired,
  };

  const isPaid = ['starter', 'pro', 'ultra'].includes(userProfile?.subscription ?? '');

  if (!mounted || !userProfile) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--app-bg)] overflow-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: t.title }]} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-12">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--app-text)]">{t.title}</h1>
          </div>

          {/* ── PROFILE ── */}
          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[var(--app-text)] mb-5">{t.section_profile}</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>{t.profile_name}</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t.profile_email}</label>
                <input
                  value={user?.email ?? ''}
                  disabled
                  className="w-full border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)] rounded-xl px-4 py-2.5 text-sm cursor-not-allowed opacity-60"
                />
              </div>
            </div>
            <button
              onClick={saveProfile}
              className="mt-5 flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {profileSaved ? <><Check className="w-4 h-4" />{t.profile_saved}</> : t.profile_save}
            </button>
          </section>

          {/* ── LANGUAGE ── */}
          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[var(--app-text)] mb-5">{t.section_language}</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>{t.lang_ui}</label>
                <p className={subLabelCls}>{t.lang_ui_sub}</p>
                <select value={uiLang} onChange={e => setUILang(e.target.value)} className={selectCls}>
                  {UI_LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.lang_native}</label>
                <select value={nativeLang} onChange={e => setNativeLang(e.target.value)} className={selectCls}>
                  {LANGUAGE_OPTIONS.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.lang_target}</label>
                <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className={selectCls}>
                  {LANGUAGE_OPTIONS.filter(l => l.code !== nativeLang).map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>
              {targetLang === 'en' && (
                <div>
                  <label className={labelCls}>Accento inglese</label>
                  <div className="flex gap-3 mt-1">
                    {[
                      { code: 'en-US', flag: '🇺🇸', name: 'Americano' },
                      { code: 'en-GB', flag: '🇬🇧', name: 'Britannico' },
                      { code: 'en-AU', flag: '🇦🇺', name: 'Australiano' },
                    ].map(a => (
                      <button
                        key={a.code}
                        onClick={() => setAccent(a.code)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${accent === a.code ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-[var(--app-border)] text-[var(--app-muted)] hover:border-indigo-400'}`}
                      >
                        <span>{a.flag}</span> {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={saveLang}
              className="mt-5 flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {langSaved ? <><Check className="w-4 h-4" />{t.lang_saved}</> : t.lang_save}
            </button>
          </section>

          {/* ── NOTIFICATIONS ── */}
          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[var(--app-text)] mb-5">{t.section_notifications}</h2>
            <div className="space-y-5">
              {[
                { label: t.notif_push, sub: t.notif_push_sub, val: notifPush, set: setNotifPush },
                { label: t.notif_email, sub: t.notif_email_sub, val: notifEmail, set: setNotifEmail },
                { label: t.notif_transcript, sub: t.notif_transcript_sub, val: notifTranscript, set: setNotifTranscript },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--app-text)]">{label}</p>
                    <p className="text-xs text-[var(--app-muted)]">{sub}</p>
                  </div>
                  <Toggle checked={val} onChange={set} />
                </div>
              ))}
            </div>
            <button
              onClick={saveNotif}
              className="mt-5 flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {notifSaved ? <><Check className="w-4 h-4" />{t.notif_saved}</> : t.notif_save}
            </button>
          </section>

          {/* ── DAILY GOAL ── */}
          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[var(--app-text)] mb-1">Daily practice goal</h2>
            <p className="text-sm text-[var(--app-muted)] mb-4">How many minutes do you want to practice each day?</p>
            <div className="flex gap-3">
              {([5, 10, 15] as const).map((mins) => {
                const active = (userProfile?.settings?.dailyGoalMinutes ?? null) === mins;
                return (
                  <button
                    key={mins}
                    onClick={async () => {
                      if (!user) return;
                      await updateDoc(doc(db, 'users', user.uid), { 'settings.dailyGoalMinutes': mins });
                      await refreshProfile();
                    }}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      active
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)] hover:border-indigo-400 hover:text-indigo-500'
                    }`}
                  >
                    {mins} min / day
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── SUBSCRIPTION ── */}
          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[var(--app-text)] mb-4">{t.section_subscription}</h2>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-[var(--app-muted)] mb-1">{t.sub_plan}</p>
                <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                  isPaid
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'bg-[var(--app-bg)] text-[var(--app-muted)] border border-[var(--app-border)]'
                }`}>
                  {planLabel[userProfile.subscription] ?? userProfile.subscription}
                </span>
              </div>
              {isPaid ? (
                <button
                  onClick={handleManageSub}
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  {t.sub_manage}
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  {t.sub_upgrade}
                </Link>
              )}
            </div>
          </section>

          {/* ── ACCOUNT ── */}
          <section className="bg-[var(--app-surface)] border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[var(--app-text)] mb-5">{t.section_account}</h2>
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-[var(--app-text)]">{t.account_export}</p>
                  <p className="text-xs text-[var(--app-muted)]">{t.account_export_sub}</p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="shrink-0 text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
                >
                  {t.account_export_btn}
                </button>
              </div>

              <div className="border-t border-[var(--app-border)]" />

              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-red-500">{t.account_delete}</p>
                  <p className="text-xs text-[var(--app-muted)]">{t.account_delete_sub}</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="shrink-0 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                >
                  {t.account_delete_btn}
                </button>
              </div>
            </div>
          </section>

          <div className="pb-8" />
        </div>
      </main>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-[var(--app-text)] mb-2">{t.account_delete}</h3>
            <p className="text-sm text-[var(--app-muted)] mb-6">{t.account_delete_sub}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-[var(--app-border)] text-[var(--app-text)] py-2.5 rounded-xl hover:bg-[var(--app-bg)] transition-colors text-sm font-medium"
              >
                {t.account_delete_cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {deleting ? '...' : t.account_delete_confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
