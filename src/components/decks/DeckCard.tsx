'use client';

import Link from 'next/link';
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

export function DeckCard({ id, name, mode, itemCount, uploadedAt, role, level, onDelete }: DeckCardProps) {
  const color = MODE_COLORS[mode] ?? 'var(--brand-400)';
  const icon = MODE_ICONS[mode] ?? '📚';

  const uploadDate = new Date(uploadedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className={`card ${styles.card}`} style={{ '--deck-color': color } as React.CSSProperties}>
      
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
        <Link
          href={`/session/${id}`}
          id={`study-${id}`}
          className={`btn btn-primary ${styles.studyBtn}`}
        >
          Study
        </Link>
        {!id.startsWith('file:') && (
          <button
            id={`delete-${id}`}
            className={`btn btn-ghost btn-icon ${styles.deleteBtn}`}
            onClick={() => onDelete(id)}
            aria-label="Delete deck"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
