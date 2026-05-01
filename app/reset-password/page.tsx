'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { MessageCircle, Loader2, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getAuthT } from '@/lib/authTranslations';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { uiLang, mounted } = useUILanguage();
  const t = getAuthT(mounted ? uiLang : 'en');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError(t.errorNoAccount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">ChatLingo</span>
        </Link>

        {sent ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <div className="text-4xl mb-4">📬</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t.checkInboxTitle}</h1>
            <p className="text-gray-500 text-sm mb-6">{t.checkInboxDesc(email)}</p>
            <Link href="/login" className="text-indigo-600 font-medium text-sm hover:underline">
              {t.backToLogin}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <Link href="/login" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
              <ChevronLeft className="w-4 h-4" /> {t.backToLogin}
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.resetTitle}</h1>
            <p className="text-gray-500 text-sm mb-8">{t.resetSubtitle}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.sendResetLink}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
