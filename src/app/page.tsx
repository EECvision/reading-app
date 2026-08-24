import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import styles from './page.module.css';

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
          <div className={styles.navBrand}>
            <span className={styles.navLogo}>📚</span>
            <span className={styles.navTitle}>
              ReadWise
            </span>
          </div>
          <div className={styles.navActions}>
            <Link id="nav-decks" href="/decks" className="btn btn-ghost btn-sm">My Decks</Link>
            <Link id="nav-upload" href="/upload" className="btn btn-primary btn-sm">+ Upload</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={`section ${styles.heroSection}`}>
        <div className="container-sm">
          <div className="animate-slideUp">
            <div className={styles.heroBadge}>
              <span>✦</span>
              YOUR PERSONAL STUDY COMPANION
            </div>

            <h1 className={styles.heroTitle}>
              Learn Anything.<br />Just Listen.
            </h1>

            <p className={styles.heroDesc}>
              Upload your study content as JSON and let ReadWise read it to you — with flashcards, Q&amp;A, articles, notes, MCQ, and interview practice.
            </p>

            <div className={styles.heroActions}>
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
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              6 Ways to Study
            </h2>
            <p className={styles.sectionDesc}>
              Choose the mode that fits your content — then switch any time during a session.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href="/upload"
                className={`card ${styles.featureCard}`}
                style={{ border: `1px solid ${f.color}22` }}
              >
                <div 
                  className={styles.featureIcon}
                  style={{ background: `${f.color}18` }}
                >
                  {f.icon}
                </div>
                <div>
                  <h4 className={styles.featureTitle}>
                    {f.title}
                  </h4>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container-sm">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              How It Works
            </h2>
          </div>
          <div className={styles.stepsContainer}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className={styles.stepItem}>
                <div className={styles.stepNumber}>
                  {step.step}
                </div>
                <div>
                  <h4 className={styles.stepTitle}>
                    {step.title}
                  </h4>
                  <p className={styles.stepDesc}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`section-sm ${styles.ctaSection}`}>
        <div className="container-xs">
          <div className={`card-glass ${styles.ctaCard}`}>
            <h2 className={styles.ctaTitle}>
              Ready to start?
            </h2>
            <p className={styles.ctaDesc}>
              Download a template, fill it in, and upload to begin your study session.
            </p>
            <Link id="cta-upload" href="/upload" className="btn btn-primary btn-lg">
              Upload Your First Deck →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          ReadWise · All data stored locally in your browser
        </div>
      </footer>
    </div>
  );
}
