'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import { getDayByTopic, PRACTICE_DAYS } from '@/lib/practiceData';

const SCENARIO_SLUGS = [
  'greetings-small-talk',
  'ordering-at-a-cafe',
  'asking-for-directions',
  'at-the-airport',
  'at-the-doctor',
  'making-plans-with-friends',
  'job-interview-entry',
  'networking-at-an-event',
  'business-meeting',
  'calling-customer-service',
  'shopping-at-a-market',
  'negotiating-price',
];

const scenarios = SCENARIO_SLUGS.map((slug) => getDayByTopic(slug)).filter(Boolean) as typeof PRACTICE_DAYS;

const UI_TEXT: Record<string, { title: string; subtitle: string; free: string; freeDesc: string; start: string; back: string }> = {
  en: { title: 'Choose your scenario', subtitle: 'Pick a context and the tutor will guide the conversation.', free: 'Free conversation', freeDesc: 'Open topic, no scenario', start: 'Start', back: 'Back' },
  it: { title: 'Scegli il tuo scenario', subtitle: 'Scegli un contesto e il tutor guiderà la conversazione.', free: 'Conversazione libera', freeDesc: 'Nessun tema fisso', start: 'Inizia', back: 'Indietro' },
  es: { title: 'Elige tu escenario', subtitle: 'Elige un contexto y el tutor guiará la conversación.', free: 'Conversación libre', freeDesc: 'Sin tema fijo', start: 'Comenzar', back: 'Volver' },
  fr: { title: 'Choisissez votre scénario', subtitle: 'Choisissez un contexte et le tuteur guidera la conversation.', free: 'Conversation libre', freeDesc: 'Aucun sujet fixe', start: 'Commencer', back: 'Retour' },
  de: { title: 'Wähle dein Szenario', subtitle: 'Wähle einen Kontext und der Tutor leitet das Gespräch.', free: 'Freies Gespräch', freeDesc: 'Kein festes Thema', start: 'Starten', back: 'Zurück' },
  pt: { title: 'Escolha seu cenário', subtitle: 'Escolha um contexto e o tutor guiará a conversa.', free: 'Conversa livre', freeDesc: 'Sem tema fixo', start: 'Começar', back: 'Voltar' },
  ja: { title: 'シナリオを選んでください', subtitle: 'コンテキストを選択すると、チューターが会話を案内します。', free: '自由会話', freeDesc: 'テーマなし', start: '開始', back: '戻る' },
  zh: { title: '选择你的场景', subtitle: '选择一个情境，导师将引导对话。', free: '自由对话', freeDesc: '无固定主题', start: '开始', back: '返回' },
  ko: { title: '시나리오 선택', subtitle: '상황을 선택하면 튜터가 대화를 이끌어갑니다.', free: '자유 대화', freeDesc: '주제 없음', start: '시작', back: '뒤로' },
  ru: { title: 'Выберите сценарий', subtitle: 'Выберите контекст, и репетитор направит разговор.', free: 'Свободный разговор', freeDesc: 'Без темы', start: 'Начать', back: 'Назад' },
  ar: { title: 'اختر سيناريوك', subtitle: 'اختر سياقاً وسيوجه المعلم المحادثة.', free: 'محادثة حرة', freeDesc: 'بدون موضوع محدد', start: 'ابدأ', back: 'رجوع' },
  hi: { title: 'अपना परिदृश्य चुनें', subtitle: 'एक संदर्भ चुनें और ट्यूटर बातचीत का मार्गदर्शन करेगा।', free: 'मुक्त बातचीत', freeDesc: 'कोई विषय नहीं', start: 'शुरू करें', back: 'वापस' },
  tr: { title: 'Senaryonu seç', subtitle: 'Bir bağlam seç, öğretmen konuşmayı yönlendirecek.', free: 'Serbest konuşma', freeDesc: 'Konusuz', start: 'Başla', back: 'Geri' },
  nl: { title: 'Kies je scenario', subtitle: 'Kies een context en de tutor leidt het gesprek.', free: 'Vrij gesprek', freeDesc: 'Geen vast onderwerp', start: 'Starten', back: 'Terug' },
  pl: { title: 'Wybierz swój scenariusz', subtitle: 'Wybierz kontekst, a korepetytor poprowadzi rozmowę.', free: 'Swobodna rozmowa', freeDesc: 'Bez tematu', start: 'Zacznij', back: 'Wróć' },
};

export default function ChatSetupPage() {
  const router = useRouter();
  const { uiLang } = useUILanguage();
  const t = UI_TEXT[uiLang] ?? UI_TEXT['en'];
  const [selected, setSelected] = useState<string | null>(null);

  function handleStart() {
    if (selected === 'free' || !selected) {
      router.push('/conversation');
    } else {
      router.push(`/conversation?topic=${selected}`);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <nav className="bg-[var(--app-surface)] border-b border-[var(--app-border)] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-[var(--app-text)]">ChatLingo</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--app-text)]">{t.title}</h1>
          <p className="text-[var(--app-muted)] mt-1 text-sm">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {scenarios.map((day) => (
            <button
              key={day.topic}
              onClick={() => setSelected(day.topic)}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                selected === day.topic
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:border-indigo-400/50 hover:bg-[var(--app-surface)]'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{day.emoji}</span>
              <div>
                <p className="font-semibold text-[var(--app-text)] text-sm">{day.title}</p>
                <p className="text-[var(--app-muted)] text-xs mt-0.5 leading-relaxed">{day.description}</p>
              </div>
            </button>
          ))}

          {/* Free conversation option */}
          <button
            onClick={() => setSelected('free')}
            className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
              selected === 'free'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:border-indigo-400/50'
            }`}
          >
            <span className="text-2xl flex-shrink-0">💬</span>
            <div>
              <p className="font-semibold text-[var(--app-text)] text-sm">{t.free}</p>
              <p className="text-[var(--app-muted)] text-xs mt-0.5">{t.freeDesc}</p>
            </div>
          </button>
        </div>

        <button
          onClick={handleStart}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-colors"
        >
          <Mic className="w-5 h-5" />
          {t.start}
        </button>
      </main>
    </div>
  );
}
