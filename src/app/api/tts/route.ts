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

// ─── XML-escape text for safe SSML embedding ─────────────────────────────────
// Prevents ampersands, angle brackets, etc. from breaking the prosody tag.
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── Core TTS generation (single attempt) ────────────────────────────────────
async function generateAudio(voice: string, text: string, rate: number): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  // Wrap in SSML prosody only when rate differs from 1×.
  // Use XML-escaped text to avoid malformed SSML (em-dashes, apostrophes, etc.
  // can cause the WebSocket stream to be dropped by Microsoft's TTS service).
  const input =
    rate === 1
      ? text
      : `<prosody rate="${rateToSSML(rate)}">${escapeXml(text)}</prosody>`;

  const { audioStream } = tts.toStream(input);

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    audioStream.on('close', resolve);
    audioStream.on('error', reject);
  });

  const buf = Buffer.concat(chunks);
  if (buf.length === 0) throw new Error('Empty audio buffer received');
  return buf;
}

// ─── Route handler ────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500; // first retry after 500 ms, second after 1000 ms

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const text  = (searchParams.get('text')  ?? '').trim();
  const voice = searchParams.get('voice')  ?? 'en-US-AriaNeural';
  const rate  = parseFloat(searchParams.get('rate') ?? '1');

  if (!text) {
    return new NextResponse('Missing text', { status: 400 });
  }

  const key = cacheKey(text, voice, rate);

  // Cache hit — return immediately without touching msedge-tts
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

  // Cache miss — generate via Edge TTS with retry logic.
  // The msedge-tts library uses an unofficial Microsoft WebSocket API that can
  // drop connections intermittently ("Stream closed before synthesis completed").
  // Retrying with a short backoff resolves the vast majority of transient failures.
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 1) {
      const delay = RETRY_DELAY_MS * (attempt - 1);
      console.warn(`[TTS API] Retry ${attempt - 1}/${MAX_RETRIES - 1} after ${delay}ms (${lastError.message})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const audioBuffer = await generateAudio(voice, text, rate);

      evictIfNeeded();
      audioCache.set(key, audioBuffer);

      return new NextResponse(new Uint8Array(audioBuffer), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'MISS',
          'X-TTS-Attempts': String(attempt),
        },
      });
    } catch (err: unknown) {
      lastError = err as Error;
    }
  }

  console.error(`[TTS API] All ${MAX_RETRIES} attempts failed:`, lastError);
  return new NextResponse('TTS generation failed', { status: 502 });
}
