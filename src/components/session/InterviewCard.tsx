'use client';

import { useState } from 'react';
import type { InterviewQuestion } from '@/types';
import styles from './InterviewCard.module.css';

interface InterviewCardProps {
  question: InterviewQuestion;
  role: string;
  level: string;
  isFlipped: boolean;
  onFlip: () => void;
  onKnown: () => void;
  onReview: () => void;
}

export function InterviewCard({ question, role, level, isFlipped, onFlip, onKnown, onReview }: InterviewCardProps) {
  const [phase, setPhase] = useState<'question' | 'answer' | 'followups'>('question');
  const [followupIndex, setFollowupIndex] = useState(0);

  const followups = question.follow_ups ?? [];
  const hasFollowups = followups.length > 0;

  // Sync internal phase with isFlipped prop
  if (isFlipped && phase === 'question') {
    setPhase('answer');
  } else if (!isFlipped && phase !== 'question') {
    setPhase('question');
    setFollowupIndex(0);
  }

  const handleRevealAnswer = () => {
    onFlip();
  };
  const handleNextFollowup = () => {
    if (followupIndex < followups.length - 1) {
      setFollowupIndex((i) => i + 1);
    }
  };

  const handleRating = (rating: 'known' | 'review') => {
    setPhase('question');
    setFollowupIndex(0);
    if (rating === 'known') onKnown();
    else onReview();
  };

  const difficultyBadge = `badge badge-${question.difficulty}`;

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <span className={difficultyBadge}>
          {question.difficulty}
        </span>
        <span className="badge badge-muted">{question.category}</span>
        <span className={styles.levelRole}>
          {level} {role}
        </span>
      </div>

      {/* Question */}
      <div className={`card-glass ${styles.questionCard}`}>
        <p className={`${styles.questionText} ${question.code_snippet ? styles.questionTextWithCode : ''}`}>
          {question.question}
        </p>

        {question.code_snippet && phase === 'question' && (
          <pre className={`code-block ${styles.codeBlock}`}>
            <code>{question.code_snippet}</code>
          </pre>
        )}
      </div>

      {/* Answer */}
      {(phase === 'answer' || phase === 'followups') && (
        <div className={`card animate-slideUp ${styles.answerCard}`}>
          <p className={styles.answerTitle}>
            MODEL ANSWER
          </p>
          <p className={styles.answerText}>
            {question.answer}
          </p>
          {question.code_snippet && (
            <pre className={`code-block ${styles.codeBlock}`}>
              <code>{question.code_snippet}</code>
            </pre>
          )}
        </div>
      )}

      {/* Follow-ups */}
      {phase === 'followups' && followups.length > 0 && (
        <div className={`animate-slideUp ${styles.followupsContainer}`}>
          <div className={styles.followupHeader}>
            <span className={styles.followupTitle}>
              Follow-up {followupIndex + 1} / {followups.length}
            </span>
          </div>

          <div className={`card ${styles.followupCard}`}>
            <p className={styles.followupQuestionText}>
              {followups[followupIndex].question}
            </p>
            <p className={styles.followupAnswerText}>
              {followups[followupIndex].answer}
            </p>
          </div>

          {followupIndex < followups.length - 1 && (
            <div className={styles.nextButtonWrapper}>
              <button id="btn-next-followup" className="btn btn-secondary" onClick={handleNextFollowup}>
                Next Follow-up →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className={styles.actionsContainer}>
        {phase === 'question' && (
          <button id="btn-reveal-answer" className="btn btn-primary btn-lg" onClick={handleRevealAnswer}>
            Reveal Answer
          </button>
        )}

        {phase === 'answer' && (
          <>
            {hasFollowups && (
              <button id="btn-show-followups" className="btn btn-accent" onClick={() => setPhase('followups')}>
                Follow-ups ({followups.length})
              </button>
            )}
            <button id="btn-review" className="btn btn-danger" onClick={() => handleRating('review')}>
              Needs Review
            </button>
            <button id="btn-known" className="btn btn-success" onClick={() => handleRating('known')}>
              Got It ✓
            </button>
          </>
        )}

        {phase === 'followups' && followupIndex === followups.length - 1 && (
          <>
            <button id="btn-review" className="btn btn-danger" onClick={() => handleRating('review')}>
              Needs Review
            </button>
            <button id="btn-known" className="btn btn-success" onClick={() => handleRating('known')}>
              Got It ✓
            </button>
          </>
        )}
      </div>
    </div>
  );
}
