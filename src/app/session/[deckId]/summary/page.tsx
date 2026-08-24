'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getDeck, getProgress } from '@/lib/localStorage';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
          <Link id="nav-home" href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>ReadWise</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container-xs section">
        <div className="animate-slideUp" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', textAlign: 'center' }}>

          <div>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>
              {pct >= 80 ? '🎉' : pct >= 50 ? '📈' : '💪'}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-2)',
            }}>
              Session Complete!
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>{deckName}</p>
          </div>

          {/* Donut chart */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 160, height: 160 }}>
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
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'var(--text-3xl)', lineHeight: 1 }}>
                  {pct}%
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>known</div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-3)',
          }}>
            {[
              { label: 'Known', value: known, color: 'var(--green-400)' },
              { label: 'Review', value: review, color: 'var(--accent-400)' },
              { label: 'Unseen', value: unseen, color: 'var(--text-muted)' },
            ].map((stat) => (
              <div key={stat.label} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Last session details */}
          {lastSession && (
            <div className="card" style={{ textAlign: 'left', padding: 'var(--space-5)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)' }}>
                Last Session
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {[
                  { label: 'Items Studied', value: lastSession.itemsStudied },
                  { label: 'Items Known', value: lastSession.itemsKnown },
                  { label: 'Time', value: formatTime(lastSession.durationSeconds) },
                  { label: 'Total Sessions', value: sessions },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{row.label}</span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
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
