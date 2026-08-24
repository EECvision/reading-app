'use client';

import { useState } from 'react';
import styles from './JsonPaste.module.css';

interface JsonPasteProps {
  onPasteSubmit: (content: string, defaultName: string) => void;
  disabled?: boolean;
}

export function JsonPaste({ onPasteSubmit, disabled }: JsonPasteProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (!val.trim()) {
      setError(null);
      return;
    }
    try {
      JSON.parse(val);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const handleSubmit = () => {
    if (!content.trim() || error) return;
    onPasteSubmit(content, 'Pasted-Deck');
  };

  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        placeholder="[\n  {\n    &#34;word&#34;: &#34;Example&#34;,\n    &#34;definition&#34;: &#34;...&#34;\n  }\n]"
        value={content}
        onChange={handleChange}
        disabled={disabled}
      />
      <div className={styles.actions}>
        {error && <span className={styles.errorText}>{error}</span>}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={disabled || !content.trim() || !!error}
        >
          Import
        </button>
      </div>
    </div>
  );
}
