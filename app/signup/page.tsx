'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getAuthT } from '@/lib/authTranslations';

export default function SignupPage() {
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const { uiLang, mounted } = useUILanguage();
  const router = useRouter();
  const t = getAuthT(mounted ? uiLang : 'en');

  // After Safari redirect login, user is already logged in
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordChecks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!passwordValid) return;
    setError('');
    setSubmitting(true);
    try {
      await signUp(email, password, displayName);
      router.push('/onboarding');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-in-use') {
        setError(t.errorEmailInUse);
      } else if (code === 'auth/weak-password') {
        setError(t.errorWeakPassword);
      } else {
        setError(t.errorGeneric);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      router.push(isNewUser ? '/onboarding' : '/dashboard');
    } catch {
      setError(t.errorGoogleFailed);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-20 max-w-2xl">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">ChatLingo</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.signupTitle}</h1>
          <p className="text-gray-500 mb-8">{t.signupSubtitle}</p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || submitting}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <span className="flex items-center justify-center w-5 h-5">
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
            </span>
            {t.continueWithGoogle}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-500">{t.or}</span></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">{t.yourName}</label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Marco"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  {[
                    { key: 'length', label: t.atLeast8Chars },
                    { key: 'letter', label: t.containsLetter },
                    { key: 'number', label: t.containsNumber },
                  ].map(({ key, label }) => (
                    <div key={key} className={`flex items-center gap-1.5 text-xs ${passwordChecks[key as keyof typeof passwordChecks] ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3" />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || googleLoading || !passwordValid}
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.createAccount}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            {t.termsPrefix}{' '}
            <a href="#" className="underline hover:text-gray-600">{t.terms}</a> {t.and}{' '}
            <a href="#" className="underline hover:text-gray-600">{t.privacyPolicy}</a>.
          </p>

          <p className="text-sm text-gray-500 text-center mt-6">
            {t.alreadyHaveAccount}{' '}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">{t.logInLink}</Link>
          </p>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-indigo-600 items-center justify-center p-12">
        <div className="max-w-sm text-center text-white">
          <div className="text-7xl mb-6">🌍</div>
          <h2 className="text-2xl font-bold mb-4">{t.signupSideTitle}</h2>
          <p className="text-indigo-200 leading-relaxed">{t.signupSideDesc}</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {[
              { emoji: '🇬🇧', lang: 'English' },
              { emoji: '🇮🇹', lang: 'Italian' },
              { emoji: '🇪🇸', lang: 'Spanish' },
              { emoji: '🇫🇷', lang: 'French' },
            ].map((l) => (
              <div key={l.lang} className="flex items-center gap-2 bg-indigo-500/40 rounded-lg px-3 py-2 text-sm font-medium">
                <span>{l.emoji}</span>
                <span>{l.lang}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
