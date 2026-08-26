import type { Collection, Deck, DeckProgress, AppSettings, SessionState, SessionStyle, Theme, TTSSettings } from '@/types';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  decks: 'rdapp_decks',
  progress: (id: string) => `rdapp_progress_${id}`,
  settings: 'rdapp_settings',
  session: 'rdapp_active_session',
  collections: 'rdapp_collections',
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
    ttsEngine: 'edge',
    edgeVoice: 'en-US-AriaNeural',
  },
  autoplay: true,
  shuffle: false,
  repeat: true,
  sessionStyle: 'listen',
};

export function getSettings(): AppSettings {
  const settings = read<AppSettings>(KEYS.settings, defaultSettings);
  if (!settings.tts.audioMode) {
    settings.tts.audioMode = 'single-pause';
  }
  if (settings.repeat === undefined) {
    settings.repeat = true;
  }
  if (!settings.sessionStyle) {
    settings.sessionStyle = 'listen';
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

export function saveRepeatSettings(repeat: boolean): void {
  const s = getSettings();
  saveSettings({ ...s, repeat });
}

export function saveSessionStyleSettings(sessionStyle: SessionStyle): void {
  const s = getSettings();
  saveSettings({ ...s, sessionStyle });
}

// ─── Collections ─────────────────────────────────────────────────────────────

export function getCollections(): Collection[] {
  return read<Collection[]>(KEYS.collections, []);
}

export function getCollection(id: string): Collection | null {
  return getCollections().find((c) => c.id === id) ?? null;
}

export function saveCollection(collection: Collection): void {
  const rest = getCollections().filter((c) => c.id !== collection.id);
  write(KEYS.collections, [collection, ...rest]);
}

export function deleteCollection(id: string): void {
  write(KEYS.collections, getCollections().filter((c) => c.id !== id));
}

export function addDeckToCollection(collectionId: string, deckId: string): void {
  const collections = getCollections();
  // Remove from any existing collection first (a deck belongs to at most one)
  const cleaned = collections.map((c) => ({
    ...c,
    deckIds: c.deckIds.filter((id) => id !== deckId),
  }));
  const target = cleaned.find((c) => c.id === collectionId);
  if (!target) return;
  target.deckIds = [...target.deckIds, deckId];
  write(KEYS.collections, cleaned);
}

export function removeDeckFromCollection(deckId: string): void {
  const updated = getCollections().map((c) => ({
    ...c,
    deckIds: c.deckIds.filter((id) => id !== deckId),
  }));
  write(KEYS.collections, updated);
}

export function getCollectionForDeck(deckId: string): Collection | null {
  return getCollections().find((c) => c.deckIds.includes(deckId)) ?? null;
}

/** Returns the collection and all its member Deck objects in order. */
export function getCollectionWithDecks(collectionId: string): { collection: Collection; decks: Deck[] } | null {
  const collection = getCollection(collectionId);
  if (!collection) return null;
  const allDecks = getDecks();
  const decks = collection.deckIds
    .map((id) => allDecks.find((d) => d.id === id))
    .filter(Boolean) as Deck[];
  return { collection, decks };
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
