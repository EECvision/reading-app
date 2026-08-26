"use client";

import { ArticleCard } from "@/components/session/ArticleCard";
import { FlashCard } from "@/components/session/FlashCard";
import { InterviewCard } from "@/components/session/InterviewCard";
import { MCQCard } from "@/components/session/MCQCard";
import { NotesCard } from "@/components/session/NotesCard";
import { QACard } from "@/components/session/QACard";
import { SessionControls } from "@/components/session/SessionControls";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  getDeck,
  getSettings,
  saveAutoplaySettings,
  saveRepeatSettings,
  saveShuffleSettings,
} from "@/lib/localStorage";
import { buildStudyList, saveSessionSummary } from "@/lib/progress";
import { buildSpeechText, stop } from "@/lib/tts";
import type {
  AnyItem,
  ArticleItem,
  Deck,
  FlashcardItem,
  InterviewDeck,
  InterviewQuestion,
  MCQItem,
  NotesItem,
  QAItem,
  SessionStyle,
} from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

// Helper: safely extract the id added by normaliseItems()
function getId(item: AnyItem): string {
  if ("id" in item) return (item as { id: string }).id ?? "";
  return "";
}

export default function SessionPage() {
  const params = useParams<{ deckId: string }>();
  const router = useRouter();
  const rawDeckId = params.deckId;
  const deckId =
    typeof rawDeckId === "string" ? decodeURIComponent(rawDeckId) : "";

  // ── Server-safe initial state ───────────────────────────────────────────────
  // All initializers must be static so server and client render identically.
  // Real values from localStorage are loaded after mount (see effect below).
  const [deck, setDeck] = useState<Deck | null>(null);

  const [index, setIndex] = useState(0);
  const [sessionStyle, setSessionStyle] =
    useState<SessionStyle>("read-and-listen");
  const [shuffle, setShuffle] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [startedAt] = useState(new Date().toISOString());
  const [isFlipped, setIsFlipped] = useState(false);

  // Load persisted settings from localStorage after mount
  useEffect(() => {
    Promise.resolve().then(() => {
      const s = getSettings();
      setShuffle(s.shuffle);
      setAutoplay(s.autoplay);
      setRepeat(s.repeat);

      // For localStorage-stored decks, load now (not in useState to avoid SSR mismatch)
      if (deckId && !deckId.startsWith("file:")) {
        const stored = getDeck(deckId);
        if (stored) setDeck(stored);
      }
    });
  }, [deckId]);

  const mode = deck?.mode ?? "flashcard";
  const deckName = deck?.name ?? "";
  const role =
    deck?.mode === "interview" ? (deck.items as InterviewDeck).role : "";
  const level =
    deck?.mode === "interview" ? (deck.items as InterviewDeck).level : "";

  const items = useMemo(() => {
    if (!deck) return [];
    let list: AnyItem[] = [];
    if (deck.mode === "interview") {
      list = (deck.items as InterviewDeck).questions as unknown as AnyItem[];
    } else {
      list = deck.items as AnyItem[];
    }
    return buildStudyList(list, deckId as string, shuffle);
  }, [deck, deckId, shuffle]);

  useEffect(() => {
    if (!deckId) return;

    if (!deckId.startsWith("file:")) {
      // deck will be null until the mount effect above loads it — give it one tick
      if (deck) return; // already loaded
      const timer = setTimeout(() => {
        if (!deck) router.push("/decks");
      }, 300);
      return () => clearTimeout(timer);
    }

    // Prevent infinite fetch loop
    if (deck?.id === deckId) return;

    fetch(`/api/decks/${encodeURIComponent(deckId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          router.push("/decks");
          return;
        }
        setDeck(data);
      })
      .catch(() => router.push("/decks"));
  }, [deck, deckId, router]);

  const currentItem = items[index];
  const currentId = currentItem ? getId(currentItem) : "";

  const handleNext = useCallback(() => {
    stop();
    setIsFlipped(false);
    if (index < items.length - 1) {
      setIndex((i) => i + 1);
    } else if (repeat) {
      setIndex(0);
    } else {
      const endedAt = new Date().toISOString();
      const durationSeconds = Math.round(
        (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000,
      );
      saveSessionSummary(deckId, {
        startedAt,
        endedAt,
        durationSeconds,
        itemsStudied: items.length,
        itemsKnown: 0,
        itemsToReview: 0,
        sessionStyle,
      });
      router.push(`/session/${deckId}/summary`);
    }
  }, [index, items.length, repeat, deckId, startedAt, sessionStyle, router]);

  const handlePrev = useCallback(() => {
    stop();
    setIsFlipped(false);
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  const handleRestart = useCallback(() => {
    stop();
    setIsFlipped(false);
    setIndex(0);
  }, []);

  if (!currentItem) {
    return (
      <div className={`page-bg min-h-screen ${styles.loadingContainer}`}>
        <div className={`animate-pulse ${styles.loadingText}`}>
          Loading deck…
        </div>
      </div>
    );
  }

  const frontText = buildSpeechText(
    mode,
    currentItem as unknown as Record<string, unknown>,
    "front",
  );
  const backText = buildSpeechText(
    mode,
    currentItem as unknown as Record<string, unknown>,
    "back",
  );

  const renderCard = () => {
    switch (mode) {
      case "flashcard":
        return (
          <FlashCard
            item={currentItem as FlashcardItem}
            sessionStyle={sessionStyle}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((f) => !f)}
          />
        );
      case "qa":
        return (
          <QACard
            item={currentItem as QAItem}
            sessionStyle={sessionStyle}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((f) => !f)}
          />
        );
      case "article":
        return (
          <ArticleCard
            item={currentItem as ArticleItem}
            sessionStyle={sessionStyle}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((f) => !f)}
          />
        );
      case "notes":
        return (
          <NotesCard
            item={currentItem as NotesItem}
            sessionStyle={sessionStyle}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((f) => !f)}
          />
        );
      case "mcq":
        return (
          <MCQCard
            item={currentItem as MCQItem}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((f) => !f)}
            onNext={handleNext}
          />
        );
      case "interview":
        return (
          <InterviewCard
            question={currentItem as unknown as InterviewQuestion}
            role={role}
            level={level}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((f) => !f)}
          />
        );
    }
  };

  return (
    <div className={`page-bg-accent ${styles.pageContainer}`}>
      <nav className="nav">
        <div className="nav-inner">
          <div className={styles.navBrand}>
            <Link id="nav-home" href="/" className={styles.navLogoLink}>
              <span className={styles.navLogo}>📚</span>
              <span className={styles.navTitle}>Audiobooklm</span>
            </Link>
            <span className={styles.navSeparator}>/</span>
            <span className={styles.navDeckName}>{deckName}</span>
          </div>
          <div className={styles.navActions}>
            <Link
              id="nav-end-session"
              href={`/session/${deckId}/summary`}
              className="btn btn-ghost btn-sm"
            >
              End Session
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container-sm section">
        {/* Progress */}
        <div className={`animate-slideDown ${styles.progressContainer}`}>
          <ProgressBar
            current={index + 1}
            total={items.length}
            onRestart={handleRestart}
          />
        </div>

        {/* Session Controls */}
        <div className={styles.controlsContainer}>
          <SessionControls
            frontText={frontText}
            backText={backText}
            isFlipped={isFlipped}
            onPrev={handlePrev}
            onNext={handleNext}
            canPrev={index > 0}
            canNext={index < items.length - 1 || (repeat && items.length > 0)}
            autoplay={autoplay}
            onAutoplayChange={(val) => {
              setAutoplay(val);
              saveAutoplaySettings(val);
            }}
            shuffle={shuffle}
            onShuffleChange={(val) => {
              setShuffle(val);
              saveShuffleSettings(val);
            }}
            repeat={repeat}
            onRepeatChange={(val) => {
              setRepeat(val);
              saveRepeatSettings(val);
            }}
            sessionStyle={sessionStyle}
            onStyleChange={(s) => {
              setSessionStyle(s);
              setIsFlipped(false); // reset state when switching modes
            }}
          />
        </div>

        {/* Card Area */}
        <div key={currentId} className={`animate-scaleIn ${styles.cardArea}`}>
          {renderCard()}
        </div>
      </div>
    </div>
  );
}
