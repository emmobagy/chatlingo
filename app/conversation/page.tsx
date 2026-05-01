'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Volume2, VolumeX, Camera, CameraOff, PhoneOff, Copy, Download, Check, Subtitles, ChevronLeft, Sparkles, Languages, History, Pencil } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getConversationTranslations, ConversationTranslations } from '@/lib/conversationTranslations';
import { trackConversationUsage } from '@/lib/trackApiUsage';
import { checkConversationAbuse } from '@/lib/detectSuspicious';
import { getTutorAvatar } from '@/lib/tutorAvatars';
import { localDateStr } from '@/lib/localDate';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useLiveSession } from '@/hooks/useLiveSession';
import {
  DisplayMessage, LANG_NAMES, extractWrongPhrases, filterReasoning, stripHardTags, saveTranscript, ConversationMeta,
} from '@/lib/conversationUtils';

// ── Render tutor bubble: highlights **corrections** and /phonetics/ ───────────
function TutorBubble({ text }: { text: string }) {
  const raw = filterReasoning(stripHardTags(text));
  if (!raw) return null;

  const segments = raw.split(/(\*\*[^*]+\*\*|\/[^/\s][^/]*\/)/g);

  return (
    <p className="leading-relaxed text-sm whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (/^\*\*[^*]+\*\*$/.test(seg)) {
          return (
            <mark key={i} className="bg-amber-200 text-amber-900 dark:bg-amber-400/30 dark:text-amber-100 rounded px-1 font-semibold not-italic">
              {seg.replace(/^\*\*|\*\*$/g, '')}
            </mark>
          );
        }
        if (/^\/[^/\s][^/]*\/$/.test(seg)) {
          return (
            <span key={i} className="bg-indigo-100 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-300 rounded px-1 font-mono text-xs">
              {seg}
            </span>
          );
        }
        return <span key={i}>{seg}</span>;
      })}
    </p>
  );
}

// ── Render user bubble: highlights [WRONG:phrase] errors in red ───────────────
function UserBubble({ text, wrongPhrases }: { text: string; wrongPhrases: string[] }) {
  if (wrongPhrases.length === 0) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>;
  }
  const escaped = wrongPhrases.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <mark key={i} className="bg-red-200 text-red-800 dark:bg-red-500/40 dark:text-red-200 rounded px-0.5 font-medium not-italic">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

// ── Per-tutor facial landmark calibration (% of panel height/width) ──────────
// mouth: [cx%, cy%]  eyes: [leftCx%, rightCx%, cy%]  eyeRx%, eyeRy%
const TUTOR_FACE: Record<string, { mCx: number; mCy: number; eLx: number; eRxPos: number; eCy: number; eElRx: number; eElRy: number }> = {
  't1': { mCx: 50, mCy: 66, eLx: 37, eRxPos: 63, eCy: 33, eElRx: 8,   eElRy: 4.5 },
  't2': { mCx: 50, mCy: 65, eLx: 37, eRxPos: 63, eCy: 33, eElRx: 8,   eElRy: 4.5 },
  't3': { mCx: 50, mCy: 66, eLx: 38, eRxPos: 62, eCy: 33, eElRx: 7.5, eElRy: 4   },
  't4': { mCx: 50, mCy: 66, eLx: 37, eRxPos: 63, eCy: 33, eElRx: 8,   eElRy: 4.5 },
  't5': { mCx: 50, mCy: 65, eLx: 37, eRxPos: 63, eCy: 32, eElRx: 8,   eElRy: 4.5 },
  't6': { mCx: 50, mCy: 65, eLx: 37, eRxPos: 63, eCy: 32, eElRx: 8,   eElRy: 4.5 },
  't7': { mCx: 50, mCy: 65, eLx: 38, eRxPos: 62, eCy: 32, eElRx: 7.5, eElRy: 4   },
  't8': { mCx: 50, mCy: 65, eLx: 37, eRxPos: 63, eCy: 32, eElRx: 8,   eElRy: 4.5 },
};
const DEFAULT_FACE = { mCx: 50, mCy: 66, eLx: 37, eRxPos: 63, eCy: 33, eElRx: 8, eElRy: 4.5 };

