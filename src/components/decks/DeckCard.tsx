'use client';

import type { DeckProgress } from '@/types';
import Link from 'next/link';

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
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        {/* Mode icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-lg)',
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
        }}>
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
          {mode === 'interview' && role && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {level} {role}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)', flexWrap: 'wrap' }}>
            <span className="badge badge-muted">{mode}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {itemCount} items · {uploadDate}
            </span>
          </div>
        </div>

        {/* Progress ring */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
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
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)',
          }}>
            {pct}%
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--green-400)', fontSize: 'var(--text-lg)' }}>{known}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Known</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--accent-400)', fontSize: 'var(--text-lg)' }}>{progress?.totalReview ?? 0}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Review</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 'var(--text-lg)' }}>{itemCount - seen}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Unseen</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Link
          href={`/session/${id}`}
          id={`study-${id}`}
          className="btn btn-primary"
          style={{ flex: 1, textAlign: 'center' }}
        >
          Study
        </Link>
        <button
          id={`delete-${id}`}
          className="btn btn-ghost btn-icon"
          onClick={() => onDelete(id)}
          aria-label="Delete deck"
          style={{ color: 'var(--red-400)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
