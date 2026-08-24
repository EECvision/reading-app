'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ReadingMode } from '@/types';
import { ModeSelector } from '@/components/upload/ModeSelector';
import { FileUpload } from '@/components/upload/FileUpload';
import { JsonValidator } from '@/components/upload/JsonValidator';
import { TemplateDownload } from '@/components/upload/TemplateDownload';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { validateJSON, normaliseItems, type ValidationResult } from '@/lib/schemas';
import { saveDeck } from '@/lib/localStorage';
import { nanoid } from '@/lib/nanoid';
import type { Deck, InterviewDeck } from '@/types';
import styles from './page.module.css';

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ReadingMode | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [fileName, setFileName] = useState<string>('');
  const [deckName, setDeckName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleModeSelect = (m: ReadingMode) => {
    setMode(m);
    setValidationResult(null);
    setParsedData(null);
  };

  const handleFile = (content: string, name: string) => {
    setFileName(name);
    setValidating(true);
    setValidationResult(null);
    setParsedData(null);

    // Give UI a tick to show spinner
    setTimeout(() => {
      try {
        const data = JSON.parse(content);
        if (!mode) {
          setValidating(false);
          return;
        }
        const result = validateJSON(mode, data);
        setValidationResult(result);
        if (result.valid) {
          setParsedData(normaliseItems(mode, data));
          // Auto-fill deck name from filename
          if (!deckName) {
            setDeckName(name.replace(/\.json$/i, '').replace(/[-_]/g, ' '));
          }
        }
      } catch {
        setValidationResult({ valid: false, errors: ['Could not parse JSON. Please check your file for syntax errors.'], itemCount: 0 });
      }
      setValidating(false);
    }, 200);
  };

  const handleSave = () => {
    if (!mode || !parsedData || !validationResult?.valid) return;
    setSaving(true);

    const id = nanoid();
    const isInterview = mode === 'interview';
    const interviewData = isInterview ? (parsedData as InterviewDeck) : null;

    const deck: Deck = {
      id,
      name: deckName.trim() || fileName.replace(/\.json$/i, ''),
      mode,
      uploadedAt: new Date().toISOString(),
      itemCount: isInterview
        ? (interviewData?.questions.length ?? 0)
        : (parsedData as unknown[]).length,
      items: parsedData as Deck['items'],
      ...(isInterview && {
        role: interviewData?.role,
        level: interviewData?.level,
      }),
    };

    saveDeck(deck);
    router.push(`/session/${id}`);
  };

  const canSave = mode && validationResult?.valid && parsedData;

  return (
    <div className={`page-bg ${styles.pageContainer}`}>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link id="nav-home" href="/" className={styles.navBrand}>
            <span className={styles.navLogo}>📚</span>
            <span className={styles.navTitle}>
              ReadWise
            </span>
          </Link>
          <div className={styles.navActions}>
            <Link id="nav-decks" href="/decks" className="btn btn-ghost btn-sm">My Decks</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container-sm section">
        <div className="animate-slideUp">
          <h1 className={styles.pageTitle}>
            Upload a Deck
          </h1>
          <p className={styles.pageDesc}>
            Choose a reading mode, download a template, fill it in, and upload to start studying.
          </p>

          <div className={styles.stepsContainer}>

            {/* Step 1 — Mode */}
            <div className={`card ${styles.stepCard}`}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>1</span>
                <h2 className={styles.stepTitle}>
                  Select Mode
                </h2>
              </div>
              <ModeSelector selected={mode} onSelect={handleModeSelect} />
            </div>

            {/* Step 2 — Upload */}
            <div 
              className={`card ${styles.stepCardWithTransition}`} 
              style={{ opacity: mode ? 1 : 0.5 }}
            >
              <div className={styles.step2Header}>
                <div className={styles.stepHeaderInner}>
                  <span 
                    className={styles.stepNumber}
                    style={{ 
                      background: mode ? 'var(--brand-500)' : 'var(--bg-overlay)', 
                      color: mode ? 'white' : 'var(--text-muted)' 
                    }}
                  >
                    2
                  </span>
                  <h2 className={styles.stepTitle}>
                    Upload JSON
                  </h2>
                </div>
                <TemplateDownload mode={mode} />
              </div>
              <FileUpload onFile={handleFile} disabled={!mode} />
              {(validating || validationResult) && (
                <div className={styles.validatorContainer}>
                  <JsonValidator result={validationResult} loading={validating} />
                </div>
              )}
            </div>

            {/* Step 3 — Name & Save */}
            {validationResult?.valid && (
              <div className={`card animate-slideUp ${styles.stepCard}`}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepNumber}>3</span>
                  <h2 className={styles.stepTitle}>
                    Name & Start
                  </h2>
                </div>

                <div className={styles.nameSaveForm}>
                  <div>
                    <label htmlFor="deck-name" className={styles.inputLabel}>
                      Deck Name
                    </label>
                    <input
                      id="deck-name"
                      className="input"
                      type="text"
                      placeholder="e.g. JavaScript Interview Questions"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                    />
                  </div>

                  <button
                    id="btn-start-studying"
                    className={`btn btn-primary btn-lg ${styles.saveButton}`}
                    onClick={handleSave}
                    disabled={saving || !canSave}
                  >
                    {saving ? 'Starting…' : 'Start Studying →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
