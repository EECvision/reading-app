'use client';

import type { NotesItem, SessionStyle } from '@/types';
import styles from './NotesCard.module.css';

interface NotesCardProps {
  item: NotesItem;
  sessionStyle: SessionStyle;
  isFlipped: boolean;
  onFlip: () => void;
}

export function NotesCard({ item, sessionStyle, isFlipped, onFlip }: NotesCardProps) {
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
        <h2 className={styles.topicTitle}>
          {item.topic}
        </h2>

        <div className={styles.subtopicsContainer}>
          {item.subtopics.map((sub, i) => (
            <div
              key={i}
              className={styles.subtopicItem}
            >
              <h4 className={styles.subtopicHeading}>
                {sub.heading}
              </h4>
              <p className={styles.subtopicBody}>
                {sub.body}
              </p>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
