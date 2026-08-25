// ─── Reading Modes ──────────────────────────────────────────────────────────

export type ReadingMode =
  | 'flashcard'
  | 'qa'
  | 'article'
  | 'notes'
  | 'mcq'
  | 'interview';

export type SessionStyle =
  | 'card-flip'
  | 'read-and-listen';

export type AudioPlaybackMode = 
  | 'continuous'
  | 'single-pause'
  | 'switch';

// ─── JSON Item Shapes ────────────────────────────────────────────────────────

export interface FlashcardItem {
  id?: string;
  word: string;
  definition: string;
  example?: string;
  category?: string;
  tags?: string[];
}

export interface QAItem {
  id?: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
  tags?: string[];
}

export interface ArticleItem {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
}

export interface NoteSubtopic {
  heading: string;
  body: string;
}

export interface NotesItem {
  id?: string;
  topic: string;
  subtopics: NoteSubtopic[];
  category?: string;
  tags?: string[];
}

export interface MCQItem {
  id?: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category?: string;
  tags?: string[];
}

export interface InterviewFollowUp {
  question: string;
  answer: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answer: string;
  code_snippet?: string;
  follow_ups?: InterviewFollowUp[];
}

export interface InterviewDeck {
  role: string;
  level: string;
  questions: InterviewQuestion[];
}

export type AnyItem =
  | FlashcardItem
  | QAItem
  | ArticleItem
  | NotesItem
  | MCQItem
  | InterviewQuestion;

// ─── Deck (uploaded & saved) ─────────────────────────────────────────────────

export interface Deck {
  id: string;
  name: string;
  mode: ReadingMode;
  uploadedAt: string; // ISO string
  itemCount: number;
  // For interview mode, extra metadata
  role?: string;
  level?: string;
  // Raw parsed JSON
  items: AnyItem[] | InterviewDeck;
}

// ─── Progress Tracking ───────────────────────────────────────────────────────

export type ItemRating = 'known' | 'review' | 'unseen';

export interface ItemProgress {
  rating: ItemRating;
  seenCount: number;
  lastSeen?: string; // ISO string
}

export interface DeckProgress {
  deckId: string;
  itemProgress: Record<string, ItemProgress>; // keyed by item id
  totalSeen: number;
  totalKnown: number;
  totalReview: number;
  lastSessionAt?: string; // ISO string
  sessions: SessionSummary[];
}

export interface SessionSummary {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  itemsStudied: number;
  itemsKnown: number;
  itemsToReview: number;
  sessionStyle: SessionStyle;
}

// ─── TTS Settings ────────────────────────────────────────────────────────────

export type TTSEngine = 'webspeech' | 'kokoro';

export interface TTSSettings {
  rate: number;      // 0.5 – 2.0
  pitch: number;     // 0.5 – 2.0
  voiceURI: string;  // SpeechSynthesisVoice.voiceURI
  secondaryVoiceURI?: string; // For switch mode
  audioMode: AudioPlaybackMode;
  muted?: boolean;
  ttsEngine?: TTSEngine;
  kokoroVoice?: string;  // e.g. 'af_heart', 'am_michael'
}

// ─── App Settings ────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';

export interface AppSettings {
  theme: Theme;
  tts: TTSSettings;
  autoplay: boolean;
  shuffle: boolean;
  repeat: boolean;
}

// ─── Session State ───────────────────────────────────────────────────────────

export interface SessionState {
  deckId: string;
  mode: ReadingMode;
  style: SessionStyle;
  items: AnyItem[];
  currentIndex: number;
  shuffled: boolean;
  autoplay: boolean;
  startedAt: string;
  ratings: Record<string, ItemRating>;
}
