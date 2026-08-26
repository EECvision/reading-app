'use client';

import { useRouter } from 'next/navigation';
import type { Collection, Deck } from '@/types';
import styles from './BatchSwitcherDrawer.module.css';

interface BatchSwitcherDrawerProps {
  collection: Collection;
  decks: Deck[];          // all decks (used to look up names/counts)
  currentDeckId: string;
  onClose: () => void;
}

const MODE_ICONS: Record<string, string> = {
  flashcard: '🃏', qa: '💬', article: '📄',
  notes: '📝', mcq: '✅', interview: '🎤',
};

export function BatchSwitcherDrawer({
  collection,
  decks,
  currentDeckId,
  onClose,
}: BatchSwitcherDrawerProps) {
  const router = useRouter();

  const memberDecks = collection.deckIds
    .map((id) => decks.find((d) => d.id === id))
    .filter(Boolean) as Deck[];

  const handleSwitch = (id: string) => {
    if (id === currentDeckId) { onClose(); return; }
    onClose();
    router.push(`/session/${encodeURIComponent(id)}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Drawer */}
      <div className={styles.drawer} role="dialog" aria-label="Switch batch">
        <div className={styles.header}>
          <span className={styles.folderIcon}>📁</span>
          <span className={styles.collectionName}>{collection.name}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <ul className={styles.list}>
          {memberDecks.map((deck, i) => {
            const isCurrent = deck.id === currentDeckId;
            return (
              <li key={deck.id}>
                <button
                  id={`batch-switch-${deck.id}`}
                  className={`${styles.batchItem} ${isCurrent ? styles.batchItemActive : ''}`}
                  onClick={() => handleSwitch(deck.id)}
                >
                  <span className={styles.batchNum}>#{i + 1}</span>
                  <span className={styles.batchIcon}>{MODE_ICONS[deck.mode] ?? '📚'}</span>
                  <span className={styles.batchName}>{deck.name}</span>
                  <span className={styles.batchMeta}>{deck.itemCount} items</span>
                  {isCurrent && <span className={styles.currentPill}>Current</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
