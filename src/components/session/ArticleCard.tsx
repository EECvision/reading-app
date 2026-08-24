'use client';

import type { ArticleItem } from '@/types';

interface ArticleCardProps {
  item: ArticleItem;
  onKnown: () => void;
  onReview: () => void;
}

export function ArticleCard({ item, onKnown, onReview }: ArticleCardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%', maxWidth: 700 }}>
      <div className="card-glass" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)' }}>
        {item.category && (
          <span className="badge badge-brand" style={{ marginBottom: 'var(--space-3)' }}>
            {item.category}
          </span>
        )}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-5)',
          lineHeight: 1.3,
        }}>
          {item.title}
        </h2>
        <div style={{
          height: '1px',
          background: 'var(--border)',
          marginBottom: 'var(--space-5)',
        }} />
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-base)',
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
        }}>
          {item.content}
        </p>

        {item.summary && (
          <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'hsl(252 74% 55% / 0.08)',
            border: '1px solid hsl(252 74% 55% / 0.2)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-400)', marginBottom: 'var(--space-2)' }}>
              Summary
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
              {item.summary}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
        <button id="btn-review" className="btn btn-danger" onClick={onReview}>Needs Review</button>
        <button id="btn-known" className="btn btn-success" onClick={onKnown}>Read ✓</button>
      </div>
    </div>
  );
}
