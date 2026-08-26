"use client";

import { Navbar } from "@/components/ui/Navbar";
import { getDeck } from "@/lib/localStorage";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./page.module.css";

export default function SummaryPage() {
  const { deckId } = useParams<{ deckId: string }>();

  const deck = getDeck(deckId);
  const deckName = deck?.name ?? "";
  const totalItems = deck?.itemCount ?? 0;
  const pct = totalItems > 0 ? 100 : 0; // placeholder for emoji selection

  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <div className="container-xs section">
        <div className={`animate-slideUp ${styles.summaryContainer}`}>
          <div>
            <div className={styles.iconWrapper}>
              {pct >= 80 ? "🎉" : pct >= 50 ? "📈" : "💪"}
            </div>
            <h1 className={styles.title}>Session Complete!</h1>
            <p className={styles.deckName}>{deckName}</p>
          </div>

          {/* Actions */}
          <div className={styles.actionsContainer}>
            <Link
              id="btn-study-again"
              href={`/session/${deckId}`}
              className="btn btn-primary "
            >
              Study Again
            </Link>
            <Link
              id="btn-my-decks"
              href="/decks"
              className="btn btn-secondary "
            >
              My Decks
            </Link>
            <Link id="btn-upload-new" href="/upload" className="btn btn-ghost ">
              Upload New Deck
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
