'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send, Check, Loader2, ChevronRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const TUTORS = [
  { id: 't1', src: '/tutors/Tutor-2.png', name: 'Sofia' },
  { id: 't2', src: '/tutors/Tutor-4.png', name: 'Amara' },
  { id: 't5', src: '/tutors/Tutor-1.png', name: 'James' },
  { id: 't3', src: '/tutors/Tutor-6.png', name: 'Yuki' },
  { id: 't6', src: '/tutors/Tutor-3.png', name: 'Marcus' },
];

function TutorCard({ src, name, delay }: { src: string; name: string; delay: number }) {
  const [blinking, setBlinking] = useState(false);
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 2500 + delay * 300 + Math.random() * 2000);

    const waveTimeout = setTimeout(() => {
      const waveInterval = setInterval(() => {
        setWaving(true);
        setTimeout(() => setWaving(false), 1200);
      }, 4000 + delay * 500);
      return () => clearInterval(waveInterval);
    }, delay * 600);

    return () => { clearInterval(blinkInterval); clearTimeout(waveTimeout); };
  }, [delay]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 blur-md opacity-40 scale-110" />
        <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-xl transition-transform duration-300 ${waving ? 'scale-110' : 'scale-100'}`}>
          <Image src={src} alt={name} fill className="object-cover object-top" />
          {blinking && (
            <div className="absolute inset-0 flex flex-col justify-[33%] items-center pointer-events-none">
              <div className="flex gap-[28%] mt-[30%]">
                <div className="w-[18%] h-[4%] bg-[#c8a882] rounded-full" style={{ aspectRatio: '2/1' }} />
                <div className="w-[18%] h-[4%] bg-[#c8a882] rounded-full" style={{ aspectRatio: '2/1' }} />
              </div>
            </div>
          )}
        </div>
        <div className={`absolute -top-1 -right-1 text-lg transition-all duration-300 ${waving ? 'opacity-100 translate-y-0 rotate-12' : 'opacity-0 translate-y-2 rotate-0'}`}>
          👋
        </div>
      </div>
      <span className="mt-2 text-xs font-medium text-white/70">{name}</span>
    </div>
  );
}

type Mode = 'waitlist' | 'login' | 'signup';

export default function ComingSoonPage() {
  const { signIn, signInWithGoogle, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('waitlist');
  const [isDark, setIsDark] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Waitlist state
  const [email, setEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  // Auth state
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setIsDark((d) => !d), 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = isDark ? '/bg-dark.mp4' : '/bg-light.mp4';
      videoRef.current.play().catch(() => {});
    }
  }, [isDark]);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setWaitlistStatus('loading');
    try {
      const q = query(collection(db, 'waitlist'), where('email', '==', email.toLowerCase().trim()));
      const existing = await getDocs(q);
      if (!existing.empty) { setWaitlistStatus('duplicate'); return; }
      await addDoc(collection(db, 'waitlist'), {
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        source: 'coming-soon',
      });
      setWaitlistStatus('success');
    } catch {
      setWaitlistStatus('error');
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setAuthError('');
    try {
      await signInWithGoogle();
      router.push('/coming-soon');
    } catch {
      setAuthError('Google sign-in failed. Try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (mode === 'login') {
        await signIn(authEmail, authPassword);
        router.push('/coming-soon');
      } else {
        await signUp(authEmail, authPassword, authName);
        // Add to waitlist automatically
        const q = query(collection(db, 'waitlist'), where('email', '==', authEmail.toLowerCase().trim()));
        const existing = await getDocs(q);
        if (existing.empty) {
          await addDoc(collection(db, 'waitlist'), {
            email: authEmail.toLowerCase().trim(),
            createdAt: serverTimestamp(),
            source: 'signup',
          });
        }
        setAuthError('');
        setMode('waitlist');
        setWaitlistStatus('success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'EMAIL_NOT_VERIFIED') {
        setAuthError('Controlla la tua email per verificare l\'account.');
      } else if (msg.includes('email-already-in-use')) {
        setAuthError('Email già registrata. Prova ad accedere.');
      } else if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setAuthError('Email o password non corretti.');
      } else {
        setAuthError('Qualcosa è andato storto. Riprova.');
      }
    } finally {
      setAuthLoading(false);
    }
  }

  const cardBg = isDark
    ? 'bg-white/5 border-white/10 backdrop-blur-xl'
    : 'bg-white/70 border-indigo-100 backdrop-blur-xl shadow-xl shadow-indigo-100';

  const inputCls = isDark
    ? 'bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-indigo-400'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-white/50' : 'text-gray-400';
  const textSub = isDark ? 'text-white/80' : 'text-gray-700';

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-[2000ms] ${isDark ? 'bg-[#0f172a]' : 'bg-[#eef2ff]'}`}>
      <video ref={videoRef} autoPlay muted loop playsInline src="/bg-light.mp4"
        className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className={`absolute inset-0 transition-all duration-[2000ms] ${isDark ? 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b]/80 to-[#312e81]/60' : 'bg-gradient-to-br from-[#eef2ff]/90 via-[#e0e7ff]/70 to-[#c7d2fe]/50'}`} />
      <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-indigo-600/20' : 'bg-indigo-400/20'}`} />
      <div className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-violet-600/20' : 'bg-violet-400/20'}`} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className={`text-2xl font-extrabold tracking-tight transition-colors duration-[2000ms] ${textPrimary}`}>ChatLingo</span>
        </div>

        {/* Tutors */}
        <div className="flex items-end gap-4 md:gap-6 mb-10">
          {TUTORS.map((tutor, i) => (
            <div key={tutor.id} style={{ transform: `translateY(${i % 2 === 0 ? '0px' : '-8px'})` }}>
              <TutorCard src={tutor.src} name={tutor.name} delay={i} />
            </div>
          ))}
        </div>

        {/* Headline */}
        <div className="text-center mb-8 max-w-lg">
          <h1 className={`text-4xl md:text-5xl font-extrabold leading-tight mb-4 ${textPrimary}`}>
            Stiamo arrivando.{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Presto.</span>
          </h1>
          <p className={`text-base md:text-lg leading-relaxed ${textMuted}`}>
            I tuoi tutor AI personali stanno facendo i bagagli. Iscriviti e sarai il primo a sapere quando apriamo.
          </p>
        </div>

        {/* Card */}
        <div className={`w-full max-w-sm rounded-2xl p-6 border transition-all duration-[2000ms] ${cardBg}`}>

          {/* Tab switcher */}
          <div className={`flex rounded-xl p-1 mb-5 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
            {(['waitlist', 'login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setAuthError(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === m ? 'bg-indigo-600 text-white shadow' : `${textMuted} hover:opacity-80`}`}
              >
                {m === 'waitlist' ? 'Waitlist' : m === 'login' ? 'Accedi' : 'Registrati'}
              </button>
            ))}
          </div>

          {/* Waitlist tab */}
          {mode === 'waitlist' && (
            <>
              {waitlistStatus === 'success' ? (
                <div className="text-center py-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className={`font-semibold mb-1 ${textPrimary}`}>Sei nella lista!</p>
                  <p className={`text-sm ${textMuted}`}>Ti avviseremo non appena apriamo.</p>
                </div>
              ) : waitlistStatus === 'duplicate' ? (
                <div className="text-center py-3">
                  <p className={`font-semibold mb-1 ${textPrimary}`}>Sei già iscritto!</p>
                  <p className={`text-sm ${textMuted}`}>Questa email è già nella lista d'attesa.</p>
                </div>
              ) : (
                <form onSubmit={handleWaitlist}>
                  <p className={`text-sm font-semibold mb-3 ${textSub}`}>Entra nella lista d'attesa</p>
                  <div className="flex gap-2">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="la-tua@email.com"
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputCls}`} />
                    <button type="submit" disabled={waitlistStatus === 'loading'}
                      className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center text-white transition-colors shrink-0 disabled:opacity-70">
                      {waitlistStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  {waitlistStatus === 'error' && <p className="text-xs text-red-400 mt-2">Qualcosa è andato storto. Riprova.</p>}
                  <p className={`text-xs mt-3 ${textMuted}`}>Nessuno spam. Solo un'email quando siamo pronti.</p>
                </form>
              )}
            </>
          )}

          {/* Login / Signup tab */}
          {(mode === 'login' || mode === 'signup') && (
            <form onSubmit={handleAuth} className="space-y-3">
              {mode === 'signup' && (
                <input type="text" required value={authName} onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Il tuo nome"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputCls}`} />
              )}
              <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputCls}`} />
              <input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputCls}`} />

              {authError && <p className="text-xs text-red-400">{authError}</p>}

              <button type="submit" disabled={authLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 transition-colors">
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{mode === 'login' ? 'Accedi' : 'Registrati'} <ChevronRight className="w-4 h-4" /></>}
              </button>

              <div className="flex items-center gap-2 my-1">
                <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                <span className={`text-xs ${textMuted}`}>oppure</span>
                <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              </div>

              <button type="button" onClick={handleGoogle} disabled={googleLoading}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'}`}>
                {googleLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continua con Google</>
                }
              </button>
            </form>
          )}
        </div>

        <p className={`mt-10 text-xs ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
          © 2026 ChatLingo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
