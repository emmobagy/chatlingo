'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MessageCircle, Send, Check, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TUTORS = [
  { id: 't1', src: '/tutors/Tutor-2.png', name: 'Sofia' },
  { id: 't2', src: '/tutors/Tutor-4.png', name: 'Amara' },
  { id: 't5', src: '/tutors/Tutor-1.png', name: 'James' },
  { id: 't3', src: '/tutors/Tutor-6.png', name: 'Yuki' },
  { id: 't6', src: '/tutors/Tutor-3.png', name: 'Marcus' },
];

// Tutor card with wave + blink animation
function TutorCard({ src, name, delay }: { src: string; name: string; delay: number }) {
  const [blinking, setBlinking] = useState(false);
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    // Blink loop
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 2500 + delay * 300 + Math.random() * 2000);

    // Wave loop
    const waveTimeout = setTimeout(() => {
      const waveInterval = setInterval(() => {
        setWaving(true);
        setTimeout(() => setWaving(false), 1200);
      }, 4000 + delay * 500);
      return () => clearInterval(waveInterval);
    }, delay * 600);

    return () => {
      clearInterval(blinkInterval);
      clearTimeout(waveTimeout);
    };
  }, [delay]);

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ animationDelay: `${delay * 0.15}s` }}
    >
      {/* Glow ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 blur-md opacity-40 scale-110" />
        <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-xl transition-transform duration-300 ${waving ? 'scale-110' : 'scale-100'}`}>
          <Image src={src} alt={name} fill className="object-cover object-top" />
          {/* Eye blink overlay */}
          {blinking && (
            <div className="absolute inset-0 flex flex-col justify-[33%] items-center pointer-events-none">
              <div className="flex gap-[28%] mt-[30%]">
                <div className="w-[18%] h-[4%] bg-[#c8a882] rounded-full" style={{ aspectRatio: '2/1' }} />
                <div className="w-[18%] h-[4%] bg-[#c8a882] rounded-full" style={{ aspectRatio: '2/1' }} />
              </div>
            </div>
          )}
        </div>
        {/* Wave hand emoji */}
        <div className={`absolute -top-1 -right-1 text-lg transition-all duration-300 ${waving ? 'opacity-100 translate-y-0 rotate-12' : 'opacity-0 translate-y-2 rotate-0'}`}>
          👋
        </div>
      </div>
      <span className="mt-2 text-xs font-medium text-white/70">{name}</span>
    </div>
  );
}

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');
  const [isDark, setIsDark] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Alternate dark/light every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => setIsDark((d) => !d), 8000);
    return () => clearInterval(interval);
  }, []);

  // Swap video src on theme change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = isDark ? '/bg-dark.mp4' : '/bg-light.mp4';
      videoRef.current.play().catch(() => {});
    }
  }, [isDark]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    try {
      const q = query(collection(db, 'waitlist'), where('email', '==', email.toLowerCase().trim()));
      const existing = await getDocs(q);
      if (!existing.empty) { setStatus('duplicate'); return; }

      await addDoc(collection(db, 'waitlist'), {
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        source: 'coming-soon',
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-[2000ms] ${isDark ? 'bg-[#0f172a]' : 'bg-[#eef2ff]'}`}>

      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        src="/bg-light.mp4"
        className="absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity duration-[2000ms]"
      />

      {/* Gradient overlay */}
      <div className={`absolute inset-0 transition-all duration-[2000ms] ${
        isDark
          ? 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b]/80 to-[#312e81]/60'
          : 'bg-gradient-to-br from-[#eef2ff]/90 via-[#e0e7ff]/70 to-[#c7d2fe]/50'
      }`} />

      {/* Decorative blobs */}
      <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl transition-all duration-[2000ms] ${isDark ? 'bg-indigo-600/20' : 'bg-indigo-400/20'}`} />
      <div className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl transition-all duration-[2000ms] ${isDark ? 'bg-violet-600/20' : 'bg-violet-400/20'}`} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className={`text-2xl font-extrabold tracking-tight transition-colors duration-[2000ms] ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ChatLingo
          </span>
        </div>

        {/* Tutors row */}
        <div className="flex items-end gap-4 md:gap-6 mb-12">
          {TUTORS.map((tutor, i) => (
            <div
              key={tutor.id}
              className="animate-bounce-subtle"
              style={{
                animationDelay: `${i * 0.2}s`,
                transform: `translateY(${i % 2 === 0 ? '0px' : '-8px'})`,
              }}
            >
              <TutorCard src={tutor.src} name={tutor.name} delay={i} />
            </div>
          ))}
        </div>

        {/* Headline */}
        <div className="text-center mb-4 max-w-lg">
          <h1 className={`text-4xl md:text-5xl font-extrabold leading-tight mb-4 transition-colors duration-[2000ms] ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Stiamo arrivando.{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Presto.
            </span>
          </h1>
          <p className={`text-base md:text-lg leading-relaxed transition-colors duration-[2000ms] ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            I tuoi tutor AI personali stanno facendo i bagagli. Iscriviti alla lista d'attesa e sarai il primo a sapere quando apriamo.
          </p>
        </div>

        {/* Waitlist form */}
        <div className={`w-full max-w-sm mt-8 rounded-2xl p-6 border transition-all duration-[2000ms] ${
          isDark
            ? 'bg-white/5 border-white/10 backdrop-blur-xl'
            : 'bg-white/70 border-indigo-100 backdrop-blur-xl shadow-xl shadow-indigo-100'
        }`}>
          {status === 'success' ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sei nella lista!</p>
              <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-400'}`}>Ti avviseremo non appena apriamo.</p>
            </div>
          ) : status === 'duplicate' ? (
            <div className="text-center py-2">
              <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sei già iscritto!</p>
              <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-400'}`}>Questa email è già nella lista d'attesa.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                Entra nella lista d'attesa
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="la-tua@email.com"
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-indigo-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center text-white transition-colors shrink-0 disabled:opacity-70"
                >
                  {status === 'loading'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
              {status === 'error' && (
                <p className="text-xs text-red-400 mt-2">Qualcosa è andato storto. Riprova.</p>
              )}
              <p className={`text-xs mt-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                Nessuno spam. Solo un'email quando siamo pronti.
              </p>
            </form>
          )}
        </div>

        {/* Bottom tag */}
        <p className={`mt-12 text-xs transition-colors duration-[2000ms] ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
          © 2026 ChatLingo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
