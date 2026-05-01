'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, Phone } from 'lucide-react';
import { auth } from '@/lib/firebase';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LogEntry {
  time: string;
  type: 'info' | 'error' | 'ai' | 'user';
  text: string;
}

// ── Test page for OpenAI Realtime API ─────────────────────────────────────────
export default function TestRealtimePage() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function log(type: LogEntry['type'], text: string) {
    const time = new Date().toLocaleTimeString('it-IT');
    setLogs((prev) => [...prev, { time, type, text }]);
  }

  const startSession = useCallback(async () => {
    setStatus('connecting');
    setLogs([]);
    setTranscript('');
    log('info', 'Richiesta token effimero a OpenAI...');

    try {
      // 1. Get ephemeral token from our server
      const idToken = await auth.currentUser?.getIdToken();
      const tokenRes = await fetch('/api/realtime-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ voice: 'alloy' }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err.detail ?? err.error ?? 'Token request failed');
      }

      const { client_secret } = await tokenRes.json();
      log('info', '✅ Token effimero ricevuto');

      // 2. Create WebRTC peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 3. Audio element for AI voice output
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (e) => { audio.srcObject = e.streams[0]; };

      // 4. Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      log('info', '🎤 Microfono attivo');

      // 5. Data channel for events (transcripts, function calls)
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.onopen = () => {
        log('info', '📡 Data channel aperto');
        // Send session config
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `Sei un tutor di lingua inglese di nome Alex. Parla in inglese.
Quando l'utente fa un errore grammaticale, digli esattamente cosa ha detto e proponi la forma corretta (es. "Hai detto 'I is good' — intendevi 'I am good'? Prova a ridirlo.").
Dopo 3 tentativi falliti, vai avanti con "No worries, let's keep going!" e inserisci [HARD:frase corretta].
Monitora anche la pronuncia: se una parola suona incerta, chiedi "Hai avuto difficoltà con [parola]?".
Sii incoraggiante e naturale.`,
            voice: 'alloy',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: { type: 'server_vad', silence_duration_ms: 800 },
          },
        }));
        setStatus('live');
        log('info', '🟢 Sessione live avviata!');
      };

      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          handleRealtimeEvent(event);
        } catch {
          // ignore
        }
      };

      dc.onerror = (e) => log('error', `Data channel error: ${JSON.stringify(e)}`);

      // 6. Create SDP offer and connect to OpenAI
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(
        `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${client_secret.value}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );

      if (!sdpRes.ok) throw new Error(`SDP exchange failed: ${sdpRes.status}`);

      const answer: RTCSessionDescriptionInit = { type: 'answer', sdp: await sdpRes.text() };
      await pc.setRemoteDescription(answer);
      log('info', '🤝 WebRTC handshake completato');

    } catch (err) {
      log('error', `❌ Errore: ${(err as Error).message}`);
      setStatus('error');
      stopSession();
    }
  }, []);

  function handleRealtimeEvent(event: Record<string, unknown>) {
    const type = event.type as string;

    if (type === 'conversation.item.input_audio_transcription.completed') {
      const text = (event.transcript as string) ?? '';
      log('user', `[Tu] ${text}`);
      setTranscript((prev) => prev + `\n[Tu] ${text}`);
    }

    if (type === 'response.audio_transcript.done') {
      const text = (event.transcript as string) ?? '';
      log('ai', `[Alex] ${text}`);
      setTranscript((prev) => prev + `\n[Alex] ${text}`);
    }

    if (type === 'error') {
      log('error', `OpenAI error: ${JSON.stringify(event.error)}`);
    }
  }

  function stopSession() {
    dcRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioRef.current) audioRef.current.srcObject = null;
    pcRef.current = null;
    dcRef.current = null;
    streamRef.current = null;
    setStatus('idle');
    log('info', '🔴 Sessione terminata');
  }

  function toggleMute() {
    if (!streamRef.current) return;
    const enabled = !isMuted;
    streamRef.current.getTracks().forEach((t) => { t.enabled = enabled; });
    setIsMuted(!isMuted);
  }

  const statusColors = {
    idle: 'bg-gray-500',
    connecting: 'bg-yellow-500 animate-pulse',
    live: 'bg-green-500 animate-pulse',
    error: 'bg-red-500',
  };

  const statusLabels = {
    idle: 'Non connesso',
    connecting: 'Connessione in corso...',
    live: 'Live',
    error: 'Errore',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 font-mono">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🧪 OpenAI Realtime — Test</h1>
            <p className="text-gray-400 text-sm">Pagina di test isolata (non in produzione)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
            <span className="text-sm text-gray-300">{statusLabels[status]}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {status === 'idle' || status === 'error' ? (
            <button
              onClick={startSession}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
            >
              <Phone className="w-5 h-5" /> Avvia sessione
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                disabled={status === 'connecting'}
                className={`flex items-center gap-2 font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-50 ${
                  isMuted ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                onClick={stopSession}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                <PhoneOff className="w-5 h-5" /> Termina
              </button>
            </>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-gray-900 rounded-xl p-4 space-y-1">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Trascrizione</p>
            {transcript.trim().split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className={`text-sm ${line.startsWith('[Alex]') ? 'text-indigo-300' : 'text-white'}`}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Logs */}
        <div className="bg-gray-900 rounded-xl p-4 space-y-1 max-h-80 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Log</p>
          {logs.length === 0 && <p className="text-gray-600 text-sm">Nessun log ancora.</p>}
          {logs.map((l, i) => (
            <p key={i} className={`text-xs ${
              l.type === 'error' ? 'text-red-400' :
              l.type === 'ai' ? 'text-indigo-300' :
              l.type === 'user' ? 'text-green-300' :
              'text-gray-400'
            }`}>
              <span className="text-gray-600">{l.time} </span>{l.text}
            </p>
          ))}
        </div>

      </div>
    </div>
  );
}
