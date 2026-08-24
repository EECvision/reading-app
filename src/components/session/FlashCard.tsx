'use client';

import { useState } from 'react';
import type { FlashcardItem, SessionStyle } from '@/types';

interface FlashCardProps {
  item: FlashcardItem;
  sessionStyle: SessionStyle;
  onKnown: () => void;
  onReview: () => void;
}

export function FlashCard({ item, sessionStyle, onKnown, onReview }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  const isFlipMode = sessionStyle === 'card-flip' || sessionStyle === 'study-session';
  const showBoth = sessionStyle === 'read-and-listen' || sessionStyle === 'tts-listen';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', alignItems: 'center' }}>

      {/* Card */}
      <div className="flip-scene" style={{ width: '100%', maxWidth: 560, height: 280 }}>
        <div
          className={`flip-card ${flipped ? 'flipped' : ''}`}
          style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-2xl)' }}
          onClick={() => isFlipMode && setFlipped((f) => !f)}
        >
          {/* Front */}
          <div
            className="flip-front card-glass"
            style={{
              background: 'linear-gradient(135deg, hsl(252 74% 55% / 0.15), hsl(252 74% 55% / 0.05))',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
            }}
          >
            {item.category && (
              <span className="badge badge-brand" style={{ marginBottom: 'var(--space-3)' }}>
                {item.category}
              </span>
            )}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              {item.word}
            </h2>
            {isFlipMode && (
              <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Tap to reveal definition
              </p>
            )}
          </div>

          {/* Back */}
          <div
            className="flip-back card-glass"
            style={{
              background: 'linear-gradient(135deg, hsl(38 100% 60% / 0.12), hsl(38 100% 60% / 0.04))',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              gap: 'var(--space-3)',
            }}
          >
            <p style={{
              fontSize: 'var(--text-xl)',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              textAlign: 'center',
            }}>
              {item.definition}
            </p>
            {item.example && (
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                &ldquo;{item.example}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Show-both mode (no flip) */}
      {showBoth && (
        <div className="card" style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
            {item.word}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: item.example ? 'var(--space-3)' : 0 }}>
            {item.definition}
          </p>
          {item.example && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>
              &ldquo;{item.example}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Rating buttons — shown after flip or in show-both mode */}
      {(flipped || showBoth) && (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }} className="animate-slideUp">
          <button id="btn-review" className="btn btn-danger" onClick={() => { setFlipped(false); onReview(); }}>
            Needs Review
          </button>
          <button id="btn-known" className="btn btn-success" onClick={() => { setFlipped(false); onKnown(); }}>
            Got It ✓
          </button>
        </div>
      )}
    </div>
  );
}
