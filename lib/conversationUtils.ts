import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Language name map ─────────────────────────────────────────────────────────
export const LANG_NAMES: Record<string, string> = {
  en: 'English', 'en-US': 'American English', 'en-GB': 'British English', 'en-AU': 'Australian English',
  it: 'Italian', es: 'Spanish', fr: 'French', de: 'German',
  pt: 'Portuguese', ja: 'Japanese', zh: 'Chinese', ko: 'Korean',
  ru: 'Russian', ar: 'Arabic', hi: 'Hindi', tr: 'Turkish', nl: 'Dutch', pl: 'Polish',
};

// ── Text utilities ────────────────────────────────────────────────────────────
export function extractHardWords(messages: DisplayMessage[]): string[] {
  const hardSet = new Set<string>();
  const regex = /\[HARD:([^\]]+)\]/gi;
  for (const m of messages) {
    if (m.role !== 'assistant') continue;
    let match;
    while ((match = regex.exec(m.content)) !== null) hardSet.add(match[1].trim());
  }
  return Array.from(hardSet);
}

export function stripHardTags(text: string): string {
  return text.replace(/\[(?:HARD|WRONG):[^\]]+\]/gi, '').trim();
}

export function extractWrongPhrases(messages: DisplayMessage[]): string[] {
  const set = new Set<string>();
  const re = /\[WRONG:([^\]]+)\]/gi;
  for (const m of messages) {
    if (m.role !== 'assistant') continue;
    let match;
    while ((match = re.exec(m.content)) !== null) set.add(match[1].trim().toLowerCase());
  }
  return Array.from(set);
}

function isThinkingOutput(text: string): boolean {
  if (/\*\*[A-Z][^*\n]{2,50}\*\*/.test(text)) return true;
  const lower = text.toLowerCase();
  const markers = [
    'my plan', 'my goal', 'my focus', 'my aim', "i've registered",
    "i've analyzed", "i've noted", 'i am prepared', 'i intend to',
    'i will maintain', 'i aim to', 'the user has', 'to maintain the',
    'to ensure', 'to achieve', 'i plan to', 'i analyzed',
    'i acknowledged', 'i will now', 'i will respond',
  ];
  return markers.filter((m) => lower.includes(m)).length >= 2;
}

export function filterReasoning(text: string): string {
  if (isThinkingOutput(text)) return '';
  text = text.replace(/\*\*[A-Z][^a-z*]{2,30}\*\*/g, '');
  return text.replace(/\s{2,}/g, ' ').trim();
}

// ── Firestore: save transcript ────────────────────────────────────────────────
export interface ConversationMeta {
  scenarioId?: string | null;
  practiceTopic?: string | null;
  pronunciationId?: string | null;
  phase?: string | null;
}

export async function saveTranscript(
  uid: string,
  messages: DisplayMessage[],
  isAssessment: boolean,
  meta: ConversationMeta = {},
) {
  if (messages.length < 2) return;
  const hardWords = extractHardWords(messages);
  const wrongPhrases = extractWrongPhrases(messages);
  const cleanMessages = messages.map((m) => ({
    role: m.role,
    content: stripHardTags(m.content),
    timestamp: m.timestamp,
  }));
  const docRef = await addDoc(collection(db, 'users', uid, 'conversations'), {
    messages: cleanMessages,
    type: isAssessment ? 'assessment' : 'conversation',
    createdAt: new Date(),
    messageCount: messages.length,
    hardWords,
    wrongPhrases,
    scenarioId: meta.scenarioId ?? null,
    practiceTopic: meta.practiceTopic ?? null,
    pronunciationId: meta.pronunciationId ?? null,
    phase: meta.phase ?? null,
    name: null,
  });
  for (const word of hardWords) {
    await addDoc(collection(db, 'users', uid, 'difficultWords'), {
      word,
      createdAt: new Date(),
    }).catch(() => {});
  }
  return docRef.id;
}
