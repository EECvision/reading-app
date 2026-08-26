'use client';

import type { ArticleItem, SessionStyle } from '@/types';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  item: ArticleItem;
  sessionStyle: SessionStyle;
  isFlipped: boolean;
  onFlip: () => void;
}

export function ArticleCard({ item, sessionStyle, isFlipped, onFlip }: ArticleCardProps) {
  return (
    <div 
      className={styles.container}
      onClick={() => {
        if (!isFlipped && (sessionStyle === 'read')) {
          onFlip();
        }
      }}
    >
      <div className={`card-glass ${styles.card}`}>
        {item.category && (
          <span className={`badge badge-brand ${styles.category}`}>
            {item.category}
          </span>
        )}
        <h2 className={styles.title}>
          {item.title}
        </h2>
        <div className={styles.divider} />
        <p className={styles.content}>
          {item.content}
        </p>

        {item.summary && (
          <div className={styles.summaryBox}>
            <p className={styles.summaryTitle}>
              Summary
            </p>
            <p className={styles.summaryText}>
              {item.summary}
            </p>
          </div>
        )}
      </div>


    </div>
  );
}
