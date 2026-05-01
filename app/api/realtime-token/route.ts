import { NextResponse } from 'next/server';

// Genera un token effimero OpenAI Realtime (valido 1 minuto)
// Il client usa questo token per connettersi direttamente via WebRTC/WebSocket
// senza mai esporre la chiave API principale al browser.
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const model = body.model ?? 'gpt-4o-realtime-preview-2024-12-17';
  const voice = body.voice ?? 'alloy';

  const res = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, voice }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('OpenAI session error:', err);
    return NextResponse.json({ error: 'Failed to create session', detail: err }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
