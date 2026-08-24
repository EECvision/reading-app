'use client';

import { useCallback, useState, useRef } from 'react';

interface FileUploadProps {
  onFile: (content: string, name: string) => void;
  disabled?: boolean;
}

export function FileUpload({ onFile, disabled }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json')) {
      alert('Please upload a .json file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileName(file.name);
      onFile(content, file.name);
    };
    reader.readAsText(file);
  }, [onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div>
      <div
        id="file-drop-zone"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload JSON file"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--brand-400)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-10) var(--space-6)',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: dragging ? 'hsl(252 74% 55% / 0.05)' : 'var(--bg-elevated)',
          transition: 'all var(--transition-fast)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div style={{ marginBottom: 'var(--space-3)', fontSize: '2.5rem' }}>
          {fileName ? '✅' : '📂'}
        </div>
        {fileName ? (
          <>
            <div style={{ fontWeight: 600, color: 'var(--brand-400)', marginBottom: 'var(--space-1)' }}>
              {fileName}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Click to replace
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
              Drop your JSON file here
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              or click to browse — .json files only
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        onChange={onInputChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
}
