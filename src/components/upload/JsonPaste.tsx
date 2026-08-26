'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './JsonPaste.module.css';

interface JsonPasteProps {
  onPasteSubmit: (content: string, defaultName: string) => void;
  disabled?: boolean;
}

export function JsonPaste({ onPasteSubmit, disabled }: JsonPasteProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmitRef = useRef(onPasteSubmit);
  useEffect(() => { onSubmitRef.current = onPasteSubmit; });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!content.trim()) {
        setError(null);
        return;
      }
      try {
        JSON.parse(content);
        setError(null);
        onSubmitRef.current(content, 'Pasted-Deck');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid JSON');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
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
      {error && (
        <div className={styles.actions}>
          <span className={styles.errorText}>{error}</span>
        </div>
      )}
    </div>
  );
}
