'use client';

import { useState } from 'react';
import type { ReadingMode } from '@/types';
import { downloadTemplate, getAIPrompt } from '@/lib/templates';
import { Button } from '@/components/ui/Button';
import styles from './TemplateActions.module.css';

interface TemplateActionsProps {
  mode: ReadingMode | null;
}

export function TemplateActions({ mode }: TemplateActionsProps) {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState<number | ''>(10);
  const [copied, setCopied] = useState(false);

  if (!mode) return null;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleOpenChatGPT = async () => {
    if (!topic.trim()) return;
    const prompt = getAIPrompt(mode, topic.trim(), typeof count === 'number' ? count : 10);
    await navigator.clipboard.writeText(prompt);
    const chatUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    window.open(chatUrl, '_blank');
  };

  return (
    <div className={styles.aiContainer}>
      <div className={styles.aiHeader}>
        <div className={styles.aiTitleGroup}>
          <span className={styles.aiIcon}>✨</span>
          <h3 className={styles.aiTitle}>Generate with AI</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadTemplate(mode)}
          leftIcon={(
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          )}
        >
          Download Sample
        </Button>
      </div>

      <div className={styles.formRow}>
        <div className={`${styles.inputGroup} ${styles.topicInput}`}>
          <label htmlFor="topic-input" className={styles.inputLabel}>
            What do you want to learn? *
          </label>
          <input
            id="topic-input"
            type="text"
            className="input"
            placeholder="e.g. Spanish Verbs, World Capitals"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        
        <div className={`${styles.inputGroup} ${styles.countInput}`}>
          <label htmlFor="count-input" className={styles.inputLabel}>
            How many?
          </label>
          <input
            id="count-input"
            type="number"
            min="1"
            max="100"
            className="input"
            value={count}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setCount('');
              } else {
                const num = parseInt(val, 10);
                if (!isNaN(num)) {
                  setCount(Math.min(100, Math.max(1, num)));
                }
              }
            }}
          />
        </div>

        <Button 
          variant="primary"
          className={styles.generateBtn}
          onClick={handleOpenChatGPT}
          disabled={!topic.trim()}
        >
          Open in ChatGPT
        </Button>
      </div>

      <p className={styles.hint}>
        After ChatGPT generates the JSON, copy the response and paste it into the <strong>Paste JSON</strong> tab below.
      </p>

      {topic.trim() && (
        <button 
          className={styles.copyPromptLink}
          onClick={() => handleCopy(getAIPrompt(mode, topic.trim(), typeof count === 'number' ? count : 10))}
        >
          {copied ? '✓ Prompt copied to clipboard!' : 'Just copy prompt (don\'t open ChatGPT)'}
        </button>
      )}
    </div>
  );
}
