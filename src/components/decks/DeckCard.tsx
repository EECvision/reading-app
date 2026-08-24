'use client';

import type { DeckProgress } from '@/types';
import Link from 'next/link';
import styles from './DeckCard.module.css';

interface DeckCardProps {
  id: string;
  name: string;
  mode: string;
  itemCount: number;
  uploadedAt: string;
  progress: DeckProgress | null;
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

export function DeckCard({ id, name, mode, itemCount, uploadedAt, progress, role, level, onDelete }: DeckCardProps) {
  const known = progress?.totalKnown ?? 0;
  const seen = progress?.totalSeen ?? 0;
  const pct = itemCount > 0 ? Math.round((known / itemCount) * 100) : 0;
  const color = MODE_COLORS[mode] ?? 'var(--brand-400)';
  const icon = MODE_ICONS[mode] ?? '📚';

  const uploadDate = new Date(uploadedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  // SVG ring progress
  const r = 24;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.headerRow}>
        {/* Mode icon */}
        <div className={styles.iconBox} style={{ background: `${color}18` }}>
          {icon}
        </div>

        <div className={styles.infoCol}>
          <div className={styles.title}>
            {name}
          </div>
          {mode === 'interview' && role && (
            <div className={styles.role}>
              {level} {role}
            </div>
          )}
          <div className={styles.metaRow}>
            <span className="badge badge-muted">{mode}</span>
            <span className={styles.metaText}>
              {itemCount} items · {uploadDate}
            </span>
          </div>
        </div>

        {/* Progress ring */}
        <div className={styles.progressRing}>
          <svg width={60} height={60}>
            <circle cx={30} cy={30} r={r} fill="none" stroke="var(--bg-overlay)" strokeWidth={4} />
            <circle
              cx={30} cy={30} r={r}
              fill="none"
              stroke={color}
              strokeWidth={4}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 30 30)"
              className={styles.progressCircle}
            />
          </svg>
          <div className={styles.progressText}>
            {pct}%
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCol}>
          <div className={styles.statValKnown}>{known}</div>
          <div className={styles.statLabel}>Known</div>
        </div>
        <div className={styles.statCol}>
          <div className={styles.statValReview}>{progress?.totalReview ?? 0}</div>
          <div className={styles.statLabel}>Review</div>
        </div>
        <div className={styles.statCol}>
          <div className={styles.statValUnseen}>{itemCount - seen}</div>
          <div className={styles.statLabel}>Unseen</div>
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
      </div>
    </div>
  );
}
