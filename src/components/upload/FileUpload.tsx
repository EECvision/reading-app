'use client';

import { useCallback, useState, useRef } from 'react';
import styles from './FileUpload.module.css';

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

  let containerClass = styles.dropZone;
  if (dragging) containerClass += ` ${styles.dragging}`;
  if (disabled) containerClass += ` ${styles.disabled}`;

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
        className={containerClass}
      >
        <div className={styles.icon}>
          {fileName ? '✅' : '📂'}
        </div>
        {fileName ? (
          <>
            <div className={styles.fileName}>
              {fileName}
            </div>
            <div className={styles.fileDesc}>
              Click to replace
            </div>
          </>
        ) : (
          <>
            <div className={styles.promptTitle}>
              Drop your JSON file here
            </div>
            <div className={styles.promptDesc}>
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
        className={styles.hiddenInput}
        aria-hidden="true"
      />
    </div>
  );
}
