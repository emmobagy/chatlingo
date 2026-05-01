'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { MessageCircle, ChevronLeft, LogOut } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { CEFRLevel } from '@/types';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getOnboardingT } from '@/lib/onboardingTranslations';
import { TUTOR_AVATARS } from '@/lib/tutorAvatars';
import Image from 'next/image';

// ─── STEP TYPE ────────────────────────────────────────────────
type Step =
  | 'native-lang'
  | 'target-lang'
  | 'accent'
  | 'level'
  | 'vocab-quiz'
  | 'vocab-result'
  | 'focus'
  | 'background'
  | 'aspiration'
  | 'daily-time'
  | 'interests'
  | 'tutor'
  | 'tutor-name'
  | 'user-name'
  | 'loading';

// ─── DATA ─────────────────────────────────────────────────────
const LANGUAGES = [
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


const LEVELS = [
  { code: 'A1', emoji: '🌱', label: 'Total Beginner', desc: 'I know a few words' },
  { code: 'A2', emoji: '🪴', label: 'Beginner', desc: 'I can handle simple phrases' },
  { code: 'B1', emoji: '🌿', label: 'Pre-Intermediate', desc: 'I can hold basic conversations' },
  { code: 'B2', emoji: '🌳', label: 'Intermediate', desc: 'I speak with some confidence' },
  { code: 'C1', emoji: '🌲', label: 'Advanced', desc: 'I speak fluently most of the time' },
  { code: 'C2', emoji: '🎋', label: 'Mastery', desc: 'Near-native level' },
  { code: 'native', emoji: '🏆', label: 'Native speaker', desc: 'This is my mother tongue' },
];

const VOCAB_WORDS: Record<string, { a1: string[]; b1: string[]; c1: string[] }> = {
  en: {
    a1: ['apple','bag','bread','brother','bus','clean','cold','dance','door','easy','evening','friend','happy','jump','kitchen','laugh','morning','milk','next','open','quiet','river','smile','street','summer'],
    b1: ['arrange','attend','average','balance','cancel','challenge','competitor','confirm','convenient','curious','decrease','delay','depend','determine','disappointed','economy','enormous','equipment','estimate','experience','frequently','influence','maintain','mention','obvious'],
    c1: ['ambiguity','anecdote','coherent','compelling','complacent','conundrum','contentious','detrimental','disparity','disseminate','empirical','encapsulate','eradicate','euphemism','exacerbate','formidable','inadvertently','inconsequential','indispensable','inevitable'],
  },
  es: {
    a1: ['agua','amigo','casa','comer','día','familia','grande','hablar','libro','luz','mesa','niño','nombre','nuevo','pan','pequeño','persona','poder','tiempo','trabajo','ver','vida','vino','año','ciudad'],
    b1: ['acuerdo','ambiente','apoyar','asunto','cambiar','comentar','conseguir','construir','contrario','crecer','depender','desarrollar','diferente','emprender','esfuerzo','evaluar','evolución','explicar','generar','importante'],
    c1: ['ambigüedad','abordar','contemplar','conjetura','contundente','desconcertante','disminuir','equívoco','exacerbar','formidable','imprescindible','inadvertido','inevitable','ostensible','paradójico','perspicaz','pragmático','recalcitrante','subyacente','trascendental'],
  },
  fr: {
    a1: ['ami','an','arbre','blanc','bleu','bonjour','chien','eau','enfant','fleur','grand','jour','livre','maison','manger','mer','nuit','parler','père','petit','rouge','soleil','temps','venir','ville'],
    b1: ['accomplir','actuel','améliorer','analyser','atteindre','changer','comprendre','conclure','confier','contribuer','décrire','déterminer','développer','discuter','évaluer','expliquer','générer','identifier','nécessaire','obtenir'],
    c1: ['ambiguïté','approfondir','bienveillance','conjoncture','contraignant','déconcertant','désuet','équivoque','exacerber','incontournable','indispensable','perspicace','pragmatique','prépondérant','récalcitrant','sous-jacent','transcendant','vraisemblable','circonspect','paradoxal'],
  },
  de: {
    a1: ['Apfel','Buch','danke','drei','fahren','Haus','helfen','ich','ja','kaufen','kommen','lernen','Mutter','nein','offen','Schule','spielen','sprechen','Stadt','Tisch','trinken','Vater','Wasser','Zeit','zwei'],
    b1: ['anpassen','aufbauen','bedeuten','bestätigen','bewerben','darstellen','durchführen','entscheiden','erreichen','erklären','erneut','fortsetzen','gewinnen','herausfinden','klären','lösen','nachdenken','planen','steigern','übernehmen'],
    c1: ['Ambiguität','beharrlich','Dilemmata','eindeutig','erschöpfend','inadäquat','kohärent','komplex','kontrovers','maßgeblich','nachhaltig','paradox','prägnant','substanziell','tragfähig','überzeugend','unabdingbar','weitreichend','widersprüchlich','pragmatisch'],
  },
  it: {
    a1: ['acqua','amico','casa','mangiare','giorno','famiglia','grande','parlare','libro','luce','tavolo','bambino','nome','nuovo','pane','piccolo','persona','potere','tempo','lavoro','vedere','vita','vino','anno','città'],
    b1: ['accordo','ambiente','sostenere','questione','cambiare','commentare','ottenere','costruire','contrario','crescere','dipendere','sviluppare','diverso','intraprendere','sforzo','valutare','evoluzione','spiegare','generare','importante'],
    c1: ['ambiguità','affrontare','contemplare','congettura','contundente','sconcertante','diminuire','equivoco','esacerbare','formidabile','indispensabile','inavvertito','inevitabile','ostensibile','paradossale','perspicace','pragmatico','recalcitrante','sottostante','trascendentale'],
  },
};

function getVocabWords(lang: string) {
  return VOCAB_WORDS[lang] ?? VOCAB_WORDS['en'];
}

const FOCUS_AREAS = [
  { code: 'speaking',      emoji: '🗣️', label: 'Speaking' },
  { code: 'listening',     emoji: '👂', label: 'Listening' },
  { code: 'vocabulary',    emoji: '📖', label: 'Vocabulary' },
  { code: 'grammar',       emoji: '✍️', label: 'Grammar' },
  { code: 'pronunciation', emoji: '👄', label: 'Pronunciation' },
  { code: 'reading',       emoji: '📚', label: 'Reading' },
  { code: 'travel',        emoji: '✈️', label: 'Travel' },
  { code: 'business',      emoji: '💼', label: 'Business' },
];

const LEARNING_BACKGROUNDS = [
  { code: 'school',          emoji: '🏫', label: 'School' },
  { code: 'language-school', emoji: '🏫', label: 'Language school' },
  { code: 'university',      emoji: '🎓', label: 'University / College' },
  { code: 'tutor',           emoji: '👩‍🏫', label: 'Private tutor' },
  { code: 'self',            emoji: '📱', label: 'Self-taught (apps, YouTube)' },
  { code: 'abroad',          emoji: '🌍', label: 'Lived abroad' },
  { code: 'never',           emoji: '🚫', label: 'Never studied it' },
];

const ASPIRATIONS = [
  { code: 'speak-natives', emoji: '💬', label: 'Speak confidently with native speakers' },
  { code: 'movies',        emoji: '🎬', label: 'Watch films without subtitles' },
  { code: 'understand',    emoji: '👥', label: 'Understand conversations easily' },
  { code: 'read',          emoji: '📖', label: 'Read texts fluently' },
  { code: 'work',          emoji: '💼', label: 'Use it professionally at work' },
  { code: 'travel',        emoji: '✈️', label: 'Navigate travel situations' },
];

const DAILY_TIMES = [
  { minutes: 5,  label: '5 min / day',   desc: 'Quick daily touch' },
  { minutes: 10, label: '10 min / day',  desc: 'Steady progress' },
  { minutes: 15, label: '15 min / day',  desc: 'Solid improvement' },
  { minutes: 30, label: '30+ min / day', desc: 'Fast track to fluency' },
];

const INTERESTS = [
  '🎤 Music','✈️ Travel','🍳 Cooking','🎮 Gaming','⚽ Sports','🎨 Art',
  '💼 Business','💰 Finance','🎬 Cinema','💃 Dance','🏛️ History','📱 Social media',
  '📷 Photography','🧘 Yoga','🌿 Nature','📚 Books','🔬 Science','🎭 Theatre',
  '🏋️ Fitness','🎸 Culture',
];

const TUTORS = [
  { id: 't1', gender: 'female' as const, ethnicity: 'caucasian' },
  { id: 't2', gender: 'female' as const, ethnicity: 'african' },
  { id: 't3', gender: 'female' as const, ethnicity: 'asian' },
  { id: 't4', gender: 'female' as const, ethnicity: 'latina' },
  { id: 't5', gender: 'male'   as const, ethnicity: 'caucasian' },
  { id: 't6', gender: 'male'   as const, ethnicity: 'african' },
  { id: 't7', gender: 'male'   as const, ethnicity: 'asian' },
  { id: 't8', gender: 'male'   as const, ethnicity: 'latino' },
];

const LOADING_TASKS = [
  '✨ Creating personalized topics',
  '💬 Preparing interactive dialogues',
  '📚 Optimizing your learning path',
  '✅ Completing your plan',
];

// ─── HELPERS ──────────────────────────────────────────────────
function calcLevel(a1: number, b1: number, c1: number): CEFRLevel {
  const a1p = a1 / 25; const b1p = b1 / 25; const c1p = c1 / 20;
  if (c1p >= 0.7)               return 'C2';
  if (c1p >= 0.4 || b1p >= 0.8) return 'C1';
  if (b1p >= 0.5)               return 'B2';
  if (b1p >= 0.2 || a1p >= 0.8) return 'B1';
  if (a1p >= 0.5)               return 'A2';
  return 'A1';
}

function levelToWords(level: CEFRLevel): number {
  return { A1: 500, A2: 1500, B1: 3000, B2: 5000, C1: 8000, C2: 16000 }[level];
}


function getLangName(code: string) { return LANGUAGES.find(l => l.code === code)?.name ?? 'English'; }
function getLangFlag(code: string) { return LANGUAGES.find(l => l.code === code)?.flag ?? '🌐'; }

function getStepOrder(targetLang: string): Step[] {
  const base: Step[] = ['native-lang', 'target-lang'];
  if (targetLang === 'en') base.push('accent');
  return [...base, 'level', 'vocab-quiz', 'vocab-result', 'focus', 'background', 'aspiration', 'daily-time', 'interests', 'tutor', 'tutor-name', 'user-name', 'loading'];
}

// ─── COMPONENT ────────────────────────────────────────────────
export default function OnboardingPage() {
  const { user, logOut, refreshProfile } = useAuth();
  const router = useRouter();
  const hasSaved = useRef(false);
  const { uiLang, setUILang, mounted } = useUILanguage();
  const t = getOnboardingT(mounted ? uiLang : 'en');

  // Detect native language
  const [nativeLang, setNativeLang] = useState('en');
  useEffect(() => {
    const code = navigator.language?.split('-')[0] ?? 'en';
    const supported = ['it','es','fr','de','pt','ja','zh','ko','ru','ar','hi','tr','nl','pl'];
    setNativeLang(supported.includes(code) ? code : 'en');
  }, []);

  // Step
  const [step, setStep] = useState<Step>('native-lang');

  // Answers
  const [targetLang,    setTargetLang]    = useState('');
  const [accent,        setAccent]        = useState('');
  const [selfLevel,     setSelfLevel]     = useState('');
  const [vocabRound,    setVocabRound]    = useState(0);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [roundScores,   setRoundScores]   = useState([0, 0, 0]);
  const [estimatedLevel, setEstimatedLevel] = useState<CEFRLevel>('A1');
  const [focusAreas,   setFocusAreas]    = useState<string[]>([]);
  const [background,   setBackground]    = useState<string[]>([]);
  const [aspiration,   setAspiration]    = useState('');
  const [dailyMinutes, setDailyMinutes]  = useState(0);
  const [interests,    setInterests]     = useState<string[]>([]);
  const [tutorId,      setTutorId]       = useState('');
  const [tutorName,    setTutorName]     = useState('');
  const [userName,     setUserName]      = useState('');

  // Loading
  const [loadingProgress, setLoadingProgress]   = useState(0);
  const [loadingTasksDone, setLoadingTasksDone] = useState(0);

  // Loading animation + save
  useEffect(() => {
    if (step !== 'loading') return;
    if (!hasSaved.current) {
      hasSaved.current = true;
      saveProfile();
    }
    const progressTimer = setInterval(() => {
      setLoadingProgress(p => { if (p >= 100) { clearInterval(progressTimer); return 100; } return p + 2; });
    }, 60);
    const taskTimer = setInterval(() => {
      setLoadingTasksDone(d => Math.min(d + 1, LOADING_TASKS.length));
    }, 800);
    const redirect = setTimeout(() => router.push('/dashboard'), 4500);
    return () => { clearInterval(progressTimer); clearInterval(taskTimer); clearTimeout(redirect); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function saveProfile() {
    if (!user) return;
    const tutor = TUTORS.find(t => t.id === tutorId);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nativeLanguage: nativeLang,
        targetLanguage: targetLang || 'en',
        accent: accent || null,
        level: estimatedLevel,
        selfReportedLevel: selfLevel,
        focusAreas,
        learningBackground: background,
        aspiration,
        dailyMinutes,
        interests,
        tutor: tutor ? { id: tutor.id, gender: tutor.gender, ethnicity: tutor.ethnicity, name: tutorName } : null,
        userName,
        onboardingComplete: true,
      });
      await refreshProfile();
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  }

  // Navigation
  function next() {
    const order = getStepOrder(targetLang);
    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  }

  function back() {
    const order = getStepOrder(targetLang);
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  // Progress bar
  const visibleSteps: Step[] = [
    'native-lang', 'target-lang',
    ...(targetLang === 'en' ? ['accent' as Step] : []),
    'level', 'vocab-quiz', 'focus', 'background', 'aspiration',
    'daily-time', 'interests', 'tutor', 'tutor-name', 'user-name',
  ];
  const visIdx = visibleSteps.indexOf(step);
  const progressPct = (step === 'loading' || step === 'vocab-result')
    ? 100
    : Math.max(((visIdx + 1) / visibleSteps.length) * 100, 4);

  // Vocab quiz
  const words = getVocabWords(targetLang);
  const roundWords   = [words.a1, words.b1, words.c1];
  const roundLabels  = ['A1-A2', 'B1-B2', 'C1-C2'];
  const roundColors  = [
    { sel: 'bg-green-500 text-white border-green-500',  unsel: 'bg-white text-gray-700 border-gray-200' },
    { sel: 'bg-yellow-400 text-white border-yellow-400', unsel: 'bg-white text-gray-700 border-gray-200' },
    { sel: 'bg-indigo-600 text-white border-indigo-600', unsel: 'bg-white text-gray-700 border-gray-200' },
  ];

  function toggleWord(w: string) {
    setSelectedWords(prev => { const n = new Set(prev); n.has(w) ? n.delete(w) : n.add(w); return n; });
  }

  function finishRound() {
    const score = roundWords[vocabRound].filter(w => selectedWords.has(w)).length;
    const scores = [...roundScores];
    scores[vocabRound] = score;
    setRoundScores(scores);
    setSelectedWords(new Set());
    if (vocabRound < 2) {
      setVocabRound(vocabRound + 1);
    } else {
      setEstimatedLevel(calcLevel(scores[0], scores[1], scores[2]));
      setStep('vocab-result');
    }
  }

  const selectedTutor = TUTORS.find(t => t.id === tutorId);

  // ─── LOADING SCREEN ───────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden relative mx-auto border-4 border-indigo-600">
              <Image src={selectedTutor ? TUTOR_AVATARS[selectedTutor.id] : '/tutors/Tutor-1.png'} alt="tutor" fill className="object-cover object-top" sizes="96px" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {loadingProgress}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8 max-w-xs mx-auto">
            <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-100" style={{ width: `${loadingProgress}%` }} />
          </div>

          <h2 className="text-xl font-bold text-indigo-600 mb-6">{t.loading_title}</h2>

          <div className="space-y-3 text-left">
            {t.loading_tasks.map((task, i) => (
              <div key={task} className={`flex items-center justify-between text-sm transition-all duration-500 ${i < loadingTasksDone ? 'opacity-100' : 'opacity-25'}`}>
                <span className="text-gray-700">{task}</span>
                <span className={`font-medium ${i < loadingTasksDone ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {i < loadingTasksDone ? t.vocabResult_continue.replace(' →','') : '...'}
                </span>
              </div>
            ))}
          </div>

          {tutorName && userName && (
            <p className="mt-8 text-sm text-gray-500 italic">
              &ldquo;Hi {userName}! I&apos;m {tutorName}, your personal tutor. Let&apos;s get started!&rdquo;
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── MAIN LAYOUT ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Top bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">ChatLingo</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user && (
            <button
              onClick={async () => { await logOut(); router.push('/'); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t.logout ?? 'Log out'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full max-w-lg mb-6 flex items-center gap-3">
        {step !== 'native-lang' && step !== 'vocab-result' && (
          <button onClick={back} className="text-gray-400 hover:text-gray-600 shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
          <div className="h-1.5 bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* ── NATIVE LANGUAGE ── */}
        {step === 'native-lang' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t.nativeLang_title(getLangName(nativeLang))}
            </h1>
            <p className="text-gray-500 mb-6">
              {getLangFlag(nativeLang)} {t.nativeLang_detected}
            </p>
            <button
              onClick={() => { setUILang(nativeLang); next(); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all mb-4"
            >
              <span className="text-3xl">{getLangFlag(nativeLang)}</span>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{t.nativeLang_yes(getLangName(nativeLang))}</div>
              </div>
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-400">{t.nativeLang_or}</span></div>
            </div>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setNativeLang(l.code); setUILang(l.code); next(); }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                >
                  <span className="text-2xl">{l.flag}</span>
                  <span className="text-xs text-gray-700 text-center leading-tight">{l.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── TARGET LANGUAGE ── */}
        {step === 'target-lang' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.targetLang_title}</h1>
            <p className="text-gray-500 mb-6">{t.targetLang_sub}</p>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.filter(l => l.code !== nativeLang).map(l => (
                <button
                  key={l.code}
                  onClick={() => { setTargetLang(l.code); next(); }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${targetLang === l.code ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-3xl">{l.flag}</span>
                  <span className="font-medium text-gray-900">{l.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── ACCENT ── */}
        {step === 'accent' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.accent_title}</h1>
            <p className="text-gray-500 mb-8">{t.accent_sub}</p>
            <div className="space-y-3">
              {[
                { code: 'en-US', flag: '🇺🇸', name: t.accent_american, desc: t.accent_american_desc },
                { code: 'en-GB', flag: '🇬🇧', name: t.accent_british,  desc: t.accent_british_desc  },
                { code: 'en-AU', flag: '🇦🇺', name: t.accent_australian, desc: t.accent_australian_desc },
              ].map(a => (
                <button
                  key={a.code}
                  onClick={() => { setAccent(a.code); next(); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${accent === a.code ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-3xl">{a.flag}</span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{a.name}</div>
                    <div className="text-sm text-gray-500">{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── LEVEL ── */}
        {step === 'level' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.level_title}</h1>
            <p className="text-gray-500 mb-6">{t.level_sub}</p>
            <div className="grid grid-cols-2 gap-3">
              {LEVELS.map((l, i) => (
                <button
                  key={l.code}
                  onClick={() => { setSelfLevel(l.code); next(); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selfLevel === l.code ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-4xl">{l.emoji}</span>
                  <div className="font-semibold text-gray-900 text-sm">{t.level_labels[i]}</div>
                  <div className="text-xs text-gray-500 text-center">{t.level_descs[i]}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── VOCAB QUIZ ── */}
        {step === 'vocab-quiz' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t.vocab_title}</h1>
            <p className="text-sm text-gray-400 mb-6">{t.vocab_round(vocabRound + 1, roundLabels[vocabRound])}</p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {roundWords[vocabRound].map(word => {
                const sel = selectedWords.has(word);
                const c = roundColors[vocabRound];
                return (
                  <button
                    key={word}
                    onClick={() => toggleWord(word)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${sel ? c.sel : c.unsel}`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
            <button onClick={finishRound} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              {t.vocab_continue}
            </button>
          </>
        )}

        {/* ── VOCAB RESULT ── */}
        {step === 'vocab-result' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t.vocabResult_title}</h1>
            <p className="text-3xl font-bold text-indigo-600 mb-6">{t.vocabResult_words(levelToWords(estimatedLevel))}</p>
            <div className="relative mb-2">
              <div className="h-3 rounded-full" style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #6366f1)' }} />
              {(() => {
                const lvls: CEFRLevel[] = ['A1','A2','B1','B2','C1','C2'];
                const idx = lvls.indexOf(estimatedLevel);
                const pct = ((idx + 0.5) / lvls.length) * 100;
                return <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-800 rounded-full shadow" style={{ left: `calc(${pct}% - 10px)` }} />;
              })()}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-6">
              {['A1','A2','B1','B2','C1','C2'].map(l => <span key={l}>{l}</span>)}
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-8">
              <div className="font-semibold text-indigo-700 mb-1">{t.vocabResult_estimated}: {estimatedLevel}</div>
              <div className="text-sm text-gray-600">{t.vocabResult_descs[estimatedLevel]}</div>
            </div>
            <button onClick={next} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              {t.vocabResult_continue}
            </button>
          </>
        )}

        {/* ── FOCUS AREA ── */}
        {step === 'focus' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.focus_title}</h1>
            <p className="text-gray-500 mb-6">{t.focus_sub}</p>
            <div className="space-y-2 mb-8">
              {FOCUS_AREAS.map((f, i) => (
                <button
                  key={f.code}
                  onClick={() => setFocusAreas(p => p.includes(f.code) ? p.filter(x => x !== f.code) : [...p, f.code])}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${focusAreas.includes(f.code) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="font-medium text-gray-900">{t.focus_labels[i]}</span>
                </button>
              ))}
            </div>
            <button onClick={next} disabled={focusAreas.length === 0} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {t.focus_continue}
            </button>
          </>
        )}

        {/* ── LEARNING BACKGROUND ── */}
        {step === 'background' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.background_title}</h1>
            <p className="text-gray-500 mb-6">{t.background_sub}</p>
            <div className="space-y-2 mb-8">
              {LEARNING_BACKGROUNDS.map((b, i) => (
                <button
                  key={b.code}
                  onClick={() => setBackground(p => p.includes(b.code) ? p.filter(x => x !== b.code) : [...p, b.code])}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${background.includes(b.code) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-2xl">{b.emoji}</span>
                  <span className="font-medium text-gray-900">{t.background_labels[i]}</span>
                </button>
              ))}
            </div>
            <button onClick={next} disabled={background.length === 0} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {t.background_continue}
            </button>
          </>
        )}

        {/* ── ASPIRATION ── */}
        {step === 'aspiration' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.aspiration_title}</h1>
            <p className="text-gray-500 mb-6">{t.aspiration_sub}</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {ASPIRATIONS.map((a, i) => (
                <button
                  key={a.code}
                  onClick={() => setAspiration(a.code)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${aspiration === a.code ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-3xl">{a.emoji}</span>
                  <span className="text-sm font-medium text-gray-900">{t.aspiration_labels[i]}</span>
                </button>
              ))}
            </div>
            <button onClick={next} disabled={!aspiration} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {t.aspiration_continue}
            </button>
          </>
        )}

        {/* ── DAILY TIME ── */}
        {step === 'daily-time' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.daily_title}</h1>
            <p className="text-gray-500 mb-8">{t.daily_sub}</p>
            <div className="space-y-3">
              {DAILY_TIMES.map((d, i) => (
                <button
                  key={d.minutes}
                  onClick={() => { setDailyMinutes(d.minutes); next(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${dailyMinutes === d.minutes ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="font-semibold text-gray-900">{t.daily_labels[i]}</span>
                  <span className="text-sm text-gray-400">{t.daily_descs[i]}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── INTERESTS ── */}
        {step === 'interests' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.interests_title}</h1>
            <p className="text-gray-500 mb-6">{t.interests_sub}</p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {INTERESTS.map(interest => {
                const sel = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => setInterests(p => p.includes(interest) ? p.filter(x => x !== interest) : [...p, interest])}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${sel ? 'bg-indigo-600 text-white border-transparent' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <button onClick={next} disabled={interests.length === 0} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {t.interests_continue}
            </button>
          </>
        )}

        {/* ── TUTOR SELECTION ── */}
        {step === 'tutor' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.tutor_title}</h1>
            <p className="text-gray-500 mb-6">{t.tutor_sub}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
              {TUTORS.map(tutor => (
                <button
                  key={tutor.id}
                  onClick={() => setTutorId(tutor.id)}
                  className={`flex flex-col items-center gap-2 p-2 rounded-2xl border-2 transition-all ${tutorId === tutor.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 shadow-lg shadow-indigo-500/20' : 'border-gray-200 dark:border-white/10 hover:border-indigo-300'}`}
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden relative">
                    <Image
                      src={TUTOR_AVATARS[tutor.id]}
                      alt={`${tutor.gender} tutor`}
                      fill
                      className="object-cover object-top"
                      sizes="120px"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-[var(--app-muted)] pb-0.5">
                    {tutor.gender === 'female' ? t.tutor_female : t.tutor_male}
                  </span>
                </button>
              ))}
            </div>
            <button onClick={next} disabled={!tutorId} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {t.tutor_continue}
            </button>
          </>
        )}

        {/* ── TUTOR NAME ── */}
        {step === 'tutor-name' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 rounded-2xl overflow-hidden relative ring-4 ring-indigo-500/30">
                {selectedTutor && (
                  <Image
                    src={TUTOR_AVATARS[selectedTutor.id]}
                    alt="tutor"
                    fill
                    className="object-cover object-top"
                    sizes="112px"
                  />
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t.tutorName_title}</h1>
            <p className="text-gray-500 mb-8 text-center">{t.tutorName_sub}</p>
            <input
              type="text"
              value={tutorName}
              onChange={e => setTutorName(e.target.value)}
              placeholder={t.tutorName_placeholder}
              maxLength={20}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 mb-8"
            />
            <button onClick={next} disabled={!tutorName.trim()} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {t.tutorName_continue}
            </button>
          </>
        )}

        {/* ── USER NAME ── */}
        {step === 'user-name' && (
          <>
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden relative mb-1">
                <Image src={selectedTutor ? TUTOR_AVATARS[selectedTutor.id] : '/tutors/Tutor-1.png'} alt="tutor" fill className="object-cover object-top" sizes="64px" />
              </div>
              <div className="text-sm font-medium text-indigo-600">{tutorName}</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              {t.userName_title(tutorName)}
            </h1>
            <p className="text-gray-500 mb-8 text-center">{t.userName_sub(tutorName)}</p>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder={t.userName_placeholder}
              maxLength={20}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 mb-8"
            />
            <button
              onClick={() => setStep('loading')}
              disabled={!userName.trim()}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t.userName_start}
            </button>
          </>
        )}

      </div>
    </div>
  );
}
