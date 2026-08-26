'use client';


import type { FlashcardItem, SessionStyle } from '@/types';
import styles from './FlashCard.module.css';

interface FlashCardProps {
  item: FlashcardItem;
  sessionStyle: SessionStyle;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ item, sessionStyle, isFlipped, onFlip }: FlashCardProps) {

  const isFlipMode = sessionStyle === 'card-flip';
  const showBoth = sessionStyle === 'read-and-listen';

  return (
    <div className={styles.container}>

      {/* Card */}
      <div className={`flip-scene ${styles.flipSceneWrapper}`}>
        <div
          className={`flip-card ${isFlipped ? 'flipped' : ''} ${styles.flipCardInner}`}
          onClick={() => isFlipMode && onFlip()}
        >
          {/* Front */}
          <div className={`flip-front card-glass ${styles.frontSide}`}>
            {item.category && (
              <span className={`badge badge-brand ${styles.category}`}>
                {item.category}
              </span>
            )}
            <h2 className={styles.wordFront}>
              {item.word}
            </h2>
            {isFlipMode && (
              <p className={styles.tapHint}>
                Tap to reveal definition
              </p>
            )}
          </div>

          {/* Back */}
          <div className={`flip-back card-glass ${styles.backSide}`}>
            <p className={styles.definitionText}>
              {item.definition}
            </p>
            {item.example && (
              <p className={styles.exampleText}>
                &ldquo;{item.example}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Show-both mode (no flip) */}
      {showBoth && (
        <div className={`card ${styles.showBothContainer}`}>
          <h3 className={styles.showBothWord}>
            {item.word}
          </h3>
          <p className={`${styles.showBothDefinition} ${item.example ? styles.showBothDefinitionWithExample : ''}`}>
            {item.definition}
          </p>
          {item.example && (
            <p className={styles.showBothExample}>
              &ldquo;{item.example}&rdquo;
            </p>
          )}
        </div>
      )}


    </div>
  );
}
