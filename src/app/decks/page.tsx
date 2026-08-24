"use client";

import { DeckCard } from "@/components/decks/DeckCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { deleteDeck, getDecks, getProgress } from "@/lib/localStorage";
import type { Deck, DeckProgress } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function DecksPage() {
  const [localDecks, setLocalDecks] = useState<Deck[]>(() => getDecks());
  const [fileDecks, setFileDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<string>("all");
  const [progresses, setProgresses] = useState<Record<string, DeckProgress>>(
    () => {
      const d = getDecks();
      const p: Record<string, DeckProgress> = {};
      d.forEach((deck) => {
        p[deck.id] = getProgress(deck.id);
      });
      return p;
    },
  );

  useEffect(() => {
    fetch("/api/decks")
      .then((res) => res.json())
      .then((data) => {
        setFileDecks(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load file decks:", err))
      .finally(() => setLoading(false));
  }, []);

  const decks = [...localDecks, ...fileDecks];

  const handleDelete = (id: string) => {
    if (id.startsWith("file:")) return; // Cannot delete file decks from UI
    if (!confirm("Delete this deck? This cannot be undone.")) return;
    deleteDeck(id);
    setLocalDecks((prev) => prev.filter((d) => d.id !== id));
    setProgresses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const filteredDecks = decks.filter(
    (d) => filterMode === "all" || d.mode === filterMode,
  );

  return (
    <div className="page-bg min-h-screen">
      <nav className="nav">
        <div className="nav-inner">
          <Link id="nav-home" href="/" className={styles.navBrand}>
            <span className={styles.navLogo}>📚</span>
            <span className={styles.navTitle}>ReadWise</span>
          </Link>
          <div className={styles.navActions}>
            <Link
              id="nav-upload"
              href="/upload"
              className="btn btn-primary btn-sm"
            >
              + Upload
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container section">
        <div
          className={`flex items-center justify-between ${styles.pageHeader}`}
        >
          <div>
            <h1 className={styles.pageTitle}>My Decks</h1>
            <p className={styles.pageSubtitle}>
              {decks.length} deck{decks.length !== 1 ? "s" : ""} saved locally
            </p>
          </div>
          <select
            className={`input ${styles.filterSelect}`}
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="flashcard">Flashcards</option>
            <option value="qa">Q&A</option>
            <option value="mcq">Multiple Choice</option>
            <option value="interview">Interview</option>
            <option value="article">Article</option>
            <option value="notes">Notes</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.decksGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`skeleton ${styles.skeletonItem}`} />
            ))}
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div>
              <h2 className={styles.emptyTitle}>
                {filterMode !== "all" ? "No matching decks" : "No decks yet"}
              </h2>
              <p className={styles.emptyDesc}>
                {filterMode !== "all"
                  ? "Try selecting a different deck type."
                  : "Upload your first JSON deck to get started."}
              </p>
              {filterMode === "all" && (
                <Link
                  id="btn-upload-first"
                  href="/upload"
                  className="btn btn-primary btn-lg"
                >
                  Upload Your First Deck →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className={`animate-fadeIn ${styles.decksGrid}`}>
            {filteredDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                id={deck.id}
                name={deck.name}
                mode={deck.mode}
                itemCount={deck.itemCount}
                uploadedAt={deck.uploadedAt}
                progress={progresses[deck.id] ?? null}
                role={deck.role}
                level={deck.level}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
