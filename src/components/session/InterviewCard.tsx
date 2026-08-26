'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/icons/ArrowRight';
import type { InterviewQuestion } from '@/types';
import styles from './InterviewCard.module.css';

interface InterviewCardProps {
  question: InterviewQuestion;
  role: string;
  level: string;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
}

export function InterviewCard({ question, role, level, isFlipped, onFlip, onNext }: InterviewCardProps) {
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

  const handleNext = () => {
    setPhase('question');
    setFollowupIndex(0);
    onNext();
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
              <Button id="btn-next-followup" variant="secondary" onClick={handleNextFollowup} rightIcon={<ArrowRight />}>
                Next Follow-up
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className={styles.actionsContainer}>
        {phase === 'question' && (
          <Button id="btn-reveal-answer" variant="primary" size="lg" onClick={handleRevealAnswer}>
            Reveal Answer
          </Button>
        )}

        {phase === 'answer' && (
          <>
            {hasFollowups && (
              <Button id="btn-show-followups" variant="accent" onClick={() => setPhase('followups')}>
                Follow-ups ({followups.length})
              </Button>
            )}
            <Button id="btn-next" variant="primary" onClick={handleNext} rightIcon={<ArrowRight />}>
              Next
            </Button>
          </>
        )}

        {phase === 'followups' && followupIndex === followups.length - 1 && (
          <Button id="btn-next" variant="primary" onClick={handleNext} rightIcon={<ArrowRight />}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
