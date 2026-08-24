import type {
  InterviewDeck,
  ReadingMode,
} from '@/types';

// ─── Validation Result ───────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  itemCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ─── Mode Validators ─────────────────────────────────────────────────────────

function validateFlashcard(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isArray(data)) return { valid: false, errors: ['Root must be a JSON array.'], itemCount: 0 };
  if (data.length === 0) return { valid: false, errors: ['Array must not be empty.'], itemCount: 0 };

  data.forEach((item, i) => {
    if (!isObject(item)) { errors.push(`Item ${i}: must be an object.`); return; }
    if (!isString(item.word)) errors.push(`Item ${i}: "word" is required (non-empty string).`);
    if (!isString(item.definition)) errors.push(`Item ${i}: "definition" is required (non-empty string).`);
  });

  return { valid: errors.length === 0, errors, itemCount: data.length };
}

function validateQA(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isArray(data)) return { valid: false, errors: ['Root must be a JSON array.'], itemCount: 0 };
  if (data.length === 0) return { valid: false, errors: ['Array must not be empty.'], itemCount: 0 };

  data.forEach((item, i) => {
    if (!isObject(item)) { errors.push(`Item ${i}: must be an object.`); return; }
    if (!isString(item.question)) errors.push(`Item ${i}: "question" is required.`);
    if (!isString(item.answer)) errors.push(`Item ${i}: "answer" is required.`);
  });

  return { valid: errors.length === 0, errors, itemCount: data.length };
}

function validateArticle(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isArray(data)) return { valid: false, errors: ['Root must be a JSON array.'], itemCount: 0 };
  if (data.length === 0) return { valid: false, errors: ['Array must not be empty.'], itemCount: 0 };

  data.forEach((item, i) => {
    if (!isObject(item)) { errors.push(`Item ${i}: must be an object.`); return; }
    if (!isString(item.title)) errors.push(`Item ${i}: "title" is required.`);
    if (!isString(item.content)) errors.push(`Item ${i}: "content" is required.`);
  });

  return { valid: errors.length === 0, errors, itemCount: data.length };
}

function validateNotes(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isArray(data)) return { valid: false, errors: ['Root must be a JSON array.'], itemCount: 0 };
  if (data.length === 0) return { valid: false, errors: ['Array must not be empty.'], itemCount: 0 };

  data.forEach((item, i) => {
    if (!isObject(item)) { errors.push(`Item ${i}: must be an object.`); return; }
    if (!isString(item.topic)) errors.push(`Item ${i}: "topic" is required.`);
    if (!isArray(item.subtopics)) {
      errors.push(`Item ${i}: "subtopics" must be an array.`);
    } else {
      (item.subtopics as unknown[]).forEach((s, j) => {
        if (!isObject(s)) { errors.push(`Item ${i}.subtopics[${j}]: must be an object.`); return; }
        if (!isString(s.heading)) errors.push(`Item ${i}.subtopics[${j}]: "heading" is required.`);
        if (!isString(s.body)) errors.push(`Item ${i}.subtopics[${j}]: "body" is required.`);
      });
    }
  });

  return { valid: errors.length === 0, errors, itemCount: data.length };
}

function validateMCQ(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isArray(data)) return { valid: false, errors: ['Root must be a JSON array.'], itemCount: 0 };
  if (data.length === 0) return { valid: false, errors: ['Array must not be empty.'], itemCount: 0 };

  data.forEach((item, i) => {
    if (!isObject(item)) { errors.push(`Item ${i}: must be an object.`); return; }
    if (!isString(item.question)) errors.push(`Item ${i}: "question" is required.`);
    if (!isArray(item.options) || (item.options as unknown[]).length < 2) {
      errors.push(`Item ${i}: "options" must be an array with at least 2 choices.`);
    }
    if (!isString(item.correct_answer)) errors.push(`Item ${i}: "correct_answer" is required.`);
    if (
      isArray(item.options) &&
      isString(item.correct_answer) &&
      !(item.options as string[]).includes(item.correct_answer as string)
    ) {
      errors.push(`Item ${i}: "correct_answer" must be one of the "options".`);
    }
  });

  return { valid: errors.length === 0, errors, itemCount: data.length };
}

function validateInterview(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(data)) return { valid: false, errors: ['Root must be a JSON object.'], itemCount: 0 };
  if (!isString(data.role)) errors.push('"role" is required (e.g. "Frontend Developer").');
  if (!isString(data.level)) errors.push('"level" is required (e.g. "Mid-level").');
  if (!isArray(data.questions)) return { valid: false, errors: [...errors, '"questions" must be an array.'], itemCount: 0 };
  if ((data.questions as unknown[]).length === 0) errors.push('"questions" array must not be empty.');

  (data.questions as unknown[]).forEach((q, i) => {
    if (!isObject(q)) { errors.push(`questions[${i}]: must be an object.`); return; }
    if (!isString(q.id)) errors.push(`questions[${i}]: "id" is required.`);
    if (!isString(q.category)) errors.push(`questions[${i}]: "category" is required.`);
    if (!['easy', 'medium', 'hard'].includes(q.difficulty as string)) {
      errors.push(`questions[${i}]: "difficulty" must be "easy", "medium", or "hard".`);
    }
    if (!isString(q.question)) errors.push(`questions[${i}]: "question" is required.`);
    if (!isString(q.answer)) errors.push(`questions[${i}]: "answer" is required.`);

    if (q.follow_ups !== undefined) {
      if (!isArray(q.follow_ups)) {
        errors.push(`questions[${i}]: "follow_ups" must be an array.`);
      } else {
        (q.follow_ups as unknown[]).forEach((f, j) => {
          if (!isObject(f)) return;
          if (!isString(f.question)) errors.push(`questions[${i}].follow_ups[${j}]: "question" is required.`);
          if (!isString(f.answer)) errors.push(`questions[${i}].follow_ups[${j}]: "answer" is required.`);
        });
      }
    }
  });

  const count = isArray(data.questions) ? (data.questions as unknown[]).length : 0;
  return { valid: errors.length === 0, errors, itemCount: count };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function validateJSON(mode: ReadingMode, data: unknown): ValidationResult {
  switch (mode) {
    case 'flashcard': return validateFlashcard(data);
    case 'qa':        return validateQA(data);
    case 'article':   return validateArticle(data);
    case 'notes':     return validateNotes(data);
    case 'mcq':       return validateMCQ(data);
    case 'interview': return validateInterview(data);
  }
}

// ─── Normalise: ensure every item has a stable id ────────────────────────────

export function normaliseItems(mode: ReadingMode, data: unknown): unknown {
  if (mode === 'interview') {
    const deck = data as InterviewDeck;
    return {
      ...deck,
      questions: deck.questions.map((q, i) => ({
        ...q,
        id: q.id || `item-${i}`,
      })),
    };
  }

  return (data as unknown[]).map((item: unknown, i: number) => ({
    ...(item as object),
    id: (item as Record<string, unknown>).id || `item-${i}`,
  }));
}