// ── Tutor face overlay: mouth + eye blink ─────────────────────────────────────
function TutorFaceOverlay({ mouthOpen, tutorId }: { mouthOpen: boolean; tutorId: string }) {
  const f = TUTOR_FACE[tutorId] ?? DEFAULT_FACE;
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function scheduleNext() {
      const delay = 2500 + Math.random() * 4000;
      setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        setTimeout(() => {
          if (cancelled) return;
          setBlinking(false);
          scheduleNext();
        }, 130);
      }, delay);
    }
    scheduleNext();
    return () => { cancelled = true; };
  }, []);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'multiply' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mouth open/close */}
      <ellipse
        cx={`${f.mCx}%`}
        cy={`${f.mCy}%`}
        rx="7%"
        style={{
          ry: mouthOpen ? '3.2%' : '0.4%',
          fill: 'rgba(18, 7, 4, 0.48)',
          transition: 'ry 75ms ease',
        } as React.CSSProperties}
      />
      {/* Left eyelid */}
      <ellipse
        cx={`${f.eLx}%`}
        cy={`${f.eCy}%`}
        rx={`${f.eElRx}%`}
        style={{
          ry: blinking ? `${f.eElRy}%` : '0%',
          fill: 'rgba(190, 145, 110, 0.88)',
          transition: 'ry 55ms ease',
        } as React.CSSProperties}
      />
      {/* Right eyelid */}
      <ellipse
        cx={`${f.eRxPos}%`}
        cy={`${f.eCy}%`}
        rx={`${f.eElRx}%`}
        style={{
          ry: blinking ? `${f.eElRy}%` : '0%',
          fill: 'rgba(190, 145, 110, 0.88)',
          transition: 'ry 55ms ease',
        } as React.CSSProperties}
      />
    </svg>
  );
}

// ── Sound bars constant ───────────────────────────────────────────────────────
const SOUND_BARS = [
  { delay: '0s',    height: '60%' },
  { delay: '0.15s', height: '100%' },
  { delay: '0.3s',  height: '45%' },
  { delay: '0.1s',  height: '80%' },
  { delay: '0.25s', height: '55%' },
];

