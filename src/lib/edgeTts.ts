// ─── Edge TTS Client Module ───────────────────────────────────────────────────
// Fetches audio from /api/tts (server-side msedge-tts) and plays it via a
// standard HTML5 <audio> element (Blob URL). Using HTMLAudioElement instead of
// the Web Audio API gives us native cross-browser MP3 support across Firefox,
// Safari, Chrome, and mobile without any AudioContext resume dance.
//
// Firefox autoplay note:
// Firefox requires audio.play() to be called within the SYNCHRONOUS part of a
// user-gesture handler. Awaiting a fetch() first breaks that synchronous chain.
// To work around this, we "unlock" audio in the gesture tick by immediately
// playing a tiny silent audio, then swap the src once the MP3 is ready.

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

// Tiny 1-frame silent MP3 — used to unlock the audio element inside the user
// gesture tick before the fetch resolves (Firefox autoplay requirement).
const SILENT_MP3 =
  'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADQADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAUHAAAAAAAAg0AF4AAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuOTguNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

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

  // ── Step 1: Unlock audio SYNCHRONOUSLY inside the user-gesture tick ──────
  // Creating the Audio element and calling play() with a silent MP3 here
  // (before any await) satisfies Firefox's requirement that audio playback
  // originates from a synchronous user-gesture handler. Without this,
  // Firefox blocks play() called after the async fetch resolves.
  const audio = new Audio(SILENT_MP3);
  audio.playbackRate = opts.rate ?? 1;
  currentAudio = audio;

  // Fire-and-forget the silent play to unlock; we don't care if it rejects
  // (it will on some systems when there's no autoplay permission yet, but
  // calling it is enough to register the intent with the browser).
  audio.play().catch(() => {/* unlock intent */});

  // ── Step 2: Fetch the real audio asynchronously ───────────────────────────
  // IMPORTANT: Always request rate=1 from the server (plain text, no SSML).
  // Wrapping text in an SSML <prosody rate="..."> fragment causes msedge-tts
  // to drop the WebSocket stream before synthesis completes — 100% failure rate
  // for any rate ≠ 1. Speed is controlled client-side via audio.playbackRate,
  // which works natively in all browsers and is already set on the element above.
  const params = new URLSearchParams({
    text:  opts.text,
    voice: opts.voice ?? 'en-US-AriaNeural',
    rate:  '1', // always fetch at 1×; playback speed set via audio.playbackRate
  });

  let blob: Blob;
  try {
    const res = await fetch(`/api/tts?${params.toString()}`, { signal: abort.signal });
    if (!res.ok) throw new Error(`TTS API ${res.status}`);
    blob = await res.blob();
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') return;
    _cleanup();
    opts.onError?.((err as Error).message ?? 'Edge TTS request failed');
    return;
  }

  if (abort.signal.aborted) {
    _cleanup();
    return;
  }

  // ── Step 3: Swap in the real audio and play ───────────────────────────────
  // Pause the silent audio (it may have already ended), replace its src with
  // the real MP3 blob URL, then play. Because we already called play() above
  // in the gesture tick, Firefox treats this element as "user-activated" and
  // allows the subsequent play() call from async context.
  audio.pause();

  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
  }
  const blobUrl = URL.createObjectURL(blob);
  currentBlobUrl = blobUrl;

  audio.src = blobUrl;
  audio.playbackRate = opts.rate ?? 1;
  audio.load(); // required after changing src

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
