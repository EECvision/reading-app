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
    <div className="page-bg" style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link id="nav-home" href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              ReadWise
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link id="nav-decks" href="/decks" className="btn btn-ghost btn-sm">My Decks</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container-sm section">
        <div className="animate-slideUp">
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            marginBottom: 'var(--space-3)',
          }}>
            Upload a Deck
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-10)' }}>
            Choose a reading mode, download a template, fill it in, and upload to start studying.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

            {/* Step 1 — Mode */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--brand-500)', color: 'white',
                  fontWeight: 800, fontSize: 'var(--text-sm)',
                }}>1</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', margin: 0 }}>
                  Select Mode
                </h2>
              </div>
              <ModeSelector selected={mode} onSelect={handleModeSelect} />
            </div>

            {/* Step 2 — Upload */}
            <div className="card" style={{ padding: 'var(--space-6)', opacity: mode ? 1 : 0.5, transition: 'opacity var(--transition-base)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '50%',
                    background: mode ? 'var(--brand-500)' : 'var(--bg-overlay)', color: mode ? 'white' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: 'var(--text-sm)',
                  }}>2</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', margin: 0 }}>
                    Upload JSON
                  </h2>
                </div>
                <TemplateDownload mode={mode} />
              </div>
              <FileUpload onFile={handleFile} disabled={!mode} />
              {(validating || validationResult) && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <JsonValidator result={validationResult} loading={validating} />
                </div>
              )}
            </div>

            {/* Step 3 — Name & Save */}
            {validationResult?.valid && (
              <div className="card animate-slideUp" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--brand-500)', color: 'white',
                    fontWeight: 800, fontSize: 'var(--text-sm)',
                  }}>3</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', margin: 0 }}>
                    Name & Start
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <label htmlFor="deck-name" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
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
                    className="btn btn-primary btn-lg"
                    onClick={handleSave}
                    disabled={saving || !canSave}
                    style={{ alignSelf: 'flex-start' }}
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
