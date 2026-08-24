'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDecks, deleteDeck, getProgress } from '@/lib/localStorage';
import { DeckCard } from '@/components/decks/DeckCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Deck, DeckProgress } from '@/types';

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>(() => getDecks());
  const [progresses, setProgresses] = useState<Record<string, DeckProgress>>(() => {
    const d = getDecks();
    const p: Record<string, DeckProgress> = {};
    d.forEach((deck) => { p[deck.id] = getProgress(deck.id); });
    return p;
  });
  const loaded = true;

  const handleDelete = (id: string) => {
    if (!confirm('Delete this deck? This cannot be undone.')) return;
    deleteDeck(id);
    setDecks((prev) => prev.filter((d) => d.id !== id));
    setProgresses((prev) => { const next = { ...prev }; delete next[id]; return next; });
  };

  return (
    <div className="page-bg min-h-screen">
      <nav className="nav">
        <div className="nav-inner">
          <Link id="nav-home" href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>ReadWise</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link id="nav-upload" href="/upload" className="btn btn-primary btn-sm">+ Upload</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container section">
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
              My Decks
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {decks.length} deck{decks.length !== 1 ? 's' : ''} saved locally
            </p>
          </div>
        </div>

        {!loaded ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-5)',
          }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-xl)' }} />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-20) 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-5)',
          }}>
            <div style={{ fontSize: '4rem' }}>📭</div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)' }}>No decks yet</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                Upload your first JSON deck to get started.
              </p>
              <Link id="btn-upload-first" href="/upload" className="btn btn-primary btn-lg">
                Upload Your First Deck →
              </Link>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-5)',
          }} className="animate-fadeIn">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                id={deck.id}
                name={deck.name}
                mode={deck.mode}
                itemCount={deck.itemCount}
                uploadedAt={deck.uploadedAt}
                progress={progresses[deck.id] ?? null}
                role={deck.role}
                level={deck.level}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
