import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Audiobooklm — Learn By Listening",
  description:
    "Your personal study companion. Upload JSON content and learn through flashcards, Q&A, articles, structured notes, MCQ, and interview practice with text-to-speech.",
};

export default function HomePage() {
  return (
    <div className="page-bg flex flex-col">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <div className={styles.navBrand}>
            <span className={styles.navLogo}>📚</span>
            <span className={styles.navTitle}>Audiobooklm</span>
          </div>
          <div className={styles.navActions}>
            <Link id="nav-decks" href="/decks" className="btn btn-ghost btn-sm">
              My Decks
            </Link>
            <Link
              id="nav-upload"
              href="/upload"
              className="btn btn-primary btn-sm"
            >
              + Upload
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className={`section ${styles.heroSection}`}>
          <div className={styles.heroGlow} />

          <div className={`container-sm ${styles.heroContent}`}>
            <div className="flex-col items-center">
              <div className={`${styles.heroBadge} animate-blurFadeIn delay-1`}>
                Audiobooklm 2.0
              </div>

              <h1 className={`${styles.heroTitle} animate-blurFadeIn delay-2`}>
                Learn anything.
                <br />
                Just listen.
              </h1>

              <p className={`${styles.heroDesc} animate-blurFadeIn delay-3`}>
                Upload your study content as JSON and experience a frictionless way to learn. Flashcards, Q&amp;A, and interview practice powered by seamless text-to-speech.
              </p>

              <div className={`${styles.heroActions} animate-blurFadeIn delay-4`}>
                <Link
                  id="hero-upload"
                  href="/upload"
                  className={styles.btnGlass}
                >
                  <span>Start Studying</span>
                </Link>
                <Link
                  id="hero-decks"
                  href="/decks"
                  className={styles.btnSubtle}
                >
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
          Audiobooklm · All data stored locally in your browser
        </div>
      </footer>
    </div>
  );
}
