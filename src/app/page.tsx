import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'ReadWise — Learn By Listening',
  description: 'Your personal study companion. Upload JSON content and learn through flashcards, Q&A, articles, structured notes, MCQ, and interview practice with text-to-speech.',
};


export default function HomePage() {
  return (
    <div className="page-bg flex flex-col">
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

      <main className="flex-1">
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
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          ReadWise · All data stored locally in your browser
        </div>
      </footer>
    </div>
  );
}
