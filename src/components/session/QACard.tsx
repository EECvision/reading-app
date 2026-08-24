'use client';

import { useState } from 'react';
import type { QAItem, SessionStyle } from '@/types';

interface QACardProps {
  item: QAItem;
  sessionStyle: SessionStyle;
  onKnown: () => void;
  onReview: () => void;
}

export function QACard({ item, sessionStyle, onKnown, onReview }: QACardProps) {
  const [revealed, setRevealed] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const showBoth = sessionStyle === 'read-and-listen' || sessionStyle === 'tts-listen';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%', maxWidth: 600 }}>
      {/* Question card */}
      <div className="card-glass" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', textAlign: 'center' }}>
        {item.category && (
          <span className="badge badge-brand" style={{ marginBottom: 'var(--space-4)' }}>
            {item.category}
          </span>
        )}
        <p style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          fontFamily: 'var(--font-display)',
        }}>
          {item.question}
        </p>

        {/* Hint */}
        {item.hint && !revealed && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            {hintVisible ? (
              <p style={{ color: 'var(--accent-400)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>
                💡 {item.hint}
              </p>
            ) : (
              <button
                id="btn-show-hint"
                className="btn btn-ghost btn-sm"
                onClick={() => setHintVisible(true)}
              >
                Show Hint
              </button>
            )}
          </div>
        )}
      </div>

      {/* Answer */}
      {(revealed || showBoth) ? (
        <div
          className="card animate-slideUp"
          style={{
            background: 'linear-gradient(135deg, hsl(142 71% 45% / 0.08), transparent)',
            borderColor: 'hsl(142 71% 45% / 0.3)',
            textAlign: 'center',
            padding: 'var(--space-6)',
          }}
        >
          <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-lg)', lineHeight: 1.6 }}>
            {item.answer}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            id="btn-reveal-answer"
            className="btn btn-secondary"
            onClick={() => setRevealed(true)}
          >
            Reveal Answer
          </button>
        </div>
      )}

      {/* Rating */}
      {(revealed || showBoth) && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }} className="animate-slideUp">
          <button id="btn-review" className="btn btn-danger" onClick={() => { setRevealed(false); setHintVisible(false); onReview(); }}>
            Needs Review
          </button>
          <button id="btn-known" className="btn btn-success" onClick={() => { setRevealed(false); setHintVisible(false); onKnown(); }}>
            Got It ✓
          </button>
        </div>
      )}
    </div>
  );
}