// ── End screen ────────────────────────────────────────────────────────────────
function EndScreen({ messages, isAssessment, t, practiceDay, practiceTopic, phase, uid, convId }: {
  messages: DisplayMessage[];
  isAssessment: boolean;
  t: ConversationTranslations;
  practiceDay: number | null;
  practiceTopic: string | null;
  phase: string | null;
  uid: string | null;
  convId: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [chatName, setChatName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const router = useRouter();

  const cleanMessages = messages.map((m) => ({ ...m, content: stripHardTags(m.content) }));
  const transcriptText = cleanMessages.map((m) => `[${m.role === 'user' ? t.you : t.tutor}] ${m.content}`).join('\n\n');

  function handleCopy() {
    navigator.clipboard.writeText(transcriptText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function handleDownload() {
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatlingo-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSaveName() {
    if (!uid || !convId || !chatName.trim()) return;
    setNameSaving(true);
    await updateDoc(doc(db, 'users', uid, 'conversations', convId), { name: chatName.trim() }).catch(() => {});
    setNameSaving(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  }

  return (
    <div className="fixed inset-0 bg-[var(--app-bg)] flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--app-surface)] hover:bg-[var(--app-border)] border border-[var(--app-border)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--app-text)]" />
          </button>
          <h1 className="text-base font-bold text-[var(--app-text)]">{isAssessment ? t.assessmentComplete : t.sessionComplete}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1.5 bg-[var(--app-surface)] hover:bg-[var(--app-border)] text-[var(--app-text)] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-[var(--app-border)]">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t.copied : t.copy}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" /> {t.download}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <p className="text-xs text-[var(--app-muted)] text-center mb-3">{cleanMessages.length} {t.messages} · {new Date().toLocaleDateString()}</p>

        {(() => {
          const wrongPhrases = extractWrongPhrases(messages);
          return cleanMessages.map((m, i) => {
            const isUser = m.role === 'user';
            if (!isUser) {
              const visible = filterReasoning(stripHardTags(m.content));
              if (!visible) return null;
            }
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-3.5 py-2.5 ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-[var(--app-surface)] text-[var(--app-text)] rounded-bl-none border border-[var(--app-border)]'
                  }`}>
                    {isUser
                      ? <UserBubble text={m.content} wrongPhrases={wrongPhrases} />
                      : <TutorBubble text={m.content} />
                    }
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>

      <div className="px-4 py-5 border-t border-[var(--app-border)] space-y-3">
        {/* Name this chat */}
        {convId && uid && (
          <div className="flex gap-2 items-center">
            <div className="flex-1 flex items-center gap-2 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2">
              <Pencil className="w-3.5 h-3.5 text-[var(--app-muted)] shrink-0" />
              <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                placeholder={t.nameChatPlaceholder}
                maxLength={60}
                className="flex-1 bg-transparent text-sm text-[var(--app-text)] placeholder:text-[var(--app-muted)] outline-none"
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={!chatName.trim() || nameSaving}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1"
            >
              {nameSaved ? <Check className="w-3.5 h-3.5" /> : null}
              {nameSaved ? t.nameChatSaved : t.nameChatSave}
            </button>
          </div>
        )}

        {practiceDay && phase === 'review' && (
          <div className="text-center mb-1">
            <span className="text-2xl">🎉</span>
            <p className="text-white font-bold text-lg">{t.dayComplete}</p>
          </div>
        )}

        {practiceDay && phase !== 'review' && (
          <button
            onClick={() => router.push(`/conversation?topic=${practiceTopic}&day=${practiceDay}&phase=review`)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-2xl transition-colors"
          >
            {t.startReviewTest}
          </button>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => router.push(practiceDay && phase === 'review' ? '/practice' : '/dashboard')}
            className={`flex-1 font-semibold py-3 rounded-2xl transition-colors ${
              practiceDay && phase !== 'review'
                ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {practiceDay && phase === 'review' ? t.backToPractice : t.backToDashboard}
          </button>
          <button
            onClick={() => router.push('/history')}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-colors bg-[var(--app-surface)] hover:bg-[var(--app-border)] text-[var(--app-text)] border border-[var(--app-border)]"
          >
            <History className="w-4 h-4" />
            {t.history}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ConversationPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const { uiLang } = useUILanguage();
  const { theme } = useTheme();
  const t = getConversationTranslations(uiLang);
  const router = useRouter();

  // Query params
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const reviewWords = searchParams?.get('review')?.split(',').filter(Boolean) ?? [];
  const practiceTopic = searchParams?.get('topic') ?? null;
  const practiceDay = searchParams?.get('day') ? parseInt(searchParams.get('day')!) : null;
  const pronunciationId = searchParams?.get('pronunciation') ?? null;
  const scenarioId = searchParams?.get('scenario') ?? null;
  const phase = searchParams?.get('phase') ?? null;

  const isAdmin = userProfile?.role === 'admin';
  const isAssessment = false;
  const tutorName = userProfile?.tutor?.name ?? 'Sofia';
  const tutorAvatarSrc = getTutorAvatar(userProfile?.tutor?.id);
  // If the user is learning English and has chosen an accent, use the accent code
  // so the system prompt says "British English" / "American English" / "Australian English"
  const targetLang = (() => {
    const base = userProfile?.targetLanguage ?? 'en';
    if (base === 'en' && userProfile?.accent) return userProfile.accent;
    return base;
  })();
  const nativeLang = userProfile?.nativeLanguage ?? 'it';

  // Camera display element ref — passed into the hook
  const videoRef = useRef<HTMLVideoElement>(null);

  // Live session hook
  const {
    isLive, isConnecting, isTutorSpeaking, mouthOpen, isMuted, setIsMuted,
    messages, liveTranscript, error, sessionSeconds, nativeHelpActive,
    cameraOn, cameraError, sessionStartRef, messagesRef, savedRef,
    startLive, stopLive, toggleMute, requestNativeHelp, toggleCamera,
  } = useLiveSession({
    user: user ?? null,
    userProfile: userProfile ?? null,
    uiLang, targetLang, nativeLang, tutorName,
    scenarioId, practiceTopic, pronunciationId, reviewWords, practiceDay, phase,
    videoRef,
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showEnd, setShowEnd] = useState(false);
  const [savedConvId, setSavedConvId] = useState<string | null>(null);
  const [exitPending, setExitPending] = useState<(() => void) | null>(null);
  const [showTranscript, setShowTranscript] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatlingo_show_transcript');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // PiP corner
  type PipCorner = 'tr' | 'tl' | 'br' | 'bl';
  const [pipCorner, setPipCorner] = useState<PipCorner>(() => {
    try { return (localStorage.getItem('cl-pip-corner') as PipCorner) ?? 'tr'; } catch { return 'tr'; }
  });
  const pipDragRef = useRef<{ startX: number; startY: number } | null>(null);
  const [pipSnapping, setPipSnapping] = useState(false);
  const pipSnapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown
  const autoStartedRef = useRef(false);
  const startLiveCalledRef = useRef(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Background video
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const bgVideoAltRef = useRef<HTMLVideoElement>(null);
  const [bgVideoError, setBgVideoError] = useState(false);
  const [bgActiveSlot, setBgActiveSlot] = useState<0 | 1>(0);
  const bgActiveSlotRef = useRef<0 | 1>(0);
  const crossfadingRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  function fmtTimer(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  const PIP_POSITIONS: Record<PipCorner, string> = {
    tr: 'top-2.5 right-2.5',
    tl: 'top-2.5 left-2.5',
    br: 'bottom-16 right-2.5',
    bl: 'bottom-16 left-2.5',
  };

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { if (!user) router.push('/login'); }, [user, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user || !userProfile || autoStartedRef.current) return;
    autoStartedRef.current = true;
    setCountdown(3);
  }, [user, userProfile]);

  // Countdown tick
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      if (!startLiveCalledRef.current) {
        startLiveCalledRef.current = true;
        playBeep('go');
        const t = setTimeout(() => { setCountdown(null); startLive(); }, 1000);
        return () => clearTimeout(t);
      }
      return;
    }
    playBeep('tick');
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Confirm before leaving mid-conversation
  useEffect(() => {
    if (!isLive) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isLive]);

  // Unmount cleanup for UI resources only (session cleanup is inside the hook)
  useEffect(() => () => {
    bgVideoRef.current?.pause();
    bgVideoAltRef.current?.pause();
    if (pipSnapTimerRef.current) clearTimeout(pipSnapTimerRef.current);
  }, []);

  // Background video: reset on theme change
  useEffect(() => { bgActiveSlotRef.current = bgActiveSlot; }, [bgActiveSlot]);

  useEffect(() => {
    if (bgVideoError) return;
    crossfadingRef.current = false;
    setBgActiveSlot(0);
    bgActiveSlotRef.current = 0;
    if (bgVideoAltRef.current) { bgVideoAltRef.current.currentTime = 0; bgVideoAltRef.current.pause(); }
    const v = bgVideoRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
  }, [theme, bgVideoError]);

  // ── PiP drag ──────────────────────────────────────────────────────────────
  function onPipPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pipDragRef.current = { startX: e.clientX, startY: e.clientY };
  }

  function onPipPointerUp(e: React.PointerEvent) {
    if (!pipDragRef.current) return;
    const dx = e.clientX - pipDragRef.current.startX;
    const dy = e.clientY - pipDragRef.current.startY;
    pipDragRef.current = null;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    const right = dx > 0;
    const bottom = dy > 0;
    const corner: PipCorner = bottom ? (right ? 'br' : 'bl') : (right ? 'tr' : 'tl');
    setPipCorner(corner);
    try { localStorage.setItem('cl-pip-corner', corner); } catch {}
    setPipSnapping(true);
    if (pipSnapTimerRef.current) clearTimeout(pipSnapTimerRef.current);
    pipSnapTimerRef.current = setTimeout(() => setPipSnapping(false), 350);
  }

  // ── confirmExit ───────────────────────────────────────────────────────────
  function confirmExit(action: () => void) {
    if (!isLive) { action(); return; }
    setExitPending(() => action);
  }

  // ── End call ──────────────────────────────────────────────────────────────
  async function handleEndCall() {
    bgVideoRef.current?.pause();
    bgVideoAltRef.current?.pause();
    stopLive();
    if (user && !savedRef.current) {
      savedRef.current = true;
      const meta: ConversationMeta = { scenarioId, practiceTopic, pronunciationId, phase };
      const convId = await saveTranscript(user.uid, messagesRef.current, isAssessment, meta).catch(() => null);
      if (convId) setSavedConvId(convId);

      if (!isAdmin && isAssessment) {
        await updateDoc(doc(db, 'users', user.uid), { trialUsed: true }).catch(() => {});
      }

      const elapsedMs = sessionStartRef.current ? Date.now() - sessionStartRef.current : 0;
      const elapsedSec = Math.round(elapsedMs / 1000);
      if (elapsedSec < 5) return;

      const today = localDateStr();
      const lastActive = userProfile?.stats?.lastActiveDate ?? '';
      const prevStats = userProfile?.stats as Record<string, unknown> | undefined;
      const previousSeconds = lastActive === today
        ? ((prevStats?.secondsToday as number | undefined) ?? 0)
        : 0;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = localDateStr(yesterday);
      const currentStreak = userProfile?.stats?.streak ?? 0;
      const newStreak = lastActive === today
        ? currentStreak
        : lastActive === yesterdayStr
          ? currentStreak + 1
          : 1;
      const newLongest = Math.max(newStreak, userProfile?.stats?.longestStreak ?? 0);

      const isSameWeek = (a: string, b: string) => {
        if (!a) return false;
        const d = (s: string) => { const x = new Date(s); const day = x.getDay(); x.setDate(x.getDate() - (day === 0 ? 6 : day - 1)); return localDateStr(x); };
        return d(a) === d(b);
      };
      const isSameMonth = (a: string, b: string) => a.slice(0, 7) === b.slice(0, 7);

      const prevWeekly = isSameWeek(lastActive, today) ? (userProfile?.stats?.conversationsThisWeek ?? 0) : 0;
      const prevMonthly = isSameMonth(lastActive, today) ? (userProfile?.stats?.conversationsThisMonth ?? 0) : 0;

      const correctionsInSession = messagesRef.current.filter((m) => m.role === 'assistant' && /\[WRONG:/i.test(m.content)).length;

      const prevSecondsForDay = ((prevStats?.secondsByDay as Record<string, number> | undefined))?.[today] ?? 0;
      const totalSecondsToday = previousSeconds + elapsedSec;
      await updateDoc(doc(db, 'users', user.uid), {
        'stats.totalConversations': (userProfile?.stats?.totalConversations ?? 0) + 1,
        'stats.conversationsToday': lastActive === today ? (userProfile?.stats?.conversationsToday ?? 0) + 1 : 1,
        'stats.conversationsThisWeek': prevWeekly + 1,
        'stats.conversationsThisMonth': prevMonthly + 1,
        'stats.secondsToday': totalSecondsToday,
        'stats.secondsTotal': ((prevStats?.secondsTotal as number | undefined) ?? 0) + elapsedSec,
        [`stats.secondsByDay.${today}`]: prevSecondsForDay + elapsedSec,
        'stats.minutesToday': Math.floor(totalSecondsToday / 60),
        'stats.streak': newStreak,
        'stats.longestStreak': newLongest,
        'stats.lastActiveDate': today,
        'stats.correctionsReceived': (userProfile?.stats?.correctionsReceived ?? 0) + correctionsInSession,
      }).catch(() => {});

      if (practiceDay && phase === 'review') {
        const currentProgress = userProfile?.practiceProgress;
        const nextDay = Math.max((currentProgress?.currentDay ?? 1), practiceDay + 1);
        await updateDoc(doc(db, 'users', user.uid), {
          'practiceProgress.completedDays': arrayUnion(practiceDay),
          'practiceProgress.currentDay': nextDay,
          'practiceProgress.lastPracticeDate': today,
          'practiceProgress.phase': 'fluency',
        }).catch(() => {});
      }

      await refreshProfile();

      const durationMin = elapsedMs / 60000;
      if (durationMin > 0) trackConversationUsage(durationMin);

      if (!isAdmin) {
        const newConvCount = lastActive === today
          ? (userProfile?.stats?.conversationsToday ?? 0) + 1 : 1;
        checkConversationAbuse({
          uid: user.uid,
          email: user.email,
          conversationsToday: newConvCount,
          sessionMinutes: durationMin,
        });
      }
    }
    setShowEnd(true);
  }

  // ── Beep sounds for countdown ─────────────────────────────────────────────
  function playBeep(type: 'tick' | 'go') {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'tick') {
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.frequency.value = 1320;
        gain.gain.setValueAtTime(0.28, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
      osc.onended = () => ctx.close();
    } catch { /* AudioContext may be unavailable */ }
  }

  // ── End screen ────────────────────────────────────────────────────────────
  if (showEnd) return <EndScreen messages={messages} isAssessment={isAssessment} t={t} practiceDay={practiceDay} practiceTopic={practiceTopic} phase={phase} uid={user?.uid ?? null} convId={savedConvId} />;

  const wrongPhrases = extractWrongPhrases(messagesRef.current);

  return (
    <div className="h-screen text-white flex flex-col overflow-hidden select-none">

      {/* ── Countdown overlay ─────────────────────────────────────────────── */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.92) 0%, rgba(139,92,246,0.92) 100%)', backdropFilter: 'blur(16px)' }}
        >
          {countdown === 0 ? (
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl font-extrabold text-white tracking-tight animate-pulse">Via!</span>
              <p className="text-white/70 text-sm">Connessione in corso…</p>
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-center w-36 h-36 mb-8">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                  <circle
                    cx="72" cy="72" r="64" fill="none"
                    stroke="white" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 64}`}
                    strokeDashoffset={`${2 * Math.PI * 64 * (1 - countdown / 3)}`}
                    style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                  />
                </svg>
                <span className="text-7xl font-extrabold text-white tracking-tight">
                  {countdown}
                </span>
              </div>
              <p className="text-white/90 text-lg font-semibold tracking-wide">La conversazione sta per iniziare</p>
              <p className="text-white/55 text-sm mt-1">Preparati a parlare</p>
              <button
                onClick={() => {
                  if (!startLiveCalledRef.current) {
                    startLiveCalledRef.current = true;
                    setCountdown(null);
                    startLive();
                  }
                }}
                className="mt-8 px-6 py-2.5 rounded-full border border-white/30 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                Salta
              </button>
            </>
          )}
        </div>
      )}

      {/* ── TOP: Video Call Area ─────────────────────────────────────────── */}
      <div className="relative flex-[1.1] min-h-0 overflow-hidden">

        {/* ── Animated video background ── */}
        {!bgVideoError ? (
          <>
            {([bgVideoRef, bgVideoAltRef] as React.RefObject<HTMLVideoElement>[]).map((ref, slot) => (
              <video
                key={slot}
                ref={ref}
                className="absolute inset-0 z-0 w-full h-full object-cover"
                style={{
                  opacity: bgActiveSlot === slot ? 1 : 0,
                  transition: 'opacity 1.5s ease',
                  pointerEvents: 'none',
                }}
                src={theme === 'dark' ? '/bg-dark.mp4' : '/bg-light.mp4'}
                muted
                playsInline
                onError={() => setBgVideoError(true)}
                onTimeUpdate={() => {
                  const vid = ref.current;
                  if (!vid || vid.duration === 0) return;
                  if (crossfadingRef.current) return;
                  const remaining = vid.duration - vid.currentTime;
                  if (remaining < 1.8 && bgActiveSlotRef.current === slot) {
                    crossfadingRef.current = true;
                    const nextSlot = (slot === 0 ? 1 : 0) as 0 | 1;
                    const nextVid = nextSlot === 0 ? bgVideoRef.current : bgVideoAltRef.current;
                    if (nextVid) {
                      nextVid.currentTime = 0;
                      nextVid.play().catch(() => {});
                    }
                    setBgActiveSlot(nextSlot);
                    bgActiveSlotRef.current = nextSlot;
                    setTimeout(() => { crossfadingRef.current = false; }, 2000);
                  }
                }}
              />
            ))}
          </>
        ) : (
          <div className="absolute inset-0 z-0" style={{
            background: 'linear-gradient(300deg, deepskyblue, darkviolet, blue)',
            backgroundSize: '180% 180%',
            animation: 'gradient-animation 18s ease infinite',
          }} />
        )}
        <div className="absolute inset-0 z-0 bg-black/20" />

        {/* Speaking glow on background */}
        <div className={`absolute inset-0 z-0 pointer-events-none transition-all duration-700 ${isTutorSpeaking ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,102,241,0.35) 0%, transparent 70%)', animation: isTutorSpeaking ? 'tutor-glow-pulse 1.4s ease-in-out infinite' : 'none' }}
        />

        {/* ── Back button ── */}
        <button
          onClick={() => confirmExit(async () => { await handleEndCall(); router.push('/dashboard'); })}
          className="absolute top-3 left-4 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* ── Central tutor panel ── */}
        <div className="absolute inset-0 z-10 flex items-stretch justify-center">
          <div
            className="relative h-full overflow-hidden"
            style={{
              width: 'min(320px, 52vw)',
              boxShadow: isTutorSpeaking
                ? '0 0 0 2px rgba(99,102,241,0.7), 0 0 40px 12px rgba(99,102,241,0.4), 0 0 80px 24px rgba(139,92,246,0.2)'
                : '0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)',
              transition: 'box-shadow 0.5s ease',
            }}
          >
            {/* Tutor image */}
            <div
              className="absolute inset-0"
              style={{ animation: isTutorSpeaking ? 'tutor-breathe 1.8s ease-in-out infinite' : 'none' }}
            >
              <Image src={tutorAvatarSrc} alt="tutor" fill className="object-cover object-top" sizes="320px" priority />
            </div>

            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.8) 100%)',
            }} />

            {isTutorSpeaking && (
              <div className="absolute inset-0 pointer-events-none rounded-b-3xl" style={{
                background: 'radial-gradient(ellipse 100% 40% at 50% 100%, rgba(99,102,241,0.35) 0%, transparent 70%)',
                animation: 'tutor-glow-pulse 1.2s ease-in-out infinite',
              }} />
            )}

            {/* Timer */}
            <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
              {isLive       && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
              {isConnecting && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
              {!isLive && !isConnecting && <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />}
              <span className="text-[11px] font-mono font-bold text-white">
                {isLive ? fmtTimer(sessionSeconds) : isConnecting ? t.connecting : 'Ready'}
              </span>
            </div>

            {/* User camera PiP */}
            <div
              className={`absolute z-20 w-20 h-[108px] sm:w-24 sm:h-[128px] rounded-xl overflow-hidden shadow-lg cursor-grab active:cursor-grabbing touch-none transition-all duration-200 ${PIP_POSITIONS[pipCorner]} ${pipSnapping ? 'pip-snap' : ''} ${
                cameraOn ? 'border border-white/30' : 'border border-white/10'
              }`}
              onPointerDown={onPipPointerDown}
              onPointerUp={onPipPointerUp}
              title="Trascina per spostare"
            >
              {cameraOn ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1] pointer-events-none" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-800/70 backdrop-blur-sm">
                  <div className="w-7 h-7 rounded-full bg-indigo-700/80 flex items-center justify-center text-[10px] font-bold text-white">
                    {(userProfile?.displayName ?? user?.email ?? '?').slice(0, 2).toUpperCase()}
                  </div>
                  <CameraOff className="w-2.5 h-2.5 text-gray-400" />
                </div>
              )}
            </div>

            {/* Tutor name + status */}
            <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center z-10 pointer-events-none px-2">
              <p className="text-base font-bold text-white tracking-wide drop-shadow-lg">{tutorName}</p>
              <div className="flex items-center gap-1 mt-0.5 h-4">
                {isConnecting && (
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 border-2 border-yellow-400/50 border-t-yellow-400 rounded-full animate-spin" />
                    <span className="text-[10px] text-yellow-300">{t.connecting}</span>
                  </div>
                )}
                {isLive && isTutorSpeaking && (
                  <div className="flex items-center gap-[2px]">
                    {SOUND_BARS.map((bar, i) => (
                      <div key={i} className="w-[2px] rounded-full bg-indigo-300"
                        style={{ height: bar.height, animation: 'sound-wave 0.8s ease-in-out infinite', animationDelay: bar.delay }} />
                    ))}
                  </div>
                )}
                {isLive && !isTutorSpeaking && !isConnecting && isMuted && (
                  <div className="flex items-center gap-1">
                    <MicOff className="w-2.5 h-2.5 text-red-400" />
                    <span className="text-[10px] text-red-300 font-medium">Muted</span>
                  </div>
                )}
                {isLive && !isTutorSpeaking && !isConnecting && !isMuted && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
                    <span className="text-[10px] text-indigo-200 font-medium">Listening…</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 z-10">
              <button
                onClick={toggleMute}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shadow-lg ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => confirmExit(handleEndCall)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-400 transition-all duration-200 shadow-xl shadow-red-900/40 active:scale-95"
              >
                <PhoneOff className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={toggleCamera}
                title={cameraError ? 'Camera not available' : cameraOn ? 'Turn off camera' : 'Turn on camera'}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shadow-lg ${
                  cameraOn ? 'bg-indigo-600/80 text-white' : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70'
                }`}
              >
                {cameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              </button>

              <button
                onClick={requestNativeHelp}
                disabled={nativeHelpActive}
                title={`Non ho capito — ripeti in ${LANG_NAMES[nativeLang] ?? nativeLang}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shadow-lg ${
                  nativeHelpActive
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70'
                }`}
              >
                <Languages className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowTranscript((v) => {
                  const next = !v;
                  localStorage.setItem('chatlingo_show_transcript', String(next));
                  return next;
                })}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shadow-lg ${
                  showTranscript ? 'bg-indigo-600 text-white' : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70'
                }`}
                title={showTranscript ? 'Hide transcript' : 'Show transcript'}
              >
                <Subtitles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Chat Area ────────────────────────────────────────────── */}
      <div className="flex flex-col bg-[var(--app-surface)]/95 backdrop-blur-md min-h-0" style={{ flex: '0.9' }}>

        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--app-border)] flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--app-text)] leading-tight">{tutorName}</p>
            <p className="text-[11px] text-[var(--app-muted)]">
              {nativeHelpActive
                ? <span className="text-amber-500 font-semibold dark:text-amber-400">{(LANG_NAMES[nativeLang] ?? nativeLang).toUpperCase()} · aiuto</span>
                : <span>{userProfile?.targetLanguage?.toUpperCase() ?? 'EN'} · {userProfile?.level ?? 'A1'}</span>
              }
              {' · '}
              {isLive ? <span className="text-green-600 dark:text-green-400">Live</span> : isConnecting ? <span className="text-yellow-600 dark:text-yellow-400">{t.connecting}</span> : 'Ready'}
            </p>
          </div>
        </div>

        {showTranscript && (
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
            {messages.length === 0 && (
              <p className="text-center text-[var(--app-muted)] text-xs mt-4">
                {isConnecting ? t.connecting : isLive ? 'Session started…' : t.startConversation}
              </p>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              if (!isUser) {
                const visible = filterReasoning(stripHardTags(msg.content));
                if (!visible) return null;
              }
              return (
                <div key={i} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center shrink-0 mb-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-[var(--app-bg)] text-[var(--app-text)] rounded-bl-sm border border-[var(--app-border)]'
                  }`}>
                    {isUser
                      ? <UserBubble text={msg.content} wrongPhrases={wrongPhrases} />
                      : <TutorBubble text={msg.content} />
                    }
                  </div>
                </div>
              );
            })}

            {liveTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[75%] bg-indigo-600/30 rounded-2xl rounded-br-sm px-3.5 py-2.5 border border-indigo-500/30">
                  <p className="text-sm text-[var(--app-muted)] italic">{liveTranscript}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-[var(--app-border)]">
          {error && (
            <div className="mb-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700/40 rounded-xl text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          <div className="flex items-center gap-3 bg-[var(--app-bg)] rounded-2xl px-4 py-3 border border-[var(--app-border)]">
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              isLive ? 'bg-green-500 animate-pulse' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-[var(--app-muted)]'
            }`} />
            <span className="text-sm text-[var(--app-muted)] flex-1 truncate">
              {isMuted
                ? 'Muted, tap mic to unmute'
                : liveTranscript
                  ? liveTranscript
                  : isLive
                    ? 'Speak now…'
                    : isConnecting
                      ? t.connecting
                      : 'Tap the mic button to start'
              }
            </span>
            {isMuted && isLive && (
              <button
                onClick={() => setIsMuted(false)}
                className="shrink-0 px-2.5 py-1 bg-indigo-600 rounded-xl text-xs text-white hover:bg-indigo-700 transition-colors"
              >
                Unmute
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Exit confirmation modal ──────────────────────────────────────── */}
      {exitPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setExitPending(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="px-6 pt-6 pb-7">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center mb-4 mx-auto">
                <PhoneOff className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-[var(--app-text)] font-bold text-lg text-center mb-1">End session?</h2>
              <p className="text-[var(--app-muted)] text-sm text-center mb-6">
                The conversation is in progress. Your progress will be saved.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setExitPending(null)}
                  className="flex-1 py-3 rounded-2xl bg-[var(--app-bg)] hover:bg-[var(--app-border)] text-[var(--app-text)] text-sm font-semibold transition-colors border border-[var(--app-border)]"
                >
                  Keep talking
                </button>
                <button
                  onClick={() => {
                    const action = exitPending;
                    setExitPending(null);
                    stopLive();
                    action?.();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-900/30 active:scale-95"
                >
                  End session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
