// ─── Edge TTS Client Module ───────────────────────────────────────────────────
// Fetches audio from /api/tts and plays it via the Web Audio API.
// All heavy lifting (msedge-tts, caching) happens server-side.

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentAbort: AbortController | null = null;

// ─── Pause / resume state ─────────────────────────────────────────────────────
// AudioBufferSourceNode can't pause natively — we stop it, record the offset,
// then create a new source from the same buffer starting at that offset.
let pausedBuffer: AudioBuffer | null = null;
let pauseOffset = 0;       // seconds into the audio where we paused
let startedAt = 0;         // audioCtx.currentTime when source.start() was called
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

  // IMPORTANT for mobile (iOS Safari, Android Chrome):
  // AudioContext must be created and resumed synchronously inside the user
  // interaction event handler before any async await (like fetch) happens.
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    // We don't await this here because we want to trigger it synchronously
    // in the event loop tick of the user interaction.
    audioCtx.resume();
  }

  const abort = new AbortController();
  currentAbort = abort;

  const params = new URLSearchParams({
    text:  opts.text,
    voice: opts.voice ?? 'en-US-AriaNeural',
    rate:  String(opts.rate ?? 1),
  });

  let arrayBuffer: ArrayBuffer;
  try {
    const res = await fetch(`/api/tts?${params.toString()}`, { signal: abort.signal });
    if (!res.ok) throw new Error(`TTS API ${res.status}`);
    arrayBuffer = await res.arrayBuffer();
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') return;
    opts.onError?.((err as Error).message ?? 'Edge TTS request failed');
    return;
  }

  if (abort.signal.aborted) return;

  let decoded: AudioBuffer;
  try {
    decoded = await audioCtx.decodeAudioData(arrayBuffer);
  } catch {
    opts.onError?.('Failed to decode audio');
    return;
  }

  if (abort.signal.aborted) return;

  // Save state needed for pause/resume
  pausedBuffer = decoded;
  savedOnEnd = opts.onEnd;

  _playFromOffset(decoded, 0, abort);

  opts.onStart?.();
}

function _playFromOffset(buffer: AudioBuffer, offset: number, abort: AbortController): void {
  if (!audioCtx) return;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  currentSource = source;
  startedAt = audioCtx.currentTime - offset;

  source.onended = () => {
    if (currentSource === source) currentSource = null;
    // Only fire onEnd if this wasn't a manual stop/pause
    if (!abort.signal.aborted && !edgeIsPaused) savedOnEnd?.();
  };

  source.start(0, offset);
}

export function edgePause(): void {
  if (!currentSource || !audioCtx || edgeIsPaused) return;
  // Record how far into the audio we are
  pauseOffset = audioCtx.currentTime - startedAt;
  edgeIsPaused = true;
  try { currentSource.stop(); } catch { /* already stopped */ }
  currentSource = null;
}

export function edgeResume(): void {
  if (!edgeIsPaused || !pausedBuffer || !audioCtx) return;
  edgeIsPaused = false;
  // Reuse the same abort controller from the original speak call — if it was
  // aborted (i.e. edgeStop was called) edgePause would have already reset state
  const abort = currentAbort ?? new AbortController();
  _playFromOffset(pausedBuffer, pauseOffset, abort);
  pauseOffset = 0;
}

export function edgeGetIsPaused(): boolean {
  return edgeIsPaused;
}

export function edgeStop(): void {
  if (currentAbort) {
    currentAbort.abort();
    currentAbort = null;
  }
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource = null;
  }
  // Reset pause state so next speak() starts fresh
  edgeIsPaused = false;
  pausedBuffer = null;
  pauseOffset = 0;
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
