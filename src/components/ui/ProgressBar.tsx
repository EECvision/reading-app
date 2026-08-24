'use client';

import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ current, total, showLabel = true, className = '' }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className={`flex justify-between items-center ${styles.labelContainer}`}>
          <span>{current} of {total}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="progress-track" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
