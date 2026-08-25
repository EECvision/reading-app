import type { TTSSettings } from '@/types';
import { kokoroSpeak, kokoroStop } from '@/lib/kokoroTts';

// ─── TTS State ────────────────────────────────────────────────────────────────

let isPausedState = false;

// ─── Voice List ───────────────────────────────────────────────────────────────

export function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined') return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
}

export function onVoicesChanged(cb: (voices: SpeechSynthesisVoice[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => cb(getVoices());
  window.speechSynthesis.addEventListener('voiceschanged', handler);
  // Populate immediately if already loaded
  cb(getVoices());
  return () => window.speechSynthesis.removeEventListener('voiceschanged', handler);
}

// ─── Core Speak ───────────────────────────────────────────────────────────────

export interface SpeakOptions {
  text: string;
  settings: TTSSettings;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: SpeechSynthesisErrorEvent) => void;
}

export function speak(opts: SpeakOptions): void {
  if (typeof window === 'undefined') return;

  // Route to Kokoro engine when selected
  if (opts.settings.ttsEngine === 'kokoro') {
    kokoroStop();
    kokoroSpeak({
      text: opts.text,
      voice: opts.settings.kokoroVoice ?? 'af_heart',
      rate: opts.settings.rate,
      muted: opts.settings.muted,
      onStart: opts.onStart,
      onEnd: opts.onEnd,
      onError: () => {
        // Silently fall through; onEnd still needed to advance the deck
        opts.onEnd?.();
      },
    });
    return;
  }

  // ── Web Speech API ──
  stop();

  const utterance = new SpeechSynthesisUtterance(opts.text);
  utterance.rate = opts.settings.rate;
  utterance.pitch = opts.settings.pitch;
  utterance.volume = opts.settings.muted ? 0 : 1;
  utterance.lang = 'en-US';

  if (opts.settings.voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.voiceURI === opts.settings.voiceURI);
    if (voice) utterance.voice = voice;
  }

  if (opts.onStart) utterance.addEventListener('start', opts.onStart);
  if (opts.onEnd) utterance.addEventListener('end', opts.onEnd);
  if (opts.onError) utterance.addEventListener('error', opts.onError);

  isPausedState = false;
  window.speechSynthesis.speak(utterance);
}

export function pause(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.pause();
  isPausedState = true;
}

export function resume(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.resume();
  isPausedState = false;
}

export function stop(): void {
  if (typeof window === 'undefined') return;
  kokoroStop();
  window.speechSynthesis.cancel();
  isPausedState = false;
}

export function togglePause(): void {
  if (isPausedState) {
    resume();
  } else {
    pause();
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined') return false;
  return window.speechSynthesis.speaking;
}

export function isPaused(): boolean {
  return isPausedState;
}

// ─── Build text to speak for each reading mode ────────────────────────────────

export function buildSpeechText(
  mode: string,
  item: Record<string, unknown>,
  phase: 'front' | 'back' | 'full' = 'full'
): string {
  switch (mode) {
    case 'flashcard':
      if (phase === 'front') return String(item.word ?? '');
      if (phase === 'back') {
        const parts = [String(item.definition)];
        if (item.example) parts.push(`Example: ${item.example}`);
        return parts.join('. ');
      }
      return [item.word, item.definition, item.example ? `Example: ${item.example}` : ''].filter(Boolean).join('. ');

    case 'qa':
      if (phase === 'front') return String(item.question ?? '');
      if (phase === 'back') return String(item.answer ?? '');
      return `Question: ${item.question}. Answer: ${item.answer}`;

    case 'article':
      if (phase === 'front') return String(item.title ?? '');
      return `${item.title}. ${item.content}${item.summary ? `. Summary: ${item.summary}` : ''}`;

    case 'notes': {
      const subtopics = (item.subtopics as Array<{ heading: string; body: string }> | undefined) ?? [];
      const subtopicText = subtopics.map((s) => `${s.heading}: ${s.body}`).join('. ');
      return `Topic: ${item.topic}. ${subtopicText}`;
    }

    case 'mcq':
      if (phase === 'front') {
        const opts = (item.options as string[] | undefined) ?? [];
        return `${item.question}. Options: ${opts.join(', ')}.`;
      }
      if (phase === 'back') return `The answer is: ${item.correct_answer}. ${item.explanation ?? ''}`;
      return `Question: ${item.question}. Answer: ${item.correct_answer}.`;

    case 'interview':
      if (phase === 'front') return String(item.question ?? '');
      if (phase === 'back') return String(item.answer ?? '');
      return `Question: ${item.question}. Answer: ${item.answer}`;

    default:
      return JSON.stringify(item);
  }
}
