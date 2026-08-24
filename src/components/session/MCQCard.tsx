'use client';

import { useState } from 'react';
import type { MCQItem } from '@/types';
import styles from './MCQCard.module.css';

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
    <div className={styles.container}>
      {/* Question */}
      <div className={`card-glass ${styles.card}`}>
        {item.category && (
          <span className={`badge badge-brand ${styles.category}`}>
            {item.category}
          </span>
        )}
        <p className={styles.question}>
          {item.question}
        </p>

        {/* Options */}
        <div className={styles.optionsContainer}>
          {item.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrect = opt === item.correct_answer;
            
            let btnClass = styles.optionButton;
            let letterColor = 'var(--text-primary)';
            
            if (revealed) {
              btnClass += ` ${styles.optionRevealed}`;
              if (isCorrect) {
                btnClass += ` ${styles.optionCorrect}`;
                letterColor = 'var(--green-400)';
              } else if (isSelected && !isCorrect) {
                btnClass += ` ${styles.optionIncorrect}`;
                letterColor = 'var(--red-400)';
              }
            } else if (isSelected) {
              btnClass += ` ${styles.optionSelected}`;
            }

            return (
              <button
                key={i}
                id={`option-${i}`}
                onClick={() => handleSelect(opt)}
                className={btnClass}
              >
                <span className={styles.optionLetter} style={{ color: letterColor }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {revealed && isCorrect && <span className={styles.icon}>✓</span>}
                {revealed && isSelected && !isCorrect && <span className={styles.icon}>✗</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && item.explanation && (
          <div className={`animate-slideDown ${styles.explanationBox}`}>
            <p className={styles.explanationTitle}>
              EXPLANATION
            </p>
            <p className={styles.explanationText}>
              {item.explanation}
            </p>
          </div>
        )}
      </div>

      {revealed && (
        <div className={`animate-slideUp ${styles.nextButtonContainer}`}>
          <button id="btn-next-mcq" className="btn btn-primary" onClick={handleNext}>
            Next Question →
          </button>
        </div>
      )}
    </div>
  );
}
