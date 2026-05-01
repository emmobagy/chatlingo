import type { Difficulty } from './practiceData';

export interface PronunciationSet {
  id: string;
  category: string;
  targetSound: string;       // phonetic label shown to user
  tip: string;               // one-line coaching tip
  difficulty: Difficulty;
  emoji: string;
  words: string[];           // words / short phrases to drill
  timeEstimate: string;
}

export const PRONUNCIATION_SETS: PronunciationSet[] = [

  // ── Beginner ──────────────────────────────────────────────────────────────
  {
    id: 'th-sounds',
    category: 'The "TH" Sounds',
    targetSound: '/θ/ and /ð/',
    tip: 'Place the tip of your tongue lightly between your teeth and blow air through.',
    difficulty: 'beginner',
    emoji: '👅',
    timeEstimate: '5 min',
    words: ['the', 'this', 'that', 'think', 'thank', 'through', 'breathe', 'three', 'they', 'there'],
  },
  {
    id: 'short-vowels',
    category: 'Short Vowels',
    targetSound: '/æ/ /ɛ/ /ɪ/ /ɒ/ /ʌ/',
    tip: 'English vowels are often shorter and crisper than in other languages. Avoid stretching them.',
    difficulty: 'beginner',
    emoji: '🔤',
    timeEstimate: '5 min',
    words: ['cat', 'bed', 'sit', 'hot', 'cup', 'map', 'pen', 'him', 'lot', 'fun'],
  },
  {
    id: 'silent-letters',
    category: 'Silent Letters',
    targetSound: 'Silent consonants',
    tip: 'Many English words hide silent letters. Trust the sound, not the spelling.',
    difficulty: 'beginner',
    emoji: '🤫',
    timeEstimate: '6 min',
    words: ['knife', 'know', 'write', 'wrong', 'hour', 'honest', 'lamb', 'comb', 'island', 'castle'],
  },
  {
    id: 'final-consonants',
    category: 'Final Consonants',
    targetSound: 'Word-final /t/ /d/ /k/ /p/',
    tip: 'In many languages final consonants are dropped. In English they must be clearly pronounced.',
    difficulty: 'beginner',
    emoji: '🔚',
    timeEstimate: '5 min',
    words: ['cat', 'bed', 'back', 'stop', 'fast', 'child', 'neck', 'hand', 'kept', 'loved'],
  },

  // ── Intermediate ──────────────────────────────────────────────────────────
  {
    id: 'r-sound',
    category: 'The American /r/',
    targetSound: '/r/ (retroflex)',
    tip: 'Curl your tongue back slightly. Don\'t roll or tap it like in Spanish or Italian.',
    difficulty: 'intermediate',
    emoji: '🌀',
    timeEstimate: '8 min',
    words: ['red', 'right', 'rain', 'run', 'more', 'car', 'bird', 'world', 'butter', 'mirror'],
  },
  {
    id: 'w-v-sounds',
    category: 'W vs V',
    targetSound: '/w/ vs /v/',
    tip: 'For /w/ round your lips. For /v/ touch your top teeth to your lower lip.',
    difficulty: 'intermediate',
    emoji: '⚡',
    timeEstimate: '7 min',
    words: ['wine', 'vine', 'west', 'vest', 'wet', 'vet', 'worse', 'verse', 'reward', 'reveal'],
  },
  {
    id: 'schwa',
    category: 'The Schwa /ə/',
    targetSound: '/ə/ (unstressed vowel)',
    tip: 'The schwa is the most common English sound — a neutral, relaxed "uh". It appears in unstressed syllables.',
    difficulty: 'intermediate',
    emoji: '💤',
    timeEstimate: '8 min',
    words: ['about', 'problem', 'banana', 'cinema', 'police', 'button', 'better', 'together', 'support', 'today'],
  },
  {
    id: 'ed-endings',
    category: '-ed Past Tense Endings',
    targetSound: '/t/, /d/, /ɪd/',
    tip: 'Past tense "-ed" has 3 sounds: /t/ after voiceless sounds, /d/ after voiced, /ɪd/ after t or d.',
    difficulty: 'intermediate',
    emoji: '⏪',
    timeEstimate: '8 min',
    words: ['walked', 'played', 'wanted', 'stopped', 'loved', 'waited', 'fixed', 'opened', 'decided', 'mixed'],
  },
  {
    id: 'connected-speech',
    category: 'Connected Speech',
    targetSound: 'Linking & reduction',
    tip: 'Native speakers link words together and reduce unstressed words. "going to" becomes "gonna", "want to" becomes "wanna".',
    difficulty: 'intermediate',
    emoji: '🔗',
    timeEstimate: '10 min',
    words: ['want to', 'going to', 'have to', 'used to', 'kind of', 'a lot of', 'out of', 'sort of', 'would have', 'should have'],
  },

  // ── Advanced ──────────────────────────────────────────────────────────────
  {
    id: 'stress-patterns',
    category: 'Word Stress Patterns',
    targetSound: 'Primary & secondary stress',
    tip: 'Stressing the wrong syllable is the #1 cause of misunderstanding. Nouns and verbs often stress differently.',
    difficulty: 'advanced',
    emoji: '🎯',
    timeEstimate: '12 min',
    words: ['record (n/v)', 'present (n/v)', 'photograph', 'photography', 'comfortable', 'vegetable', 'interesting', 'temperature', 'particularly', 'necessarily'],
  },
  {
    id: 'intonation',
    category: 'Intonation & Tone',
    targetSound: 'Rising / falling tone',
    tip: 'Questions rise, statements fall. But rising tone can also signal uncertainty or politeness. Tone changes meaning.',
    difficulty: 'advanced',
    emoji: '📈',
    timeEstimate: '12 min',
    words: ['Really?', 'You\'re sure.', 'I see.', 'That\'s fine.', 'Can I help?', 'Where is it?', 'I didn\'t say that.', 'It\'s done.', 'Are you coming?', 'Never mind.'],
  },
  {
    id: 'difficult-clusters',
    category: 'Consonant Clusters',
    targetSound: '/str/ /spl/ /skr/ /nts/',
    tip: 'English loves stacking consonants. Practice each cluster slowly, then speed up.',
    difficulty: 'advanced',
    emoji: '🏗️',
    timeEstimate: '10 min',
    words: ['strengths', 'scripts', 'splendid', 'scratched', 'twelfths', 'texts', 'months', 'glimpsed', 'sprints', 'worlds'],
  },
  {
    id: 'minimal-pairs',
    category: 'Minimal Pairs',
    targetSound: 'Near-identical sounds',
    tip: 'These word pairs differ by only one sound. Confusing them changes the meaning completely.',
    difficulty: 'advanced',
    emoji: '🔎',
    timeEstimate: '10 min',
    words: ['ship / sheep', 'bit / beat', 'full / fool', 'live / leave', 'sit / seat', 'pull / pool', 'chip / cheap', 'hit / heat', 'fill / feel', 'still / steal'],
  },
];

export function getPronunciationSetById(id: string): PronunciationSet | undefined {
  return PRONUNCIATION_SETS.find((s) => s.id === id);
}
