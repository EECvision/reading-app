import type { Deck, DeckProgress, AppSettings, SessionState, Theme, TTSSettings } from '@/types';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  decks: 'rdapp_decks',
  progress: (id: string) => `rdapp_progress_${id}`,
  settings: 'rdapp_settings',
  session: 'rdapp_active_session',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('[rdapp] localStorage write failed for key:', key);
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

// ─── Decks ────────────────────────────────────────────────────────────────────

export function getDecks(): Deck[] {
  return read<Deck[]>(KEYS.decks, []);
}

export function getDeck(id: string): Deck | null {
  return getDecks().find((d) => d.id === id) ?? null;
}

export function saveDeck(deck: Deck): void {
  const decks = getDecks().filter((d) => d.id !== deck.id);
  write(KEYS.decks, [deck, ...decks]);
}

export function deleteDeck(id: string): void {
  write(KEYS.decks, getDecks().filter((d) => d.id !== id));
  remove(KEYS.progress(id));
}

// ─── Progress ─────────────────────────────────────────────────────────────────

const defaultProgress = (deckId: string): DeckProgress => ({
  deckId,
  itemProgress: {},
  totalSeen: 0,
  totalKnown: 0,
  totalReview: 0,
  sessions: [],
});

export function getProgress(deckId: string): DeckProgress {
  return read<DeckProgress>(KEYS.progress(deckId), defaultProgress(deckId));
}

export function saveProgress(progress: DeckProgress): void {
  write(KEYS.progress(progress.deckId), progress);
}

export function resetProgress(deckId: string): void {
  write(KEYS.progress(deckId), defaultProgress(deckId));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const defaultSettings: AppSettings = {
  theme: 'dark',
  tts: {
    rate: 1,
    pitch: 1,
    voiceURI: '',
    audioMode: 'single-pause',
  },
  autoplay: false,
  shuffle: false,
};

export function getSettings(): AppSettings {
  const settings = read<AppSettings>(KEYS.settings, defaultSettings);
  if (!settings.tts.audioMode) {
    settings.tts.audioMode = 'single-pause';
  }
  return settings;
}

export function saveSettings(settings: AppSettings): void {
  write(KEYS.settings, settings);
}

export function saveTheme(theme: Theme): void {
  const s = getSettings();
  saveSettings({ ...s, theme });
}

export function saveTTSSettings(tts: TTSSettings): void {
  const s = getSettings();
  saveSettings({ ...s, tts });
}

export function saveAutoplaySettings(autoplay: boolean): void {
  const s = getSettings();
  saveSettings({ ...s, autoplay });
}

export function saveShuffleSettings(shuffle: boolean): void {
  const s = getSettings();
  saveSettings({ ...s, shuffle });
}

// ─── Active Session ───────────────────────────────────────────────────────────

export function getActiveSession(): SessionState | null {
  return read<SessionState | null>(KEYS.session, null);
}

export function saveActiveSession(session: SessionState): void {
  write(KEYS.session, session);
}

export function clearActiveSession(): void {
  remove(KEYS.session);
}
