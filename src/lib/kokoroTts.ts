// ─── Kokoro TTS Module ────────────────────────────────────────────────────────
// Runs the Kokoro-82M model 100% in the browser via ONNX/WASM.
// The model (~60 MB) is downloaded on first use and cached by the browser.

// ─── State ────────────────────────────────────────────────────────────────────

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

let loadStatus: LoadStatus = 'idle';
let loadError: string | null = null;

// We stop audio by disconnecting the source node from the AudioContext.
let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

// Subscribers that get notified when load status changes
const statusListeners = new Set<(s: LoadStatus) => void>();

function notifyStatus(s: LoadStatus) {
  loadStatus = s;
  statusListeners.forEach((cb) => cb(s));
}

// ─── Public: status helpers ───────────────────────────────────────────────────

export function getKokoroStatus(): LoadStatus {
  return loadStatus;
}

export function getKokoroError(): string | null {
  return loadError;
}

export function onKokoroStatusChange(cb: (s: LoadStatus) => void): () => void {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}

// ─── Load ─────────────────────────────────────────────────────────────────────

let loadPromise: Promise<void> | null = null;
let worker: Worker | null = null;
let currentGenerationId = 0;
const pendingResolvers = new Map<number, { resolve: (data?: unknown) => void, reject: (err: Error) => void }>();

function initWorker() {
  if (!worker) {
    worker = new Worker(new URL('./kokoro.worker', import.meta.url));
    worker.onmessage = (e) => {
      const { type, id, result, error } = e.data;
      if (type === 'LOAD_COMPLETE' || type === 'GENERATE_COMPLETE') {
        const p = pendingResolvers.get(id);
        if (p) { p.resolve(result); pendingResolvers.delete(id); }
      } else if (type === 'ERROR') {
        const p = pendingResolvers.get(id);
        if (p) { p.reject(new Error(error)); pendingResolvers.delete(id); }
      }
    };
  }
  return worker;
}

export async function loadKokoro(): Promise<void> {
  if (loadStatus === 'ready') return;
  if (loadPromise) return loadPromise;

  notifyStatus('loading');
  loadError = null;

  const w = initWorker();
  const id = ++currentGenerationId;

  loadPromise = new Promise<void>((resolve, reject) => {
    pendingResolvers.set(id, { resolve: resolve as (data?: unknown) => void, reject });
    w.postMessage({ type: 'LOAD', id });
  }).then(() => {
    notifyStatus('ready');
  }).catch((err: Error) => {
    loadError = err.message ?? 'Failed to load Kokoro model';
    notifyStatus('error');
    loadPromise = null;
    throw err;
  });

  return loadPromise;
}

// ─── Speak ────────────────────────────────────────────────────────────────────

export interface KokoroSpeakOptions {
  text: string;
  voice?: string;
  rate?: number;   // Not directly supported by Kokoro; we apply via AudioBuffer playbackRate
  muted?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (msg: string) => void;
}

export async function kokoroSpeak(opts: KokoroSpeakOptions): Promise<void> {
  kokoroStop();

  if (opts.muted) {
    opts.onStart?.();
    opts.onEnd?.();
    return;
  }

  try {
    await loadKokoro();
  } catch {
    opts.onError?.('Failed to load Kokoro model');
    return;
  }

  const thisGenerationId = ++currentGenerationId;
  let cancelled = false;
  _pendingGeneration = { 
    cancel: () => { 
      cancelled = true; 
      pendingResolvers.delete(thisGenerationId); 
    } 
  };

  opts.onStart?.();

  const w = initWorker();
  let rawAudio: { sampling_rate: number; audio: Float32Array };

  try {
    rawAudio = await new Promise((resolve, reject) => {
      pendingResolvers.set(thisGenerationId, { resolve: resolve as (data?: unknown) => void, reject });
      w.postMessage({ type: 'GENERATE', id: thisGenerationId, payload: { text: opts.text, voice: opts.voice ?? 'af_heart' } });
    });
  } catch (err: unknown) {
    if (cancelled) return;
    opts.onError?.((err as Error).message || 'Kokoro generation failed');
    return;
  }

  if (cancelled) return;

  // Play via Web Audio API
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const { sampling_rate, audio } = rawAudio;

  const buffer = audioCtx.createBuffer(1, audio.length, sampling_rate);
  // Type assertion since TS might complain about Float32Array mismatch
  buffer.copyToChannel(audio as Float32Array<ArrayBuffer>, 0);

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  // Apply speed via playbackRate (0.5–2.0 maps directly)
  source.playbackRate.value = opts.rate ?? 1;
  source.connect(audioCtx.destination);

  currentSource = source;

  source.onended = () => {
    if (currentSource === source) currentSource = null;
    if (!cancelled) opts.onEnd?.();
  };

  source.start();
}

let _pendingGeneration: { cancel: () => void } | null = null;

// ─── Stop ─────────────────────────────────────────────────────────────────────

export function kokoroStop(): void {
  // Cancel any in-flight generation
  if (_pendingGeneration) {
    _pendingGeneration.cancel();
    _pendingGeneration = null;
  }
  // Stop any playing audio
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource = null;
  }
}

// ─── Voice catalogue (best-quality voices only) ───────────────────────────────

export interface KokoroVoice {
  id: string;
  label: string;
  accent: 'American' | 'British';
  gender: 'Female' | 'Male';
}

export const KOKORO_VOICES: KokoroVoice[] = [
  { id: 'af_heart',   label: 'Heart (US Female)',   accent: 'American', gender: 'Female' },
  { id: 'af_bella',   label: 'Bella (US Female)',   accent: 'American', gender: 'Female' },
  { id: 'am_michael', label: 'Michael (US Male)',   accent: 'American', gender: 'Male'   },
  { id: 'am_puck',    label: 'Puck (US Male)',      accent: 'American', gender: 'Male'   },
  { id: 'bf_emma',    label: 'Emma (UK Female)',    accent: 'British',  gender: 'Female' },
  { id: 'bm_george',  label: 'George (UK Male)',    accent: 'British',  gender: 'Male'   },
];
