// ─── Edge TTS Client Module ───────────────────────────────────────────────────
// Fetches audio from /api/tts (server-side msedge-tts) and plays it via a
// standard HTML5 <audio> element (Blob URL). Using HTMLAudioElement instead of
// the Web Audio API gives us:
//   • Native cross-browser MP3 support (Firefox, Safari, Chrome, mobile)
//   • Built-in pause / seek without manual offset tracking
//   • Better autoplay policy compliance (no AudioContext resume dance)

let currentAudio: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;
let currentAbort: AbortController | null = null;
let savedOnEnd: (() => void) | undefined;
let edgeIsPaused = false;

export interface EdgeSpeakOptions {
  text: string;
  voice?: string;
  rate?: number;
  muted?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (msg: string) => void;
}

export async function edgeSpeak(opts: EdgeSpeakOptions): Promise<void> {
  edgeStop();

  if (opts.muted) {
    opts.onStart?.();
    opts.onEnd?.();
    return;
  }

  const abort = new AbortController();
  currentAbort = abort;
  savedOnEnd = opts.onEnd;

  const params = new URLSearchParams({
    text:  opts.text,
    voice: opts.voice ?? 'en-US-AriaNeural',
    rate:  String(opts.rate ?? 1),
  });

  let blob: Blob;
  try {
    const res = await fetch(`/api/tts?${params.toString()}`, { signal: abort.signal });
    if (!res.ok) throw new Error(`TTS API ${res.status}`);
    blob = await res.blob();
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') return;
    opts.onError?.((err as Error).message ?? 'Edge TTS request failed');
    return;
  }

  if (abort.signal.aborted) return;

  // Create a Blob URL and hand it to a plain <audio> element.
  // This approach works identically in Chrome, Firefox, Safari, and on mobile —
  // no AudioContext, no decodeAudioData, no resume() dance required.
  const blobUrl = URL.createObjectURL(blob);
  currentBlobUrl = blobUrl;

  const audio = new Audio(blobUrl);
  currentAudio = audio;
  edgeIsPaused = false;

  // Apply playback rate — HTML audio element supports it natively
  audio.playbackRate = opts.rate ?? 1;

  audio.onended = () => {
    if (currentAudio === audio) {
      _cleanup();
      if (!abort.signal.aborted) savedOnEnd?.();
    }
  };

  audio.onerror = () => {
    if (currentAudio === audio) {
      _cleanup();
      opts.onError?.('Audio playback error');
    }
  };

  try {
    await audio.play();
    opts.onStart?.();
  } catch (err: unknown) {
    // play() rejects if aborted between fetch and play (e.g. user navigated away)
    if ((err as Error).name !== 'AbortError') {
      opts.onError?.((err as Error).message ?? 'Audio play failed');
    }
    _cleanup();
  }
}

function _cleanup(): void {
  currentAudio = null;
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
}

export function edgePause(): void {
  if (!currentAudio || edgeIsPaused) return;
  edgeIsPaused = true;
  currentAudio.pause();
}

export function edgeResume(): void {
  if (!edgeIsPaused || !currentAudio) return;
  edgeIsPaused = false;
  currentAudio.play().catch(() => {/* ignore */});
}

export function edgeGetIsPaused(): boolean {
  return edgeIsPaused;
}

export function edgeStop(): void {
  if (currentAbort) {
    currentAbort.abort();
    currentAbort = null;
  }
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio = null;
  }
  _cleanup();
  edgeIsPaused = false;
  savedOnEnd = undefined;
}

// ─── Curated voice list ───────────────────────────────────────────────────────

export interface EdgeVoice {
  id: string;
  label: string;
  accent: 'American' | 'British' | 'Australian';
  gender: 'Female' | 'Male';
}

export const EDGE_VOICES: EdgeVoice[] = [
  { id: 'en-US-AriaNeural',     label: 'Aria (US Female)',       accent: 'American',   gender: 'Female' },
  { id: 'en-US-JennyNeural',    label: 'Jenny (US Female)',      accent: 'American',   gender: 'Female' },
  { id: 'en-US-GuyNeural',      label: 'Guy (US Male)',          accent: 'American',   gender: 'Male'   },
  { id: 'en-US-EricNeural',     label: 'Eric (US Male)',         accent: 'American',   gender: 'Male'   },
  { id: 'en-GB-SoniaNeural',    label: 'Sonia (UK Female)',      accent: 'British',    gender: 'Female' },
  { id: 'en-GB-RyanNeural',     label: 'Ryan (UK Male)',         accent: 'British',    gender: 'Male'   },
  { id: 'en-AU-NatashaNeural',  label: 'Natasha (AU Female)',    accent: 'Australian', gender: 'Female' },
  { id: 'en-AU-WilliamNeural',  label: 'William (AU Male)',      accent: 'Australian', gender: 'Male'   },
];
