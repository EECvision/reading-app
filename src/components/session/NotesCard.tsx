'use client';

import type { NotesItem } from '@/types';
import styles from './NotesCard.module.css';

interface NotesCardProps {
  item: NotesItem;
  onKnown: () => void;
  onReview: () => void;
}

export function NotesCard({ item, onKnown, onReview }: NotesCardProps) {
  return (
    <div className={styles.container}>
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

      <div className={styles.actions}>
        <button id="btn-review" className="btn btn-danger" onClick={onReview}>Needs Review</button>
        <button id="btn-known" className="btn btn-success" onClick={onKnown}>Got It ✓</button>
      </div>
    </div>
  );
}
