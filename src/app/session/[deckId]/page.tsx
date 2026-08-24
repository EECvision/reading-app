'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { 
  ReadingMode, AnyItem, SessionStyle, ItemRating, 
  InterviewDeck, InterviewQuestion,
  FlashcardItem, QAItem, ArticleItem, NotesItem, MCQItem,
} from '@/types';
import { getDeck, getSettings, saveAutoplaySettings, saveShuffleSettings } from '@/lib/localStorage';
import { buildStudyList, rateItem, saveSessionSummary } from '@/lib/progress';
import { stop, buildSpeechText } from '@/lib/tts';
import { SessionControls } from '@/components/session/SessionControls';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FlashCard } from '@/components/session/FlashCard';
import { QACard } from '@/components/session/QACard';
import { ArticleCard } from '@/components/session/ArticleCard';
import { NotesCard } from '@/components/session/NotesCard';
import { MCQCard } from '@/components/session/MCQCard';
import { InterviewCard } from '@/components/session/InterviewCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import styles from './page.module.css';

// Helper: safely extract the id added by normaliseItems()
function getId(item: AnyItem): string {
  if ('id' in item) return (item as { id: string }).id ?? '';
  return '';
}

export default function SessionPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const router = useRouter();

  const [items, setItems] = useState<AnyItem[]>([]);
  const [mode, setMode] = useState<ReadingMode>('flashcard');
  const [deckName, setDeckName] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');
  const [index, setIndex] = useState(0);
  const [sessionStyle, setSessionStyle] = useState<SessionStyle>('read-and-listen');
  const [shuffle, setShuffle] = useState(() => getSettings().shuffle);
  const [autoplay, setAutoplay] = useState(() => getSettings().autoplay);
  const [ratings, setRatings] = useState<Record<string, ItemRating>>({});
  const [startedAt] = useState(new Date().toISOString());
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const deck = getDeck(deckId);
    if (!deck) { router.push('/decks'); return; }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(deck.mode);
     
    setDeckName(deck.name);

    let list: AnyItem[] = [];
    if (deck.mode === 'interview') {
      const interviewDeck = deck.items as InterviewDeck;
       
      setRole(interviewDeck.role);
       
      setLevel(interviewDeck.level);
      list = interviewDeck.questions as unknown as AnyItem[];
    } else {
      list = deck.items as AnyItem[];
    }

     
    setItems(buildStudyList(list, deckId, false));
  }, [deckId, router]);

  // Rebuild list when shuffle changes
  useEffect(() => {
    if (items.length === 0) return;
    const deck = getDeck(deckId);
    if (!deck) return;
    let list: AnyItem[];
    if (deck.mode === 'interview') {
      list = (deck.items as InterviewDeck).questions as unknown as AnyItem[];
    } else {
      list = deck.items as AnyItem[];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(buildStudyList(list, deckId, shuffle));
     
    setIndex(0);
    setIsFlipped(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffle]);

  const currentItem = items[index];
  const currentId = currentItem ? getId(currentItem) : '';

  const handleRate = useCallback((rating: ItemRating) => {
    if (!currentId) return;
    rateItem(deckId, currentId, rating);
    setRatings((prev) => ({ ...prev, [currentId]: rating }));
  }, [deckId, currentId]);

  const handleNext = useCallback(() => {
    stop();
    setIsFlipped(false);
    if (index < items.length - 1) {
      setIndex((i) => i + 1);
    } else {
      const endedAt = new Date().toISOString();
      const durationSeconds = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);
      const known = Object.values(ratings).filter((r) => r === 'known').length;
      const review = Object.values(ratings).filter((r) => r === 'review').length;
      saveSessionSummary(deckId, {
        startedAt,
        endedAt,
        durationSeconds,
        itemsStudied: Object.keys(ratings).length,
        itemsKnown: known,
        itemsToReview: review,
        sessionStyle,
      });
      router.push(`/session/${deckId}/summary`);
    }
  }, [index, items.length, deckId, startedAt, ratings, sessionStyle, router]);

  const handlePrev = useCallback(() => {
    stop();
    setIsFlipped(false);
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);



  const handleRestart = useCallback(() => {
    stop();
    setIsFlipped(false);
    setIndex(0);
  }, []);

  if (!currentItem) {
    return (
      <div className={`page-bg min-h-screen ${styles.loadingContainer}`}>
        <div className={`animate-pulse ${styles.loadingText}`}>Loading deck…</div>
      </div>
    );
  }

  const frontText = buildSpeechText(mode, currentItem as unknown as Record<string, unknown>, 'front');
  const backText = buildSpeechText(mode, currentItem as unknown as Record<string, unknown>, 'back');


  const renderCard = () => {
    const onKnown = () => { handleRate('known'); handleNext(); };
    const onReview = () => { handleRate('review'); handleNext(); };

    switch (mode) {
      case 'flashcard':
        return <FlashCard item={currentItem as FlashcardItem} sessionStyle={sessionStyle} isFlipped={isFlipped} onFlip={() => setIsFlipped(f => !f)} onKnown={onKnown} onReview={onReview} />;
      case 'qa':
        return <QACard item={currentItem as QAItem} sessionStyle={sessionStyle} isFlipped={isFlipped} onFlip={() => setIsFlipped(f => !f)} onKnown={onKnown} onReview={onReview} />;
      case 'article':
        return <ArticleCard item={currentItem as ArticleItem} sessionStyle={sessionStyle} isFlipped={isFlipped} onFlip={() => setIsFlipped(f => !f)} onKnown={onKnown} onReview={onReview} />;
      case 'notes':
        return <NotesCard item={currentItem as NotesItem} sessionStyle={sessionStyle} isFlipped={isFlipped} onFlip={() => setIsFlipped(f => !f)} onKnown={onKnown} onReview={onReview} />;
      case 'mcq':
        return <MCQCard item={currentItem as MCQItem} isFlipped={isFlipped} onFlip={() => setIsFlipped(f => !f)} onKnown={onKnown} onReview={onReview} />;
      case 'interview':
        return (
          <InterviewCard
            question={currentItem as unknown as InterviewQuestion}
            role={role}
            level={level}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(f => !f)}
            onKnown={onKnown}
            onReview={onReview}
          />
        );
    }
  };

  return (
    <div className={`page-bg-accent ${styles.pageContainer}`}>
      <nav className="nav">
        <div className="nav-inner">
          <div className={styles.navBrand}>
            <Link id="nav-home" href="/" className={styles.navLogoLink}>
              <span className={styles.navLogo}>📚</span>
              <span className={styles.navTitle}>ReadWise</span>
            </Link>
            <span className={styles.navSeparator}>/</span>
            <span className={styles.navDeckName}>
              {deckName}
            </span>
          </div>
          <div className={styles.navActions}>
            <Link id="nav-end-session" href={`/session/${deckId}/summary`} className="btn btn-ghost btn-sm">
              End Session
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container-sm section">
        {/* Progress */}
        <div className={`animate-slideDown ${styles.progressContainer}`}>
          <ProgressBar current={index + 1} total={items.length} onRestart={handleRestart} />
        </div>

        {/* Session Controls */}
        <div className={styles.controlsContainer}>
          <SessionControls
            frontText={frontText}
            backText={backText}
            isFlipped={isFlipped}
            onPrev={handlePrev}
            onNext={handleNext}
            canPrev={index > 0}
            canNext={index < items.length - 1}
            autoplay={autoplay}
            onAutoplayChange={(val) => {
              setAutoplay(val);
              saveAutoplaySettings(val);
            }}
            shuffle={shuffle}
            onShuffleChange={(val) => {
              setShuffle(val);
              saveShuffleSettings(val);
            }}
            sessionStyle={sessionStyle}
            onStyleChange={(s) => {
              setSessionStyle(s);
              setIsFlipped(false); // reset state when switching modes
            }}
          />
        </div>

        {/* Card Area */}
        <div
          key={currentId}
          className={`animate-scaleIn ${styles.cardArea}`}
        >
          {renderCard()}
        </div>
      </div>
    </div>
  );
}
