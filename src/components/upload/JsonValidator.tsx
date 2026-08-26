'use client';

import type { ValidationResult } from '@/lib/schemas';
import styles from './JsonValidator.module.css';

interface JsonValidatorProps {
  result: ValidationResult | null;
  loading?: boolean;
  mode?: string;
}

const MODE_NAMES: Record<string, string> = {
  flashcard: "Flashcards",
  qa: "Q&A",
  mcq: "Multiple Choice",
  interview: "Interview",
  article: "Article",
  notes: "Notes"
};

export function JsonValidator({ result, loading, mode }: JsonValidatorProps) {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={`animate-spin ${styles.spinner}`} />
        <span className={styles.loadingText}>Validating JSON…</span>
      </div>
    );
  }

  if (!result) return null;

  if (result.valid) {
    return (
      <div className={styles.validContainer}>
        <span className={styles.icon}>✅</span>
        <div>
          <div className={styles.validTitle}>
            Valid JSON
          </div>
          <div className={styles.validSubtext}>
            {result.itemCount} item{result.itemCount !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.invalidContainer}>
      <div className={`${styles.invalidHeader} ${result.errors.length > 0 ? styles.invalidHeaderWithErrors : ''}`}>
        <span className={styles.icon}>❌</span>
        <div className={styles.invalidTitle}>
          Invalid JSON Format
        </div>
      </div>
      {result.errors.length > 0 && (
        <div className={styles.invalidMessage}>
          {mode 
            ? `The uploaded JSON structure does not match the requirements for the ${MODE_NAMES[mode] || mode} learning mode. Please ensure you are using the correct file and format for this mode.` 
            : "The uploaded JSON structure is invalid. Please check the format and try again."}
        </div>
      )}
    </div>
  );
}
