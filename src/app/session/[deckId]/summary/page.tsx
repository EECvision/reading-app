'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getDeck, getProgress } from '@/lib/localStorage';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import styles from './page.module.css';

export default function SummaryPage() {
  const { deckId } = useParams<{ deckId: string }>();

  // Lazy-init from LocalStorage — synchronous reads don't need an effect
  const deck = getDeck(deckId);
  const progress = deck ? getProgress(deckId) : null;

  const deckName = deck?.name ?? '';
  const totalItems = deck?.itemCount ?? 0;
  const known = progress?.totalKnown ?? 0;
  const review = progress?.totalReview ?? 0;
  const sessions = progress?.sessions.length ?? 0;
  const lastSession = (progress?.sessions.length ?? 0) > 0 ? progress!.sessions[0] : null;

  const unseen = totalItems - (known + review);
  const pct = totalItems > 0 ? Math.round((known / totalItems) * 100) : 0;

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem}s`;
  };

  // SVG donut
  const R = 60;
  const circ = 2 * Math.PI * R;
  const knownPct = totalItems > 0 ? known / totalItems : 0;
  const reviewPct = totalItems > 0 ? review / totalItems : 0;
  const knownDash = knownPct * circ;
  const reviewDash = reviewPct * circ;

  return (
    <div className="page-bg min-h-screen">
      <nav className="nav">
        <div className="nav-inner">
          <Link id="nav-home" href="/" className={styles.navBrand}>
            <span className={styles.navLogo}>📚</span>
            <span className={styles.navTitle}>ReadWise</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container-xs section">
        <div className={`animate-slideUp ${styles.summaryContainer}`}>

          <div>
            <div className={styles.iconWrapper}>
              {pct >= 80 ? '🎉' : pct >= 50 ? '📈' : '💪'}
            </div>
            <h1 className={styles.title}>
              Session Complete!
            </h1>
            <p className={styles.deckName}>{deckName}</p>
          </div>

          {/* Donut chart */}
          <div className={styles.chartContainer}>
            <div className={styles.chartWrapper}>
              <svg width={160} height={160} viewBox="0 0 160 160">
                {/* Track */}
                <circle cx={80} cy={80} r={R} fill="none" stroke="var(--bg-overlay)" strokeWidth={14} />
                {/* Known */}
                {knownDash > 0 && (
                  <circle
                    cx={80} cy={80} r={R}
                    fill="none"
                    stroke="var(--green-400)"
                    strokeWidth={14}
                    strokeDasharray={`${knownDash} ${circ - knownDash}`}
                    strokeDashoffset={circ / 4}
                    strokeLinecap="round"
                  />
                )}
                {/* Review */}
                {reviewDash > 0 && (
                  <circle
                    cx={80} cy={80} r={R}
                    fill="none"
                    stroke="var(--accent-400)"
                    strokeWidth={14}
                    strokeDasharray={`${reviewDash} ${circ - reviewDash}`}
                    strokeDashoffset={circ / 4 - knownDash}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className={styles.pctLabelContainer}>
                <div className={styles.pctLabel}>
                  {pct}%
                </div>
                <div className={styles.pctSubtext}>known</div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className={styles.statsGrid}>
            {[
              { label: 'Known', value: known, color: 'var(--green-400)' },
              { label: 'Review', value: review, color: 'var(--accent-400)' },
              { label: 'Unseen', value: unseen, color: 'var(--text-muted)' },
            ].map((stat) => (
              <div key={stat.label} className={`card ${styles.statCard}`}>
                <div className={styles.statValue} style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Last session details */}
          {lastSession && (
            <div className={`card ${styles.lastSessionCard}`}>
              <h4 className={styles.lastSessionTitle}>
                Last Session
              </h4>
              <div className={styles.lastSessionRows}>
                {[
                  { label: 'Items Studied', value: lastSession.itemsStudied },
                  { label: 'Items Known', value: lastSession.itemsKnown },
                  { label: 'Time', value: formatTime(lastSession.durationSeconds) },
                  { label: 'Total Sessions', value: sessions },
                ].map((row) => (
                  <div key={row.label} className={styles.lastSessionRow}>
                    <span className={styles.rowLabel}>{row.label}</span>
                    <span className={styles.rowValue}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actionsContainer}>
            <Link id="btn-study-again" href={`/session/${deckId}`} className="btn btn-primary btn-lg">
              Study Again
            </Link>
            <Link id="btn-my-decks" href="/decks" className="btn btn-secondary">
              My Decks
            </Link>
            <Link id="btn-upload-new" href="/upload" className="btn btn-ghost">
              Upload New Deck
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
