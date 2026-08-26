"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FileUpload } from "@/components/upload/FileUpload";
import { JsonPaste } from "@/components/upload/JsonPaste";
import { JsonValidator } from "@/components/upload/JsonValidator";
import { ModeSelector } from "@/components/upload/ModeSelector";
import { TemplateActions } from "@/components/upload/TemplateActions";
import { saveDeck } from "@/lib/localStorage";
import { nanoid } from "@/lib/nanoid";
import {
  normaliseItems,
  validateJSON,
  type ValidationResult,
} from "@/lib/schemas";
import type { Deck, InterviewDeck, ReadingMode } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ReadingMode | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [fileName, setFileName] = useState<string>("");
  const [deckName, setDeckName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "paste">("file");

  const [currentStep, setCurrentStep] = useState(1);

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
            setDeckName(name.replace(/\.json$/i, "").replace(/[-_]/g, " "));
          }
        }
      } catch {
        setValidationResult({
          valid: false,
          errors: [
            "Could not parse JSON. Please check your file for syntax errors.",
          ],
          itemCount: 0,
        });
      }
      setValidating(false);
    }, 200);
  };

  const handleSave = () => {
    if (!mode || !parsedData || !validationResult?.valid) return;
    setSaving(true);

    const id = nanoid();
    const isInterview = mode === "interview";
    const interviewData = isInterview ? (parsedData as InterviewDeck) : null;

    const deck: Deck = {
      id,
      name: deckName.trim() || fileName.replace(/\.json$/i, ""),
      mode,
      uploadedAt: new Date().toISOString(),
      itemCount: isInterview
        ? (interviewData?.questions.length ?? 0)
        : (parsedData as unknown[]).length,
      items: parsedData as Deck["items"],
      ...(isInterview && {
        role: interviewData?.role,
        level: interviewData?.level,
      }),
    };

    saveDeck(deck);
    router.push(`/session/${id}`);
  };

  const canSave = mode && validationResult?.valid && parsedData;

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const renderStepper = () => {
    const steps = [
      { num: 1, label: "Mode" },
      { num: 2, label: "Generate" },
      { num: 3, label: "Upload" },
      { num: 4, label: "Start" },
    ];

    return (
      <div className={styles.stepper}>
        {steps.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          return (
            <div
              key={step.num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-4)",
              }}
            >
              <div
                className={`${styles.stepperItem} ${isActive ? styles.active : ""} ${isCompleted ? styles.completed : ""}`}
              >
                <span className={styles.stepperNum}>
                  {isCompleted ? "✓" : step.num}
                </span>
                <span className={styles.stepperLabel}>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`${styles.stepperSeparator} ${isCompleted ? styles.completed : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`page-bg ${styles.pageContainer}`}>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link id="nav-home" href="/" className={styles.navBrand}>
            <span className={styles.navLogo}>📚</span>
            <span className={styles.navTitle}>Audiobooklm</span>
          </Link>
          <div className={styles.navActions}>
            <Link id="nav-decks" href="/decks" className="btn btn-ghost btn-sm">
              My Decks
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container-sm section">
        <div className="animate-slideUp">
          <h1 className={styles.pageTitle}>Upload a Deck</h1>

          {renderStepper()}

          <div className={styles.stepsContainer}>
            {currentStep === 1 && (
              <div className={`card animate-fadeIn ${styles.stepCard}`}>
                <div className={styles.stepHeader}>
                  <div>
                    <h2 className={styles.stepTitle}>Select Learning Mode</h2>
                    <p className={styles.stepDesc}>
                      Choose the format that best fits what you are trying to
                      learn.
                    </p>
                  </div>
                </div>
                <ModeSelector selected={mode} onSelect={handleModeSelect} />

                <div className={styles.wizardActions}>
                  <div className={styles.wizardActionsRight}>
                    <button
                      className="btn btn-primary"
                      onClick={nextStep}
                      disabled={!mode}
                    >
                      Next Step →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className={`card animate-fadeIn ${styles.stepCard}`}>
                <div className={styles.stepHeader}>
                  <div>
                    <h2 className={styles.stepTitle}>Generate Content</h2>
                    <div className={styles.stepDesc}>
                      <ul
                        style={{
                          listStyleType: "disc",
                          paddingLeft: "20px",
                          marginTop: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <li>
                          Use AI or our templates to create your study
                          materials.
                        </li>
                        <li>
                          You will upload the generated JSON file in the next
                          step.
                        </li>
                        <li>
                          If you already have your content ready, you can skip
                          this step.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <TemplateActions mode={mode} />

                <div className={styles.wizardActions}>
                  <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                  </button>
                  <div className={styles.wizardActionsRight}>
                    <button className="btn btn-primary" onClick={nextStep}>
                      Next Step →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className={`card animate-fadeIn ${styles.stepCard}`}>
                <div className={styles.stepHeader}>
                  <div>
                    <h2 className={styles.stepTitle}>Upload JSON</h2>
                    <p className={styles.stepDesc}>
                      Provide your study content as a JSON file or via
                      copy-paste.
                    </p>
                  </div>
                </div>

                <div className={styles.uploadMethodTabs}>
                  <button
                    className={`${styles.tabBtn} ${uploadMethod === "file" ? styles.active : ""}`}
                    onClick={() => setUploadMethod("file")}
                  >
                    Upload File
                  </button>
                  <button
                    className={`${styles.tabBtn} ${uploadMethod === "paste" ? styles.active : ""}`}
                    onClick={() => setUploadMethod("paste")}
                  >
                    Paste JSON
                  </button>
                </div>

                <div style={{ marginTop: "16px" }}>
                  {uploadMethod === "file" ? (
                    <FileUpload onFile={handleFile} disabled={!mode} />
                  ) : (
                    <JsonPaste onPasteSubmit={handleFile} disabled={!mode} />
                  )}
                </div>

                {(validating || validationResult) && (
                  <div className={styles.validatorContainer}>
                    <JsonValidator
                      result={validationResult}
                      loading={validating}
                    />
                  </div>
                )}

                <div className={styles.wizardActions}>
                  <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                  </button>
                  <div className={styles.wizardActionsRight}>
                    <button
                      className="btn btn-primary"
                      onClick={nextStep}
                      disabled={!validationResult?.valid}
                    >
                      Next Step →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className={`card animate-fadeIn ${styles.stepCard}`}>
                <div className={styles.stepHeader}>
                  <div>
                    <h2 className={styles.stepTitle}>Name & Start</h2>
                    <p className={styles.stepDesc}>
                      Give your deck a name and begin your study session.
                    </p>
                  </div>
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
                </div>

                <div className={styles.wizardActions}>
                  <button className="btn btn-secondary" onClick={prevStep}>
                    ← Back
                  </button>
                  <div className={styles.wizardActionsRight}>
                    <button
                      id="btn-start-studying"
                      className={`btn btn-primary ${styles.saveButton}`}
                      onClick={handleSave}
                      disabled={saving || !canSave}
                    >
                      {saving ? "Starting…" : "Start Studying →"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
