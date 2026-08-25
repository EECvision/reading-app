import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';
// msedge-tts uses Node.js APIs (WebSocket, stream) — must run on Node runtime
export const runtime = 'nodejs';

// ─── In-memory audio cache ────────────────────────────────────────────────────
// Key: sha256(voice:rate:text) — deterministic, collision-resistant
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 200;

function cacheKey(text: string, voice: string, rate: number): string {
  return createHash('sha256')
    .update(`${voice}:${rate}:${text}`)
    .digest('hex')
    .slice(0, 24);
}

function evictIfNeeded() {
  if (audioCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = audioCache.keys().next().value;
    if (oldest !== undefined) audioCache.delete(oldest);
  }
}

// ─── Rate → SSML prosody ─────────────────────────────────────────────────────
// Rate 0.75 → "-25%", 1.0 → "+0%", 1.5 → "+50%"
function rateToSSML(rate: number): string {
  const pct = Math.round((rate - 1) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const text  = (searchParams.get('text')  ?? '').trim();
  const voice = searchParams.get('voice')  ?? 'en-US-AriaNeural';
  const rate  = parseFloat(searchParams.get('rate') ?? '1');

  if (!text) {
    return new NextResponse('Missing text', { status: 400 });
  }

  const key = cacheKey(text, voice, rate);

  // Cache hit — return immediately
  const cached = audioCache.get(key);
  if (cached) {
    return new NextResponse(new Uint8Array(cached), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'HIT',
      },
    });
  }

  // Cache miss — generate via Edge TTS
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Wrap in SSML prosody only when rate differs from 1x
    const input = rate === 1
      ? text
      : `<prosody rate="${rateToSSML(rate)}">${text}</prosody>`;

    const { audioStream } = tts.toStream(input);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('close', resolve);
      audioStream.on('error', reject);
    });

    const audioBuffer = Buffer.concat(chunks);

    evictIfNeeded();
    audioCache.set(key, audioBuffer);

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS',
      },
    });
  } catch (err: unknown) {
    console.error('[TTS API]', err);
    return new NextResponse('TTS generation failed', { status: 502 });
  }
}
