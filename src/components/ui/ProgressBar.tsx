'use client';

import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
  onRestart?: () => void;
}

export function ProgressBar({ current, total, showLabel = true, className = '', onRestart }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className={`flex justify-between items-center ${styles.labelContainer}`}>
          <div className="flex items-center gap-2">
            <span>{current} of {total}</span>
            {onRestart && (
              <button 
                onClick={onRestart} 
                className={styles.restartBtn}
                title="Restart Session"
                aria-label="Restart Session"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
            )}
          </div>
          <span>{pct}%</span>
        </div>
      )}
      <div className="progress-track" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
