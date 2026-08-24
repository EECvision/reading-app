import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const metadata: Metadata = {
  title: 'ReadWise — Learn By Listening',
  description: 'Your personal study companion. Upload JSON content and learn through flashcards, Q&A, articles, structured notes, MCQ, and interview practice with text-to-speech.',
};

const FEATURES = [
  { icon: '🃏', title: 'Flashcards', desc: 'Classic word/definition flip cards', color: 'hsl(252, 74%, 55%)' },
  { icon: '💬', title: 'Q & A', desc: 'Question and answer with hints', color: 'hsl(196, 80%, 48%)' },
  { icon: '📄', title: 'Articles', desc: 'Long-form passages with summaries', color: 'hsl(142, 60%, 42%)' },
  { icon: '📝', title: 'Notes', desc: 'Structured topics with subtopics', color: 'hsl(38, 90%, 50%)' },
  { icon: '✅', title: 'MCQ', desc: 'Multiple choice with explanations', color: 'hsl(315, 70%, 52%)' },
  { icon: '🎤', title: 'Interview', desc: 'Real interview prep with follow-ups', color: 'hsl(16, 80%, 52%)' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose a Mode', desc: 'Pick from 6 study modes designed for different types of content.' },
  { step: '02', title: 'Upload Your JSON', desc: 'Upload a structured JSON file. Download a template to get started.' },
  { step: '03', title: 'Study & Listen', desc: 'Use TTS to listen while you review. Rate items to track your progress.' },
];

export default function HomePage() {
  return (
    <div className="page-bg">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              ReadWise
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link id="nav-decks" href="/decks" className="btn btn-ghost btn-sm">My Decks</Link>
            <Link id="nav-upload" href="/upload" className="btn btn-primary btn-sm">+ Upload</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="section" style={{ textAlign: 'center', paddingTop: 'var(--space-20)' }}>
        <div className="container-sm">
          <div className="animate-slideUp">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'hsl(252 74% 55% / 0.12)',
              border: '1px solid hsl(252 74% 55% / 0.25)',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--space-6)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--brand-400)',
              letterSpacing: '0.05em',
            }}>
              <span>✦</span>
              YOUR PERSONAL STUDY COMPANION
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 'var(--space-6)',
              background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--brand-300) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Learn Anything.<br />Just Listen.
            </h1>

            <p style={{
              fontSize: 'var(--text-xl)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: 500,
              margin: '0 auto var(--space-10)',
            }}>
              Upload your study content as JSON and let ReadWise read it to you — with flashcards, Q&amp;A, articles, notes, MCQ, and interview practice.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link id="hero-upload" href="/upload" className="btn btn-primary btn-lg">
                Start Studying →
              </Link>
              <Link id="hero-decks" href="/decks" className="btn btn-secondary btn-lg">
                My Decks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reading Modes Grid */}
      <section className="section-sm">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: 'var(--space-3)' }}>
              6 Ways to Study
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Choose the mode that fits your content — then switch any time during a session.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href="/upload"
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  border: `1px solid ${f.color}22`,
                }}
              >
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 'var(--radius-lg)',
                  background: `${f.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {f.title}
                  </h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container-sm">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: 'var(--space-3)' }}>
              How It Works
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 'var(--text-3xl)',
                  color: 'var(--border)',
                  lineHeight: 1,
                  flexShrink: 0,
                  width: 64,
                }}>
                  {step.step}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
                    {step.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm" style={{ textAlign: 'center', paddingBottom: 'var(--space-20)' }}>
        <div className="container-xs">
          <div className="card-glass" style={{ padding: 'var(--space-12)', borderRadius: 'var(--radius-2xl)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: 'var(--space-4)' }}>
              Ready to start?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
              Download a template, fill it in, and upload to begin your study session.
            </p>
            <Link id="cta-upload" href="/upload" className="btn btn-primary btn-lg">
              Upload Your First Deck →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: 'var(--space-6) 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
      }}>
        <div className="container">
          ReadWise · All data stored locally in your browser
        </div>
      </footer>
    </div>
  );
}
