'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { auth } from '@/lib/firebase';
import { getDayByTopic } from '@/lib/practiceData';
import { getPronunciationSetById } from '@/lib/pronunciationData';
import { getScenarioById } from '@/lib/simulatorData';
import { getConversationTranslations } from '@/lib/conversationTranslations';
import { filterReasoning, stripHardTags, DisplayMessage, LANG_NAMES } from '@/lib/conversationUtils';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types';

interface UseLiveSessionParams {
  user: User | null;
  userProfile: UserProfile | null;
  uiLang: string;
  targetLang: string;
  nativeLang: string;
  tutorName: string;
  scenarioId: string | null;
  practiceTopic: string | null;
  pronunciationId: string | null;
  reviewWords: string[];
  practiceDay: number | null;
  phase: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export interface UseLiveSessionResult {
  isLive: boolean;
  isConnecting: boolean;
  isTutorSpeaking: boolean;
  mouthOpen: boolean;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  messages: DisplayMessage[];
  liveTranscript: string;
  error: string;
  sessionSeconds: number;
  nativeHelpActive: boolean;
  cameraOn: boolean;
  cameraError: boolean;
  sessionStartRef: React.RefObject<number | null>;
  messagesRef: React.RefObject<DisplayMessage[]>;
  savedRef: React.RefObject<boolean>;
  startLive: () => Promise<void>;
  stopLive: () => void;
  toggleMute: () => void;
  requestNativeHelp: () => void;
  toggleCamera: () => Promise<void>;
}

export function useLiveSession(params: UseLiveSessionParams): UseLiveSessionResult {
  const {
    user, userProfile, uiLang, targetLang, nativeLang, tutorName,
    scenarioId, practiceTopic, pronunciationId, reviewWords, practiceDay, phase, videoRef,
  } = params;

  // ── Session state ─────────────────────────────────────────────────────────
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [nativeHelpActive, setNativeHelpActive] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const sessionRef = useRef<any>(null);
  const sessionStartRef = useRef<number | null>(null);
  const messagesRef = useRef<DisplayMessage[]>([]);
  const pendingAITextRef = useRef<string>('');
  const pendingAIOutputRef = useRef<string>('');
  const pendingUserTextRef = useRef<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const playContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const mouthTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const savedRef = useRef(false);
  const stopLiveRef = useRef<() => void>(() => {});
  const didStopRef = useRef(false);
  const nativeHelpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMutedRef = useRef(false);
  const buildPromptRef = useRef<(langMode?: 'target' | 'native') => string>(() => '');

  // Keep isMutedRef in sync with isMuted state (for audio processor closure)
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Session timer
  useEffect(() => {
    if (!isLive) { setSessionSeconds(0); return; }
    const t = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isLive]);

  // Mirror messages to ref for access inside callbacks
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Camera display — wire srcObject when cameraOn flips
  useEffect(() => {
    if (cameraOn && videoRef.current && camStreamRef.current) {
      videoRef.current.srcObject = camStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOn, videoRef]);

  // ── Mouth animation ───────────────────────────────────────────────────────
  function startMouth() { mouthTimerRef.current = setInterval(() => setMouthOpen((v) => !v), 160); }
  function stopMouth() { if (mouthTimerRef.current) clearInterval(mouthTimerRef.current); setMouthOpen(false); }

  // ── Camera ────────────────────────────────────────────────────────────────
  const toggleCamera = useCallback(async () => {
    if (cameraOn) {
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
      setCameraOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      camStreamRef.current = stream;
      setCameraOn(true);
      setCameraError(false);
    } catch { setCameraError(true); }
  }, [cameraOn]);

  // ── Build system prompt ───────────────────────────────────────────────────
  function buildPrompt(langMode: 'target' | 'native' = 'target') {
    const lang = LANG_NAMES[targetLang] ?? 'English';
    const native = LANG_NAMES[nativeLang] ?? 'Italian';
    const activeLang = langMode === 'native' ? native : lang;
    const level = userProfile?.level ?? 'A1';
    const userName = userProfile?.userName ?? 'there';

    const reviewSection = reviewWords.length > 0
      ? `\n\nSPECIAL FOCUS — REVIEW SESSION:\nThe user has struggled with these words/phrases in past sessions: ${reviewWords.map((w) => `"${w}"`).join(', ')}.\nNaturally weave these into the conversation so the user gets to practice them. Don't make it obvious — just find organic ways to use them in context.\n`
      : '';

    const topicData = practiceTopic ? getDayByTopic(practiceTopic) : null;
    const topicSection = topicData
      ? `\n\nSCENARIO FOR THIS SESSION:\n${topicData.systemPromptContext}\nStay in this scenario for the entire session. Be the character described above.\n`
      : '';

    const pronData = pronunciationId ? getPronunciationSetById(pronunciationId) : null;
    const pronSection = pronData
      ? `\n\nPRONUNCIATION DRILL SESSION:\nThis is a focused pronunciation drill on: ${pronData.category} (${pronData.targetSound}).\nCoach tip: ${pronData.tip}\n\nWords to drill: ${pronData.words.join(', ')}.\n\nInstructions:\n- Say each word clearly and ask the user to repeat it.\n- Listen carefully and give specific phonetic feedback.\n- If the user struggles after 2 attempts, break the sound down step by step.\n- After drilling all words, have a short natural conversation using some of them.\n- Keep the tone encouraging and precise.\n`
      : '';

    const simData = scenarioId ? getScenarioById(scenarioId) : null;
    const isFreeChat = scenarioId === 'free-chat';
    const simSection = (simData && !isFreeChat)
      ? `\n\n══════════════════════════════════════════
SIMULATOR SCENARIO — OVERRIDES ALL OTHER RULES BELOW
══════════════════════════════════════════
${simData.systemPromptContext}

Objectives for this session: ${simData.objectives.join('; ')}.

CHARACTER RULES — NON-NEGOTIABLE:
- You ARE the character described above from the very first word. Never break this role.
- Do NOT introduce yourself as an AI, as a tutor, or as ChatLingo. Ever.
- Do NOT explain what scenario the user has chosen. Do NOT say "today we will practice X". Jump straight into the scene.
- Speak and behave exactly as the character would in a real-life situation.
- RULE #5 (SESSION START) is OVERRIDDEN: do not greet as a tutor. Open with the character's natural first line in the scene — as if the user just walked through the door. This IS the greeting, but spoken as the character (e.g. a border officer: "Good evening. Passport, please." — a hotel manager: "Good afternoon, welcome to the hotel. How can I help you?").

CORRECTIONS INSIDE THE SCENARIO:
- If the user makes a grammar mistake, correct it quickly in ONE sentence as the character naturally would (e.g. a border officer might say "You mean 'I am visiting', not 'I visit' — please repeat that for me.").
- After the correction, immediately continue the scene without any tutor commentary.
- NEVER step out of character to give a lesson or meta-feedback. The correction IS part of the scene.
- Do not say "as your tutor" or "as ChatLingo" — stay in character 100%.

EXITING CHARACTER:
- Only if the user says "esci dal personaggio", "stop the scenario", or "pause" — briefly step out to help, then immediately return to the scene.\n`
      : '';

    const scenarioSection = topicSection + pronSection + simSection;

    if (phase === 'review' && topicData) {
      return `You are ${tutorName}, a spoken-only AI language tutor inside the ChatLingo app. You are testing ${userName} (CEFR level: ${level}) in ${lang}.

REVIEW TEST MODE — Day ${practiceDay}: ${topicData.title}
══════════════════════════════════════════
You are now running a short review test on what was practiced in today's session.

SCENARIO CONTEXT: ${topicData.systemPromptContext}

YOUR TASK:
1. Ask the user exactly 5 questions one at a time, testing vocabulary and phrases relevant to the scenario above.
2. After each answer, give brief encouraging feedback (correct/incorrect, and the right form if needed).
3. After the 5th question and feedback, say exactly: "Great job! Your review for today is complete. Well done!"
4. Do NOT ask more than 5 questions. Do NOT continue the conversation after saying the completion phrase.

OUTPUT FORMAT: Output ONLY the spoken words. No reasoning, no headers, no internal notes.
Be warm, clear, and encouraging throughout.`;
    }

    const langSwitchRule = `
══════════════════════════════════════════
LANGUAGE MODE — RULE #0
══════════════════════════════════════════
You are currently speaking in: ${activeLang}.
Speak in ${lang} at all times.
If you ever explain something in ${native} to help the user understand, you MUST still speak all ${lang} phrases, corrections, and examples OUT LOUD in ${lang} — never translate them into ${native}. The transcript must always capture ${lang} words in ${lang}.
Example: if explaining in Italian that the correct form is "I will go to school", say — in Italian — "si dice" then switch to ${lang} to say "I will go to school" out loud, then continue in Italian. The ${lang} phrase is always spoken in ${lang}.
`;

    const simData2 = scenarioId ? getScenarioById(scenarioId) : null;
    const isFreeChat2 = scenarioId === 'free-chat';

    return `You are ${tutorName}, a spoken-only AI language tutor inside the ChatLingo app. You are talking with ${userName} (CEFR level: ${level}).${reviewSection}${scenarioSection}${langSwitchRule}

══════════════════════════════════════════
OUTPUT FORMAT — ABSOLUTE RULE #1
══════════════════════════════════════════
You are a voice assistant. Your text output is ONLY what you speak out loud to the user.

NEVER write:
- Reasoning, planning, or analysis ("My plan is...", "I will now...", "I analyzed...")
- Section headers or markdown (**Confirming Tone**, ## Step 1, etc.)
- Internal notes, intentions, or meta-commentary
- Anything the user would not hear in a real spoken conversation

If you catch yourself writing a plan or analysis — delete it. Output ONLY the spoken words.

══════════════════════════════════════════
GRAMMAR CORRECTION — RULE #2
══════════════════════════════════════════
When the user makes a grammar mistake:
1. Repeat what they said, then offer the correct form clearly:
   → "You said 'I is good' — the correct form is **I am good**. Can you try that?"
2. Wait for them to repeat.
   - Correct → praise briefly, continue the conversation.
   - Still wrong → explain the rule simply, try once more.
3. Maximum 3 attempts per mistake.
   - After 3 failed attempts → "No worries, let's keep going! [HARD:I am good]" and move on.
   - The [HARD:phrase] tag is invisible to the user — app use only.

RESTART DETECTION — RULE #3:
If corrections have interrupted the conversation more than 4 times, OR the user keeps repeating the same mistake, naturally offer to go back and try again.

Do NOT use scripted phrases. Find your own natural wording every time. Examples of the KIND of thing to say (never copy these verbatim):
- "Now that you know the right form, let's go back — I'll ask you the same question again."
- "Ok, so you've got it now. Let me try that question one more time — you know what to say."
- "Let's rewind a little. Same question, fresh start — I think you'll get it this time."
- "We've hit this a few times — want to reset and try the whole exchange again?"
- "Good. Now let's see if it flows naturally — I'll ask you again from the top."

Choose whichever feels most natural for the moment. Always wait for the user to respond before continuing.

══════════════════════════════════════════
PRONUNCIATION COACHING — RULE #4
══════════════════════════════════════════
If a word sounds unclear or mispronounced:
- Ask gently: "Did you have any trouble saying '[word]'?"
- If yes → break it into sounds step by step, e.g.: "Let's try: /wɜːrld/ — 'wuh' + 'erld'. Say it slowly with me."
  - Write the phonetic breakdown clearly so the user can read and follow it.
  - Up to 3 attempts. After 3 → "No worries! [HARD:word]" and continue.
- If no → move on naturally.

══════════════════════════════════════════
SESSION START — RULE #5
══════════════════════════════════════════
${(simData2 && !isFreeChat2)
  ? `This is a SCENARIO session. IGNORE this rule entirely. Your opening line IS the greeting — but spoken as the character, not as a tutor. Start the scene naturally with the character's first words, as if the user just arrived.`
  : `When the session begins, greet the user naturally to break the ice.
Do NOT wait for them to speak first. Say something warm and brief — your own words, not a scripted line.
CRITICAL: End your greeting with a question, then STOP. Wait for the user to answer. Never answer your own question.
Examples of the KIND of greeting (never copy verbatim):
- "Hey! How are you doing today?" → then wait.
- "Hi! Anything interesting happen lately?" → then wait.
- "Hello! What would you like to talk about today?" → then wait.`
}

══════════════════════════════════════════
WRONG PHRASE TAGGING — RULE #6
══════════════════════════════════════════
When you correct the user, include a hidden tag for each incorrect phrase:
  [WRONG:the exact wrong phrase the user said]

Examples:
- User says "I go to school yesterday" → include [WRONG:I go to school yesterday] (or just [WRONG:I go])
- User says "She don't know" → include [WRONG:don't know]

Rules:
- Tag only the specific wrong part, not the whole sentence unless the whole sentence is wrong.
- The tag is INVISIBLE to the user — for app highlighting only.
- Never mention the tag in your spoken response.
- Keep tags concise: match what the user literally said.

══════════════════════════════════════════
CONVERSATION RULES — RULE #7
══════════════════════════════════════════
- Speak in ${lang} at the right pace for level ${level}.
- Keep responses short and focused — one idea at a time.
- Be warm, patient, and encouraging. Frame every correction as a learning moment, not a failure.
- Never make the user feel judged or pressured.
- NEVER answer your own question. If you ask something, stop and wait for the user to reply.
- Ask only ONE question at a time. Never stack multiple questions in a single turn.

ANTI-LOOP RULE — ABSOLUTE:
After you ask a question, you MUST stop speaking and wait. Do NOT continue speaking. Do NOT answer it yourself. Do NOT re-ask it. Do NOT comment on the silence. Just wait. Even if seconds pass — STAY SILENT until the user speaks. This is non-negotiable.

══════════════════════════════════════════
NATURAL SPEECH — RULE #8
══════════════════════════════════════════
When the user says something grammatically correct but unnatural for a native speaker, gently suggest the colloquial alternative as a bonus tip. Do not treat it as an error — frame it as "a native would also say...".
Examples:
- "I do not know" → tip: natives say "I don't know" or informally "dunno"
- "I am going to" → tip: in speech, natives often say "I'm gonna"
- "I would like to" → tip: "I'd like to" or even "I wanna" in casual speech
- "It is okay" → tip: "It's okay" or "It's fine" / "No worries"
Keep the tip brief (one sentence) and only offer it once per phrase, not every time.`;
  }

  // Keep buildPromptRef always pointing to the latest version (avoids stale closure in startLive)
  buildPromptRef.current = buildPrompt;

  // ── Voice selection by accent ─────────────────────────────────────────────
  // Maps target language / English accent codes to Gemini Live voice names.
  // American and Australian use Aoede (neutral); British uses Kore (British female).
  function getVoice(): string {
    const map: Record<string, string> = {
      'en-US': 'Aoede',
      'en-GB': 'Kore',
      'en-AU': 'Aoede',
    };
    return map[targetLang] ?? 'Aoede';
  }

  // ── Stop live session ─────────────────────────────────────────────────────
  const stopLive = useCallback(() => {
    setIsLive(false);
    setIsConnecting(false);
    setIsTutorSpeaking(false);
    stopMouth();

    activeSourcesRef.current.forEach(s => { try { s.stop(); s.disconnect(); } catch {} });
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;

    if ((sessionRef as any)._iceBreakerTimer) clearTimeout((sessionRef as any)._iceBreakerTimer);

    processorRef.current?.disconnect();
    processorRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    playContextRef.current?.close();
    playContextRef.current = null;

    sessionRef.current?.close();
    sessionRef.current = null;
    pendingAITextRef.current = '';

    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach(t => t.stop());
      camStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef]);

  // Keep stopLiveRef in sync for unmount
  useEffect(() => { stopLiveRef.current = stopLive; }, [stopLive]);

  // Cleanup on unmount
  useEffect(() => () => {
    stopLiveRef.current();
    if (nativeHelpTimerRef.current) clearTimeout(nativeHelpTimerRef.current);
  }, []);

  // ── Start live session ────────────────────────────────────────────────────
  const startLive = useCallback(async () => {
    if (!user) return;
    didStopRef.current = false;
    setIsConnecting(true);
    setError('');

    try {
      const idToken = await auth.currentUser?.getIdToken();
      const tokenRes = await fetch('/api/live-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ systemPrompt: buildPromptRef.current('target'), voiceName: getVoice() }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        console.error('live-token error:', tokenRes.status, err);
        throw new Error(err.error ?? 'Failed to get token');
      }

      const { apiKey } = await tokenRes.json();

      // Request mic BEFORE connecting so it's ready the moment the session opens
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      playContextRef.current = new AudioContext({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      if (playContextRef.current.state === 'suspended') await playContextRef.current.resume();
      nextPlayTimeRef.current = playContextRef.current.currentTime;

      const currentScenarioId = new URLSearchParams(window.location.search).get('scenario');
      const isScenario = !!currentScenarioId && currentScenarioId !== 'free-chat';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-latest',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: getVoice() } } },
          systemInstruction: buildPromptRef.current('target'),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          realtimeInputConfig: {
            automaticActivityDetection: {
              disabled: false,
              startOfSpeechSensitivity: 'START_SENSITIVITY_HIGH',
              endOfSpeechSensitivity: 'END_SENSITIVITY_LOW',
              prefixPaddingMs: 200,
              silenceDurationMs: 1500,
            },
          },
          ...(({ thinkingConfig: { thinkingBudget: 0 } }) as any),
        },
        callbacks: {
          onopen: async () => {
            setIsLive(true);
            setIsConnecting(false);
            sessionStartRef.current = Date.now();
            pendingAITextRef.current = '';
            pendingAIOutputRef.current = '';
            pendingUserTextRef.current = '';

            // Wire up the mic immediately (already acquired before connecting)
            const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            processorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            source.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current!.destination);

            // Icebreaker: for scenarios, tell the AI to open in character; for normal sessions, trigger a greeting
            const iceBreakerTimer = setTimeout(() => {
              if (messagesRef.current.length === 0 && sessionRef.current) {
                try {
                  const iceBreakerText = isScenario
                    ? '[The user has arrived. Open the scene now — stay fully in character as described. Do NOT greet as a tutor.]'
                    : '[session started]';
                  sessionRef.current.sendClientContent({
                    turns: [{ role: 'user', parts: [{ text: iceBreakerText }] }],
                    turnComplete: true,
                  });
                } catch { /* session may not support this method */ }
              }
            }, 1500);
            (sessionRef as any)._iceBreakerTimer = iceBreakerTimer;

            processorRef.current.onaudioprocess = (e) => {
              if (isMutedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
              }
              const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
              sessionRef.current?.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
            };
          },

          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && playContextRef.current) {
              setIsTutorSpeaking(true);
              startMouth();

              const bytes = Uint8Array.from(atob(base64Audio), (c) => c.charCodeAt(0));
              const pcm16 = new Int16Array(bytes.buffer);
              const audioBuffer = playContextRef.current.createBuffer(1, pcm16.length, 24000);
              const channelData = audioBuffer.getChannelData(0);
              for (let i = 0; i < pcm16.length; i++) channelData[i] = pcm16[i] / 32768;

              const source = playContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(playContextRef.current.destination);
              if (nextPlayTimeRef.current < playContextRef.current.currentTime) {
                nextPlayTimeRef.current = playContextRef.current.currentTime;
              }
              activeSourcesRef.current.push(source);
              source.start(nextPlayTimeRef.current);
              nextPlayTimeRef.current += audioBuffer.duration;
              source.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
                setIsTutorSpeaking(false);
                stopMouth();
              };
            }

            if (pendingUserTextRef.current && (message.serverContent?.modelTurn?.parts?.length ?? 0) > 0) {
              const userText = pendingUserTextRef.current;
              pendingUserTextRef.current = '';
              setLiveTranscript('');
              setMessages((prev) => [...prev, { role: 'user', content: userText, timestamp: new Date() }]);
            }

            const modelParts = message.serverContent?.modelTurn?.parts ?? [];
            for (const part of modelParts) {
              if (part.text) pendingAITextRef.current += part.text;
            }

            const inputT = message.serverContent?.inputTranscription;
            if (inputT) {
              console.log('[transcript raw]', JSON.stringify(inputT));
              const transcriptText =
                inputT.text ??
                (Array.isArray(inputT.parts) ? inputT.parts.map((p: any) => p.text ?? '').join('') : '');
              if (transcriptText) {
                pendingUserTextRef.current = pendingUserTextRef.current
                  ? pendingUserTextRef.current + ' ' + transcriptText
                  : transcriptText;
                setLiveTranscript(pendingUserTextRef.current);
              }
            }

            if (message.serverContent?.interrupted) {
              nextPlayTimeRef.current = playContextRef.current?.currentTime ?? 0;
              pendingAITextRef.current = '';
              pendingAIOutputRef.current = '';
              setIsTutorSpeaking(false);
              stopMouth();
            }

            const outputT = message.serverContent?.outputTranscription;
            if (outputT) {
              const aiOutText = outputT.text ??
                (Array.isArray(outputT.parts) ? outputT.parts.map((p: any) => p.text ?? '').join('') : '');
              if (aiOutText) pendingAIOutputRef.current += aiOutText;
            }

            if (message.serverContent?.interrupted) {
              if (pendingUserTextRef.current) {
                const userText = pendingUserTextRef.current;
                pendingUserTextRef.current = '';
                setLiveTranscript('');
                setMessages((prev) => [...prev, { role: 'user', content: userText, timestamp: new Date() }]);
              }
            }

            if (message.serverContent?.turnComplete) {
              setIsTutorSpeaking(false);
              stopMouth();

              if (pendingUserTextRef.current) {
                const userText = pendingUserTextRef.current;
                pendingUserTextRef.current = '';
                setLiveTranscript('');
                setMessages((prev) => [...prev, { role: 'user', content: userText, timestamp: new Date() }]);
              }

              const outputRaw = pendingAIOutputRef.current.trim();
              pendingAIOutputRef.current = '';
              const modelRaw = pendingAITextRef.current.trim();
              pendingAITextRef.current = '';

              const raw = outputRaw || modelRaw;
              if (raw) {
                const visible = filterReasoning(stripHardTags(raw));
                if (visible) {
                  setMessages((prev) => [...prev, { role: 'assistant', content: raw, timestamp: new Date() }]);
                }
              }
            }
          },

          onclose: () => {
            if (!didStopRef.current) { didStopRef.current = true; stopLive(); }
          },
          onerror: (err: any) => {
            if (!didStopRef.current) {
              didStopRef.current = true;
              console.error('Live API error:', err?.message ?? err?.code ?? err);
              setError(getConversationTranslations(uiLang).connectionError);
              stopLive();
            }
          },
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message ?? getConversationTranslations(uiLang).genericError);
      setIsConnecting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile]);

  // ── Native language help ──────────────────────────────────────────────────
  function requestNativeHelp() {
    if (!sessionRef.current || !isLive || nativeHelpActive) return;
    const nativeName = LANG_NAMES[nativeLang] ?? 'Italian';
    const targetName = LANG_NAMES[targetLang] ?? 'English';
    const lastAiMsg = [...messagesRef.current].reverse().find((m) => m.role === 'assistant');
    const instruction = lastAiMsg
      ? `[SYSTEM - comprehension help] The user pressed the help button because they did not understand your last message. Follow these rules exactly:

1. Speak your explanation in ${nativeName} — this is the user's native language and helps them understand.
2. TRANSCRIPT RULE (non-negotiable): Any ${targetName} phrase, word, or correction must be spoken OUT LOUD in ${targetName}, never translated. The transcript must capture them in ${targetName}. Example: if explaining in Italian and correcting "I will go to school", say — in Italian — "si dice" then switch to ${targetName} to say "I will go to school" then continue in Italian. The ${targetName} words are always spoken in ${targetName}, even inside an Italian sentence.
3. Repeat your last message following rule 2 above.
4. Maintain all context: the topic, corrections in progress, scenario — nothing resets.
5. After your explanation, ask the user (in ${nativeName}): whether they want to continue in ${nativeName} or return to ${targetName}.
6. If the user chooses to continue in ${nativeName}: keep explaining in ${nativeName} but always speak ${targetName} examples in ${targetName}.
7. If the user chooses ${targetName}: switch back immediately and continue exactly where you left off.`
      : `[SYSTEM - comprehension help] The user pressed the help button. Summarise the current topic in ${nativeName}. Any ${targetName} phrases must be spoken in ${targetName} — never translated. Then ask if they want to continue in ${nativeName} or return to ${targetName}.`;
    try {
      sessionRef.current.sendClientContent({ turns: [{ role: 'user', parts: [{ text: instruction }] }], turnComplete: true });
      setNativeHelpActive(true);
      if (nativeHelpTimerRef.current) clearTimeout(nativeHelpTimerRef.current);
      nativeHelpTimerRef.current = setTimeout(() => setNativeHelpActive(false), 6000);
    } catch {}
  }

  const toggleMute = useCallback(() => setIsMuted((v) => !v), []);

  return {
    isLive, isConnecting, isTutorSpeaking, mouthOpen, isMuted, setIsMuted,
    messages, liveTranscript, error, sessionSeconds, nativeHelpActive,
    cameraOn, cameraError, sessionStartRef, messagesRef, savedRef,
    startLive, stopLive, toggleMute, requestNativeHelp, toggleCamera,
  };
}
