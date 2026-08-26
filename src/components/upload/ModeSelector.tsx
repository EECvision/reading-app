'use client';

import type { ReadingMode } from '@/types';
import styles from './ModeSelector.module.css';

interface Mode {
  id: ReadingMode;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const MODES: Mode[] = [
  {
    id: 'flashcard',
    label: 'Flashcards',
    icon: '🃏',
    description: 'Word ↔ definition pairs with optional examples',
    color: 'hsl(252, 74%, 55%)',
  },
  {
    id: 'qa',
    label: 'Q & A',
    icon: '💬',
    description: 'Question and answer pairs with optional hints',
    color: 'hsl(196, 80%, 48%)',
  },
  {
    id: 'article',
    label: 'Article',
    icon: '📄',
    description: 'Long-form passages with title and summary',
    color: 'hsl(142, 60%, 42%)',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: '📝',
    description: 'Structured topics with headings and body text',
    color: 'hsl(38, 90%, 50%)',
  },
  {
    id: 'mcq',
    label: 'MCQ',
    icon: '✅',
    description: 'Multiple choice questions with explanations',
    color: 'hsl(315, 70%, 52%)',
  },
  {
    id: 'interview',
    label: 'Interview',
    icon: '🎤',
    description: 'Real interview questions with follow-ups and code',
    color: 'hsl(16, 80%, 52%)',
  },
];

interface ModeSelectorProps {
  selected: ReadingMode | null;
  onSelect: (mode: ReadingMode) => void;
}

export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <div>
      <div className={styles.grid}>
        {MODES.map((mode, index) => {
          const isSelected = selected === mode.id;
          const delayClass = `delay-${(index % 4) + 1}`;
          
          return (
            <button
              key={mode.id}
              id={`mode-${mode.id}`}
              onClick={() => onSelect(mode.id)}
              className={`${styles.modeCard} animate-blurFadeIn ${delayClass}`}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${mode.color}15, ${mode.color}05)`
                  : undefined,
                borderColor: isSelected ? mode.color : undefined,
                boxShadow: isSelected ? `0 0 0 1px ${mode.color}, 0 8px 24px ${mode.color}25` : undefined,
                transform: isSelected ? 'translateY(-4px)' : undefined,
              }}
              aria-pressed={isSelected}
            >
              <span className={styles.icon}>{mode.icon}</span>
              <div>
                <div 
                  className={styles.label}
                  style={{ color: isSelected ? mode.color : 'var(--text-primary)' }}
                >
                  {mode.label}
                </div>
                <div className={styles.description}>
                  {mode.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { MODES };
