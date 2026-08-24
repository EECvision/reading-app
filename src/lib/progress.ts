import type {
  AnyItem,
  ItemProgress,
  ItemRating,
  SessionSummary,
} from "@/types";
import { getProgress, saveProgress } from "./localStorage";
import { nanoid } from "./nanoid";

// ─── Rate an item ─────────────────────────────────────────────────────────────

export function rateItem(
  deckId: string,
  itemId: string,
  rating: ItemRating,
): void {
  const progress = getProgress(deckId);
  const existing = progress.itemProgress[itemId] ?? {
    rating: "unseen",
    seenCount: 0,
  };

  const wasKnown = existing.rating === "known";
  const wasReview = existing.rating === "review";
  const wasSeen = existing.rating !== "unseen";

  const updated: ItemProgress = {
    rating,
    seenCount: existing.seenCount + 1,
    lastSeen: new Date().toISOString(),
  };

  progress.itemProgress[itemId] = updated;

  // Recalculate totals
  if (!wasSeen)
    progress.totalSeen = Math.min(
      progress.totalSeen + 1,
      Object.keys(progress.itemProgress).length,
    );
  if (wasKnown && rating !== "known")
    progress.totalKnown = Math.max(0, progress.totalKnown - 1);
  if (wasReview && rating !== "review")
    progress.totalReview = Math.max(0, progress.totalReview - 1);
  if (rating === "known" && !wasKnown) progress.totalKnown++;
  if (rating === "review" && !wasReview) progress.totalReview++;

  saveProgress(progress);
}

// ─── Mark item seen without rating ───────────────────────────────────────────

export function markSeen(deckId: string, itemId: string): void {
  const progress = getProgress(deckId);
  const existing = progress.itemProgress[itemId];
  if (!existing || existing.rating === "unseen") {
    progress.itemProgress[itemId] = {
      rating: "unseen",
      seenCount: (existing?.seenCount ?? 0) + 1,
      lastSeen: new Date().toISOString(),
    };
    progress.totalSeen++;
    saveProgress(progress);
  }
}

// ─── Build ordered item list with spaced-repetition weighting ────────────────
// Items marked "review" appear twice in the shuffled list.

export function buildStudyList(
  items: AnyItem[],
  deckId: string,
  shuffle: boolean,
): AnyItem[] {
  const progress = getProgress(deckId);

  // Weight "review" items by doubling them
  // Helper: every normalised item has an `id` field added by normaliseItems()
  const getId = (item: AnyItem): string =>
    ("id" in item ? (item as { id: string }).id : undefined) ?? "";

  const weighted: AnyItem[] = [];
  items.forEach((item) => {
    weighted.push(item);
    const ip = progress.itemProgress[getId(item)];
    if (ip?.rating === "review") weighted.push(item);
  });

  if (!shuffle) return weighted;

  // Fisher-Yates shuffle
  const arr = [...weighted];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Save session summary ─────────────────────────────────────────────────────

export function saveSessionSummary(
  deckId: string,
  summary: Omit<SessionSummary, "sessionId">,
): void {
  const progress = getProgress(deckId);
  progress.sessions = [
    { sessionId: nanoid(), ...summary },
    ...progress.sessions.slice(0, 49), // keep last 50 sessions
  ];
  progress.lastSessionAt = new Date().toISOString();
  saveProgress(progress);
}

// ─── Compute live stats ───────────────────────────────────────────────────────

export function computeStats(
  deckId: string,
  totalItems: number,
): {
  seen: number;
  known: number;
  review: number;
  unseen: number;
  percentKnown: number;
} {
  const progress = getProgress(deckId);
  const seen = progress.totalSeen;
  const known = progress.totalKnown;
  const review = progress.totalReview;
  const unseen = totalItems - seen;
  const percentKnown =
    totalItems > 0 ? Math.round((known / totalItems) * 100) : 0;
  return { seen, known, review, unseen, percentKnown };
}
