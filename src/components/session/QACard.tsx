'use client';

import { useState } from 'react';
import type { QAItem, SessionStyle } from '@/types';
import styles from './QACard.module.css';

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
    <div className={styles.container}>
      {/* Question card */}
      <div className={`card-glass ${styles.questionCard}`}>
        {item.category && (
          <span className={`badge badge-brand ${styles.category}`}>
            {item.category}
          </span>
        )}
        <p className={styles.question}>
          {item.question}
        </p>

        {/* Hint */}
        {item.hint && !revealed && (
          <div className={styles.hintContainer}>
            {hintVisible ? (
              <p className={styles.hintText}>
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
        <div className={`card animate-slideUp ${styles.answerCard}`}>
          <p className={styles.answerText}>
            {item.answer}
          </p>
        </div>
      ) : (
        <div className={styles.revealContainer}>
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
        <div className={`animate-slideUp ${styles.actionsContainer}`}>
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
