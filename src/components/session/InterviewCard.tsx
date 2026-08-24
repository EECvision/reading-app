'use client';

import { useState } from 'react';
import type { InterviewQuestion } from '@/types';

interface InterviewCardProps {
  question: InterviewQuestion;
  role: string;
  level: string;
  onKnown: () => void;
  onReview: () => void;
}

export function InterviewCard({ question, role, level, onKnown, onReview }: InterviewCardProps) {
  const [phase, setPhase] = useState<'question' | 'answer' | 'followups'>('question');
  const [followupIndex, setFollowupIndex] = useState(0);

  const followups = question.follow_ups ?? [];
  const hasFollowups = followups.length > 0;

  const handleRevealAnswer = () => setPhase('answer');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%', maxWidth: 700 }}>

      {/* Header */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        <span className={difficultyBadge}>
          {question.difficulty}
        </span>
        <span className="badge badge-muted">{question.category}</span>
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {level} {role}
        </span>
      </div>

      {/* Question */}
      <div className="card-glass" style={{
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-8)',
        background: 'linear-gradient(135deg, hsl(16 80% 52% / 0.08), transparent)',
      }}>
        <p style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          fontFamily: 'var(--font-display)',
          marginBottom: question.code_snippet ? 'var(--space-5)' : 0,
        }}>
          {question.question}
        </p>

        {question.code_snippet && phase === 'question' && (
          <pre className="code-block" style={{ marginTop: 'var(--space-4)' }}>
            <code>{question.code_snippet}</code>
          </pre>
        )}
      </div>

      {/* Answer */}
      {(phase === 'answer' || phase === 'followups') && (
        <div className="card animate-slideUp" style={{
          background: 'linear-gradient(135deg, hsl(142 71% 45% / 0.07), transparent)',
          borderColor: 'hsl(142 71% 45% / 0.25)',
          padding: 'var(--space-6)',
        }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--green-400)', marginBottom: 'var(--space-3)', letterSpacing: '0.06em' }}>
            MODEL ANSWER
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            {question.answer}
          </p>
          {question.code_snippet && (
            <pre className="code-block" style={{ marginTop: 'var(--space-4)' }}>
              <code>{question.code_snippet}</code>
            </pre>
          )}
        </div>
      )}

      {/* Follow-ups */}
      {phase === 'followups' && followups.length > 0 && (
        <div className="animate-slideUp" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Follow-up {followupIndex + 1} / {followups.length}
            </span>
          </div>

          <div className="card" style={{ borderColor: 'hsl(38 100% 60% / 0.25)', background: 'hsl(38 100% 60% / 0.05)' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
              {followups[followupIndex].question}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
              {followups[followupIndex].answer}
            </p>
          </div>

          {followupIndex < followups.length - 1 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button id="btn-next-followup" className="btn btn-secondary" onClick={handleNextFollowup}>
                Next Follow-up →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
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
