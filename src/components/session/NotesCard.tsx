'use client';

import type { NotesItem } from '@/types';

interface NotesCardProps {
  item: NotesItem;
  onKnown: () => void;
  onReview: () => void;
}

export function NotesCard({ item, onKnown, onReview }: NotesCardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%', maxWidth: 680 }}>
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
          marginBottom: 'var(--space-6)',
        }}>
          {item.topic}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {item.subtopics.map((sub, i) => (
            <div
              key={i}
              style={{
                paddingLeft: 'var(--space-5)',
                borderLeft: '3px solid var(--brand-400)',
              }}
            >
              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)',
              }}>
                {sub.heading}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                {sub.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
        <button id="btn-review" className="btn btn-danger" onClick={onReview}>Needs Review</button>
        <button id="btn-known" className="btn btn-success" onClick={onKnown}>Got It ✓</button>
      </div>
    </div>
  );
}
