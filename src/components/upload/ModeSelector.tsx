'use client';

import type { ReadingMode } from '@/types';

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
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xl)',
        marginBottom: 'var(--space-4)',
        color: 'var(--text-primary)',
      }}>
        Choose a Reading Mode
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-3)',
      }}>
        {MODES.map((mode) => {
          const isSelected = selected === mode.id;
          return (
            <button
              key={mode.id}
              id={`mode-${mode.id}`}
              onClick={() => onSelect(mode.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                background: isSelected
                  ? `linear-gradient(135deg, ${mode.color}22, ${mode.color}11)`
                  : 'var(--bg-surface)',
                border: `2px solid ${isSelected ? mode.color : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
                boxShadow: isSelected ? `0 0 0 4px ${mode.color}18` : 'none',
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}
              aria-pressed={isSelected}
            >
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{mode.icon}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  color: isSelected ? mode.color : 'var(--text-primary)',
                  marginBottom: '2px',
                }}>
                  {mode.label}
                </div>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                }}>
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
