'use client';

import type { ValidationResult } from '@/lib/schemas';
import styles from './JsonValidator.module.css';

interface JsonValidatorProps {
  result: ValidationResult | null;
  loading?: boolean;
}

export function JsonValidator({ result, loading }: JsonValidatorProps) {
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
          Invalid JSON — {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
        </div>
      </div>
      {result.errors.length > 0 && (
        <ul className={styles.errorList}>
          {result.errors.slice(0, 8).map((err, i) => (
            <li key={i} className={styles.errorItem}>
              {err}
            </li>
          ))}
          {result.errors.length > 8 && (
            <li className={styles.errorMore}>
              …and {result.errors.length - 8} more errors
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
