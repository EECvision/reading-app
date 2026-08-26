'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Collection } from '@/types';
import styles from './DeckCard.module.css';

interface DeckCardProps {
  id: string;
  name: string;
  mode: string;
  itemCount: number;
  uploadedAt: string;
  role?: string;
  level?: string;
  onDelete: (id: string) => void;
  // Collection-related (optional — standalone cards don't need these)
  onRemoveFromCollection?: () => void;
  onMoveToCollection?: (collectionId: string) => void;
  allCollections?: Collection[]; // available collections to move into
  className?: string;
  style?: React.CSSProperties;
}

const MODE_ICONS: Record<string, string> = {
  flashcard: '🃏',
  qa: '💬',
  article: '📄',
  notes: '📝',
  mcq: '✅',
  interview: '🎤',
};

const MODE_COLORS: Record<string, string> = {
  flashcard: 'hsl(252, 74%, 55%)',
  qa: 'hsl(196, 80%, 48%)',
  article: 'hsl(142, 60%, 42%)',
  notes: 'hsl(38, 90%, 50%)',
  mcq: 'hsl(315, 70%, 52%)',
  interview: 'hsl(16, 80%, 52%)',
};

export function DeckCard({
  id, name, mode, itemCount, uploadedAt, role, level, onDelete,
  onRemoveFromCollection, onMoveToCollection, allCollections = [],
  className = '', style = {},
}: DeckCardProps) {
  const color = MODE_COLORS[mode] ?? 'var(--brand-400)';
  const icon = MODE_ICONS[mode] ?? '📚';
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const uploadDate = new Date(uploadedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const isFileDeck = id.startsWith('file:');

  return (
    <div 
      className={`card-glass ${styles.card} ${menuOpen ? styles.cardActive : ''} ${className}`} 
      style={{ '--deck-color': color, ...style } as React.CSSProperties}
    >

      {/* Top Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox} style={{ background: `${color}18`, color }}>
            {icon}
          </div>
          <div className={styles.title} title={name}>
            {name}
          </div>
        </div>

        {/* ⋮ context menu (only for local decks) */}
        {!isFileDeck && (
          <div className={styles.menuWrapper}>
            <button
              id={`menu-deck-${id}`}
              className={styles.menuBtn}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); setMoveOpen(false); }}
              aria-label="Deck options"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className={styles.menuOverlay} onClick={() => { setMenuOpen(false); setMoveOpen(false); }} />
                <div className={styles.menu}>
                  {/* Remove from collection OR move to collection */}
                  {onRemoveFromCollection ? (
                    <button className={styles.menuItem} onClick={() => { setMenuOpen(false); onRemoveFromCollection(); }}>
                      📤 Remove from folder
                    </button>
                  ) : onMoveToCollection && allCollections.length > 0 ? (
                    <div className={styles.submenuWrapper}>
                      <button
                        className={styles.menuItem}
                        onClick={() => setMoveOpen((o) => !o)}
                      >
                        📁 Move to folder
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                      {moveOpen && (
                        <div className={styles.submenu}>
                          {allCollections.map((c) => (
                            <button
                              key={c.id}
                              className={styles.menuItem}
                              onClick={() => { setMenuOpen(false); setMoveOpen(false); onMoveToCollection(c.id); }}
                            >
                              📁 {c.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className={styles.menuDivider} />
                  <button
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    onClick={() => { setMenuOpen(false); onDelete(id); }}
                  >
                    🗑 Delete deck
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className={styles.mainInfo}>
        {mode === 'interview' && role && (
          <div className={styles.role}>
            {level} {role}
          </div>
        )}
        <div className={styles.metaRow}>
          <span className="badge" style={{ background: `${color}20`, color: color, letterSpacing: '0.05em' }}>{mode}</span>
          <span className={styles.metaText}>{itemCount} items</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaText}>{uploadDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actionsRow}>
        <Button
          href={`/session/${id}`}
          id={`study-${id}`}
          variant="primary"
          className={styles.studyBtn}
        >
          Study
        </Button>
      </div>
    </div>
  );
}
