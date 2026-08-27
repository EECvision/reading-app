'use client';


import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/DropdownMenu';
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

  const uploadDate = new Date(uploadedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const isFileDeck = id.startsWith('file:');

  return (
    <div 
      className={`card-glass ${styles.card} ${className}`} 
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id={`menu-deck-${id}`}
                  className={styles.menuBtn}
                  aria-label="Deck options"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Remove from collection OR move to collection */}
                {onRemoveFromCollection ? (
                  <DropdownMenuItem onClick={onRemoveFromCollection}>
                    <span style={{ marginRight: '8px' }}>📤</span> Remove from folder
                  </DropdownMenuItem>
                ) : onMoveToCollection && allCollections.length > 0 ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span style={{ marginRight: '8px', lineHeight: 1, display: 'flex', alignItems: 'center' }}>📁</span> 
                      <span style={{ flex: 1, lineHeight: 1, display: 'flex', alignItems: 'center' }}>Move to folder</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent sideOffset={2} alignOffset={-4}>
                        {allCollections.map((c) => (
                          <DropdownMenuItem key={c.id} onClick={() => onMoveToCollection(c.id)}>
                            <span style={{ marginRight: '8px' }}>📁</span> {c.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ) : null}

                {(onRemoveFromCollection || (onMoveToCollection && allCollections.length > 0)) && (
                  <DropdownMenuSeparator />
                )}

                <DropdownMenuItem variant="danger" onClick={() => onDelete(id)}>
                  <span style={{ marginRight: '8px' }}>🗑</span> Delete deck
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
