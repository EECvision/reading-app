'use client';

import { useState } from 'react';
import type { ReadingMode } from '@/types';
import { downloadTemplate, getTemplate, getAIPrompt } from '@/lib/templates';
import styles from './TemplateActions.module.css';

interface TemplateActionsProps {
  mode: ReadingMode | null;
}

export function TemplateActions({ mode }: TemplateActionsProps) {
  const [activePanel, setActivePanel] = useState<'sample' | 'ai' | null>(null);
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
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
    const prompt = getAIPrompt(mode, topic.trim(), count);
    await navigator.clipboard.writeText(prompt);
    const chatUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    window.open(chatUrl, '_blank');
  };

  const sampleJson = JSON.stringify(getTemplate(mode), null, 2);

  return (
    <div className={styles.container}>
      <div className={styles.actionsRow}>
        <button
          className={`btn btn-sm ${activePanel === 'ai' ? 'btn-primary' : 'btn-ghost'} ${styles.actionButton}`}
          onClick={() => setActivePanel(activePanel === 'ai' ? null : 'ai')}
        >
          <span>✨</span> Generate with AI
        </button>
        <button
          className={`btn btn-sm ${activePanel === 'sample' ? 'btn-primary' : 'btn-ghost'} ${styles.actionButton}`}
          onClick={() => setActivePanel(activePanel === 'sample' ? null : 'sample')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          View Sample
        </button>
        <button
          className={`btn btn-ghost btn-sm ${styles.actionButton}`}
          onClick={() => downloadTemplate(mode)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Sample
        </button>
      </div>

      {activePanel === 'sample' && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Sample JSON Format</h3>
          <pre className={styles.codeBlock}>
            <code>{sampleJson}</code>
          </pre>
          <div className={styles.buttonRow}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(sampleJson)}>
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
        </div>
      )}

      {activePanel === 'ai' && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Generate with ChatGPT</h3>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label htmlFor="topic-input" className={styles.inputLabel}>
                What do you want to learn? *
              </label>
              <input
                id="topic-input"
                type="text"
                className="input"
                placeholder="e.g. Spanish Verbs, World Capitals, History of Rome"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div className={styles.inputGroup} style={{ width: '120px' }}>
              <label htmlFor="count-input" className={styles.inputLabel}>
                How many?
              </label>
              <input
                id="count-input"
                type="number"
                min="1"
                max="50"
                className="input"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => handleCopy(getAIPrompt(mode, topic.trim(), count))}
              disabled={!topic.trim()}
            >
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleOpenChatGPT}
              disabled={!topic.trim()}
            >
              Open in ChatGPT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
