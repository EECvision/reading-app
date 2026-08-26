"use client";

import { DeckCard } from "@/components/decks/DeckCard";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/ui/Navbar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Select } from "@/components/ui/Select";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { deleteDeck, getDecks } from "@/lib/localStorage";
import type { Deck } from "@/types";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function DecksPage() {
  const [localDecks, setLocalDecks] = useState<Deck[]>([]);
  const [fileDecks, setFileDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<string>("all");

  useEffect(() => {
    Promise.resolve().then(() => {
      setLocalDecks(getDecks());
    });
  }, []);

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
  };

  const filteredDecks = decks.filter(
    (d) => filterMode === "all" || d.mode === filterMode,
  );

  return (
    <div className={`page-bg ${styles.pageContainer}`}>
      <div className={styles.decksGlow} />

      <div className={styles.contentWrapper}>
        <Navbar
          right={
            <>
              <Button
                id="nav-upload"
                href="/upload"
                variant="primary"
                size="sm"
                leftIcon={<PlusIcon />}
              >
                Upload
              </Button>
              <ThemeToggle />
            </>
          }
        />

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
            <Select
              className={styles.filterSelect}
              value={filterMode}
              onChange={(val) => setFilterMode(val)}
              options={[
                { label: "All Types", value: "all" },
                { label: "Flashcards", value: "flashcard" },
                { label: "Q&A", value: "qa" },
                { label: "Multiple Choice", value: "mcq" },
                { label: "Interview", value: "interview" },
                { label: "Article", value: "article" },
                { label: "Notes", value: "notes" },
              ]}
            />
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
                  <Button id="btn-upload-first" href="/upload" variant="primary" size="lg" rightIcon={<ArrowRight />}>
                    Upload Your First Deck
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.decksGrid}>
              {filteredDecks.map((deck, index) => {
                const delayClass = `delay-${(index % 4) + 1}`;
                return (
                  <div
                    key={deck.id}
                    className={`animate-blurFadeIn ${delayClass}`}
                    style={{ height: "100%" }}
                  >
                    <DeckCard
                      id={deck.id}
                      name={deck.name}
                      mode={deck.mode}
                      itemCount={deck.itemCount}
                      uploadedAt={deck.uploadedAt}
                      role={deck.role}
                      level={deck.level}
                      onDelete={handleDelete}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
