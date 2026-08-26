'use client';

import { useState } from 'react';
import type { QAItem, SessionStyle } from '@/types';
import styles from './QACard.module.css';

interface QACardProps {
  item: QAItem;
  sessionStyle: SessionStyle;
  isFlipped: boolean;
  onFlip: () => void;
}

export function QACard({ item, sessionStyle, isFlipped, onFlip }: QACardProps) {
  const [hintVisible, setHintVisible] = useState(false);

  const showBoth = sessionStyle === 'read-and-listen';

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
        {item.hint && !isFlipped && (
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
      {(isFlipped || showBoth) ? (
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
            onClick={() => onFlip()}
          >
            Reveal Answer
          </button>
        </div>
      )}


    </div>
  );
}
