'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Collection, Deck } from '@/types';
import { DeckCard } from './DeckCard';
import styles from './CollectionRow.module.css';

interface CollectionRowProps {
  collection: Collection;
  decks: Deck[];
  onDeleteCollection: (id: string) => void;
  onRenameCollection: (id: string, name: string) => void;
  onRemoveDeck: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onMoveDeck: (deckId: string, toCollectionId: string) => void;
  allCollections: Collection[];
}

export function CollectionRow({
  collection,
  decks,
  onDeleteCollection,
  onRenameCollection,
  onRemoveDeck,
  onDeleteDeck,
  onMoveDeck,
  allCollections,
}: CollectionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(collection.name);

  const memberDecks = collection.deckIds
    .map((id) => decks.find((d) => d.id === id))
    .filter(Boolean) as Deck[];

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== collection.name) {
      onRenameCollection(collection.id, trimmed);
    }
    setRenaming(false);
    setMenuOpen(false);
  };

  return (
    <div className={`${styles.collectionBlock} ${menuOpen ? styles.collectionActive : ''}`}>
      {/* Folder Header */}
      <div className={styles.folderHeader}>
        <button
          className={styles.folderToggle}
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse collection' : 'Expand collection'}
        >
          <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
          <span className={styles.folderIcon}>📁</span>
          {renaming ? (
            <input
              className={styles.renameInput}
              value={renameValue}
              autoFocus
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') { setRenaming(false); setRenameValue(collection.name); }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={styles.folderName}>{collection.name}</span>
          )}
          <span className={styles.batchCount}>
            {memberDecks.length} batch{memberDecks.length !== 1 ? 'es' : ''}
          </span>
        </button>

        {/* Study All button */}
        {memberDecks.length > 0 && (
          <Link
            id={`study-all-${collection.id}`}
            href={`/session/collection:${collection.id}`}
            className={styles.studyAllBtn}
            title="Study all batches in this folder"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span className={styles.studyAllText}>Study All</span>
          </Link>
        )}

        <div className={styles.menuWrapper}>
          <button
            id={`menu-collection-${collection.id}`}
            className={styles.menuBtn}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            aria-label="Collection options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
              <div className={styles.menu}>
                <button className={styles.menuItem} onClick={() => { setRenaming(true); setMenuOpen(false); setExpanded(true); }}>
                  ✏️ Rename
                </button>
                <button
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  onClick={() => { setMenuOpen(false); onDeleteCollection(collection.id); }}
                >
                  🗑 Delete Folder
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expanded deck list */}
      {expanded && (
        <div className={styles.deckList}>
          {memberDecks.length === 0 ? (
            <p className={styles.emptyMsg}>No batches in this folder yet.</p>
          ) : (
            <div className={styles.deckGrid}>
              {memberDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  id={deck.id}
                  name={deck.name}
                  mode={deck.mode}
                  itemCount={deck.itemCount}
                  uploadedAt={deck.uploadedAt}
                  role={deck.role}
                  level={deck.level}
                  onDelete={onDeleteDeck}
                  onRemoveFromCollection={() => onRemoveDeck(deck.id)}
                  allCollections={allCollections.filter((c) => c.id !== collection.id)}
                  onMoveToCollection={(cid) => onMoveDeck(deck.id, cid)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
