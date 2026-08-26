import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/icons/PlusIcon";
import type { Metadata } from "next";
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
      <Navbar 
        right={
          <>
            <Button id="nav-decks" href="/decks" variant="ghost" size="sm">
              My Decks
            </Button>
            <Button id="nav-upload" href="/upload" variant="primary" size="sm" leftIcon={<PlusIcon />}>
              Upload
            </Button>
            <ThemeToggle />
          </>
        }
      />

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
                <Button
                  id="hero-upload"
                  href="/upload"
                  variant="glass"
                  size="lg"
                >
                  Start Studying
                </Button>
                <Button
                  id="hero-decks"
                  href="/decks"
                  variant="subtle"
                  size="lg"
                >
                  My Decks
                </Button>
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
