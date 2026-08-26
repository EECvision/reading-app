"use client";

import { CollectionRow } from "@/components/decks/CollectionRow";
import { DeckCard } from "@/components/decks/DeckCard";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/ui/Navbar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Select } from "@/components/ui/Select";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { PlusIcon } from "@/components/icons/PlusIcon";
import {
  deleteDeck,
  getDecks,
  getCollections,
  saveCollection,
  deleteCollection,
  addDeckToCollection,
  removeDeckFromCollection,
} from "@/lib/localStorage";
import { nanoid } from "@/lib/nanoid";
import type { Collection, Deck } from "@/types";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function DecksPage() {
  const [localDecks, setLocalDecks] = useState<Deck[]>([]);
  const [fileDecks, setFileDecks] = useState<Deck[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [fileCollections, setFileCollections] = useState<{ collection: Collection; decks: Deck[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<string>("all");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const newCollectionInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    Promise.resolve().then(() => {
      setLocalDecks(getDecks());
      setCollections(getCollections());
    });
  }, []);

  // Load file-based decks and collections from API
  useEffect(() => {
    Promise.all([
      fetch("/api/decks").then((r) => r.json()).catch(() => []),
      fetch("/api/collections").then((r) => r.json()).catch(() => []),
    ]).then(([decksData, collectionsData]) => {
      setFileDecks(Array.isArray(decksData) ? decksData : []);
      setFileCollections(Array.isArray(collectionsData) ? collectionsData : []);
    }).finally(() => setLoading(false));
  }, []);

  const allDecks = [
    ...localDecks,
    ...fileDecks,
    // Include all decks from file collections so they can be found by ID
    ...fileCollections.flatMap((fc) => fc.decks),
  ];

  // IDs of all decks already in a collection (user or file)
  const deckIdsInCollections = new Set([
    ...collections.flatMap((c) => c.deckIds),
    ...fileCollections.flatMap((fc) => fc.collection.deckIds),
  ]);

  const allFolderCount = collections.length + fileCollections.length;

  const handleCreateCollection = () => {
    const name = newCollectionName.trim();
    if (!name) return;
    const col: Collection = {
      id: nanoid(),
      name,
      deckIds: [],
      createdAt: new Date().toISOString(),
    };
    saveCollection(col);
    setCollections((prev) => [col, ...prev]);
    setNewCollectionName("");
    setCreatingCollection(false);
  };

  const handleDeleteCollection = (id: string) => {
    if (!confirm("Delete this folder? The decks inside will not be deleted.")) return;
    deleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRenameCollection = (id: string, name: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, name };
        saveCollection(updated);
        return updated;
      })
    );
  };

  const handleMoveDeckToCollection = (deckId: string, collectionId: string) => {
    addDeckToCollection(collectionId, deckId);
    setCollections(getCollections());
  };

  const handleRemoveDeckFromCollection = (deckId: string) => {
    removeDeckFromCollection(deckId);
    setCollections(getCollections());
  };

  const handleDeleteDeck = (id: string) => {
    if (!confirm("Delete this deck? This cannot be undone.")) return;
    removeDeckFromCollection(id); // clean up collection membership
    deleteDeck(id);
    setCollections(getCollections());
    setLocalDecks((prev) => prev.filter((d) => d.id !== id));
  };

  // Standalone = not in any collection (user OR file)
  const allStandaloneDecks = allDecks.filter((d) => !deckIdsInCollections.has(d.id));
  const standaloneDecks = allStandaloneDecks.filter(
    (d) => filterMode === "all" || d.mode === filterMode
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
          {/* Page header */}
          <div className={`flex items-center justify-between ${styles.pageHeader}`}>
            <div>
              <h1 className={styles.pageTitle}>My Library</h1>
              <p className={styles.pageSubtitle}>
                {allDecks.length} deck{allDecks.length !== 1 ? "s" : ""} · {allFolderCount} folder{allFolderCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                id="btn-new-collection"
                className={styles.newFolderBtn}
                onClick={() => {
                  setCreatingCollection(true);
                  setTimeout(() => newCollectionInputRef.current?.focus(), 50);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
                </svg>
                New Folder
              </button>
            </div>
          </div>

          {/* Inline new-collection input */}
          {creatingCollection && (
            <div className={styles.newCollectionRow}>
              <span className={styles.newCollectionIcon}>📁</span>
              <input
                ref={newCollectionInputRef}
                className={styles.newCollectionInput}
                placeholder="Folder name…"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCollection();
                  if (e.key === "Escape") { setCreatingCollection(false); setNewCollectionName(""); }
                }}
              />
              <div className={styles.newCollectionActions}>
                <button className={styles.newCollectionConfirm} onClick={handleCreateCollection}>Create</button>
                <button className={styles.newCollectionCancel} onClick={() => { setCreatingCollection(false); setNewCollectionName(""); }}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className={styles.decksGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={`skeleton ${styles.skeletonItem}`} />
              ))}
            </div>
          ) : (
            <div className={styles.libraryLayout}>

              {/* File-based collections (readonly) */}
              {fileCollections.length > 0 && (
                <div className={styles.collectionsSection}>
                  {fileCollections.map(({ collection, decks: fcDecks }) => (
                    <CollectionRow
                      key={collection.id}
                      collection={collection}
                      decks={fcDecks}
                      readonly
                      onDeleteCollection={() => {}}
                      onRenameCollection={() => {}}
                      onRemoveDeck={() => {}}
                      onDeleteDeck={() => {}}
                      onMoveDeck={() => {}}
                      allCollections={[]}
                    />
                  ))}
                </div>
              )}

              {/* User-created collections */}
              {collections.length > 0 && (
                <div className={styles.collectionsSection}>
                  {collections.map((col) => (
                    <CollectionRow
                      key={col.id}
                      collection={col}
                      decks={allDecks}
                      onDeleteCollection={handleDeleteCollection}
                      onRenameCollection={handleRenameCollection}
                      onRemoveDeck={handleRemoveDeckFromCollection}
                      onDeleteDeck={handleDeleteDeck}
                      onMoveDeck={handleMoveDeckToCollection}
                      allCollections={collections}
                    />
                  ))}
                </div>
              )}

              {/* Standalone decks */}
              {allStandaloneDecks.length > 0 && (
                <>
                  <div className={styles.standaloneHeader}>
                    {collections.length > 0 ? (
                      <>
                        <span className={styles.sectionLabel}>Standalone Decks</span>
                        <div className={styles.standaloneDivider} />
                      </>
                    ) : (
                      <div style={{ flex: 1 }} />
                    )}
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
                  <div className={styles.decksGrid}>
                    {standaloneDecks.map((deck, index) => {
                      const delayClass = `delay-${(index % 4) + 1}`;
                      return (
                        <DeckCard
                          key={deck.id}
                          id={deck.id}
                          name={deck.name}
                          mode={deck.mode}
                          itemCount={deck.itemCount}
                          uploadedAt={deck.uploadedAt}
                          role={deck.role}
                          level={deck.level}
                          onDelete={handleDeleteDeck}
                          allCollections={collections}
                          onMoveToCollection={(cid) => handleMoveDeckToCollection(deck.id, cid)}
                          className={`animate-blurFadeIn ${delayClass}`}
                          style={{ height: "100%" }}
                        />
                      );
                    })}
                  </div>
                </>
              )}

              {/* Empty state */}
              {allDecks.length === 0 && collections.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📭</div>
                  <div>
                    <h2 className={styles.emptyTitle}>No decks yet</h2>
                    <p className={styles.emptyDesc}>Upload your first JSON deck to get started.</p>
                    <Button id="btn-upload-first" href="/upload" variant="primary" size="lg" rightIcon={<ArrowRight />}>
                      Upload Your First Deck
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

