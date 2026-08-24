'use client';

import { useState } from 'react';
import type { MCQItem } from '@/types';

interface MCQCardProps {
  item: MCQItem;
  onKnown: () => void;
  onReview: () => void;
}

export function MCQCard({ item, onKnown, onReview }: MCQCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = selected !== null;
  const correct = selected === item.correct_answer;

  const handleSelect = (opt: string) => {
    if (!revealed) setSelected(opt);
  };

  const handleNext = () => {
    setSelected(null);
    if (correct) onKnown();
    else onReview();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%', maxWidth: 640 }}>
      {/* Question */}
      <div className="card-glass" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)' }}>
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
          marginBottom: 'var(--space-6)',
        }}>
          {item.question}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {item.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrect = opt === item.correct_answer;
            let bg = 'var(--bg-elevated)';
            let border = 'var(--border)';
            let color = 'var(--text-primary)';

            if (revealed) {
              if (isCorrect) { bg = 'hsl(142 71% 45% / 0.15)'; border = 'hsl(142 71% 45% / 0.5)'; color = 'var(--green-400)'; }
              else if (isSelected && !isCorrect) { bg = 'hsl(0 84% 55% / 0.1)'; border = 'hsl(0 84% 55% / 0.4)'; color = 'var(--red-400)'; }
            } else if (isSelected) {
              bg = 'hsl(252 74% 55% / 0.1)'; border = 'var(--brand-400)';
            }

            return (
              <button
                key={i}
                id={`option-${i}`}
                onClick={() => handleSelect(opt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  background: bg,
                  border: `2px solid ${border}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: revealed ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  color,
                  fontWeight: revealed && isCorrect ? 700 : 500,
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--bg-overlay)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  flexShrink: 0,
                  color,
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {revealed && isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                {revealed && isSelected && !isCorrect && <span style={{ marginLeft: 'auto' }}>✗</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && item.explanation && (
          <div className="animate-slideDown" style={{
            marginTop: 'var(--space-5)',
            padding: 'var(--space-4)',
            background: 'hsl(252 74% 55% / 0.07)',
            border: '1px solid hsl(252 74% 55% / 0.2)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--brand-400)', marginBottom: 'var(--space-1)' }}>
              EXPLANATION
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
              {item.explanation}
            </p>
          </div>
        )}
      </div>

      {revealed && (
        <div style={{ display: 'flex', justifyContent: 'center' }} className="animate-slideUp">
          <button id="btn-next-mcq" className="btn btn-primary" onClick={handleNext}>
            Next Question →
          </button>
        </div>
      )}
    </div>
  );
}
