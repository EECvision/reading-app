'use client';

import React, { useEffect, useState } from 'react';
import type { TTSSettings, SessionStyle, AudioPlaybackMode, TTSEngine } from '@/types';
import { onVoicesChanged, speak, pause, resume, stop } from '@/lib/tts';
import { getSettings, saveTTSSettings } from '@/lib/localStorage';
import { EDGE_VOICES } from '@/lib/edgeTts';
import styles from './SessionControls.module.css';

interface SessionControlsProps {
  frontText: string;
  backText: string;
  isFlipped: boolean;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  autoplay: boolean;
  onAutoplayChange: (v: boolean) => void;
  shuffle: boolean;
  onShuffleChange: (v: boolean) => void;
  repeat: boolean;
  onRepeatChange: (v: boolean) => void;
  sessionStyle: SessionStyle;
  onStyleChange: (s: SessionStyle) => void;
  onAudioEnd?: () => void;
}

const SESSION_STYLES: { id: SessionStyle; label: string }[] = [
  { id: 'read-and-listen', label: 'Read + Listen' },
  { id: 'card-flip',       label: 'Card Flip' },
];

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function SessionControls({
  frontText,
  backText,
  isFlipped,
  onPrev,
  onNext,
  canPrev,
  canNext,
  autoplay,
  onAutoplayChange,
  shuffle,
  onShuffleChange,
  repeat,
  onRepeatChange,
  sessionStyle,
  onStyleChange,
  onAudioEnd,
}: SessionControlsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsSettings, setTTSSettings] = useState<TTSSettings>(() => getSettings().tts);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  // Subscribe to voice list changes (voices load asynchronously in browsers)
  useEffect(() => {
    return onVoicesChanged(setVoices);
  }, []);

  const playSequenceId = React.useRef(0);
  // True once the user has manually pressed Play for the first time.
  // Prevents audio from auto-starting as soon as the session loads.
  const hasUserStarted = React.useRef(false);
  // Snapshot of previous TTS settings — used to detect which settings changed.
  const prevTTSSettings = React.useRef(ttsSettings);

  const updateTTS = (patch: Partial<TTSSettings>) => {
    const next = { ...ttsSettings, ...patch };
    setTTSSettings(next);
    saveTTSSettings(next);
  };

  // Set a sensible default voice if none is selected (first load).
  // Prefer Google UK voices if available (Chrome/Edge), otherwise fall back to
  // the first English voice in the list (ensures Firefox isn't left with nothing).
  useEffect(() => {
    if (voices.length > 0 && !ttsSettings.voiceURI) {
      const preferred = voices.find(v => v.name === 'Google UK English Female' || v.name === 'Google UK English Male');
      const defaultVoice = preferred ?? voices[0];
      if (defaultVoice) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        updateTTS({ voiceURI: defaultVoice.voiceURI });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voices, ttsSettings.voiceURI]);

  const latestProps = React.useRef({ ttsSettings, canNext, onNext, onAudioEnd, autoplay, sessionStyle, isFlipped, frontText, backText, repeat, speaking });
  useEffect(() => {
    latestProps.current = { ttsSettings, canNext, onNext, onAudioEnd, autoplay, sessionStyle, isFlipped, frontText, backText, repeat, speaking };
  });

  const runSequence = (seqId: number) => {
    const p = latestProps.current;
    
    if (p.sessionStyle === 'card-flip') {
      const textToRead = p.isFlipped ? p.backText : p.frontText;
      speak({
        text: textToRead,
        settings: p.ttsSettings,
        onStart: () => { if (playSequenceId.current === seqId) { setSpeaking(true); setPaused(false); } },
        onEnd: () => {
          if (playSequenceId.current !== seqId) return;
          setSpeaking(false);
          setPaused(false);
          if (p.onAudioEnd) p.onAudioEnd();
          // We intentionally don't auto-next on card flip completion as per previous user request
        },
      });
      return;
    }

    // read-and-listen mode
    const mode = p.ttsSettings.audioMode || 'continuous';

    if (mode === 'continuous') {
      speak({
        text: `${p.frontText}. ${p.backText}`,
        settings: p.ttsSettings,
        onStart: () => { if (playSequenceId.current === seqId) { setSpeaking(true); setPaused(false); } },
        onEnd: () => {
          if (playSequenceId.current !== seqId) return;
          setSpeaking(false);
          setPaused(false);
          if (p.onAudioEnd) p.onAudioEnd();
          if (p.autoplay && p.canNext) p.onNext();
        },
      });
    } else if (mode === 'single-pause') {
      speak({
        text: p.frontText,
        settings: p.ttsSettings,
        onStart: () => { if (playSequenceId.current === seqId) { setSpeaking(true); setPaused(false); } },
        onEnd: () => {
          if (playSequenceId.current !== seqId) return;
          setTimeout(() => {
            if (playSequenceId.current !== seqId) return;
            speak({
              text: p.backText,
              settings: p.ttsSettings,
              onEnd: () => {
                if (playSequenceId.current !== seqId) return;
                setSpeaking(false);
                setPaused(false);
                if (p.onAudioEnd) p.onAudioEnd();
                if (p.autoplay && p.canNext) p.onNext();
              }
            });
          }, 1500); // 1.5s pause
        },
      });
    } else if (mode === 'switch') {
      speak({
        text: p.frontText,
        settings: p.ttsSettings,
        onStart: () => { if (playSequenceId.current === seqId) { setSpeaking(true); setPaused(false); } },
        onEnd: () => {
          if (playSequenceId.current !== seqId) return;
          speak({
            text: p.backText,
            settings: { ...p.ttsSettings, voiceURI: p.ttsSettings.secondaryVoiceURI || p.ttsSettings.voiceURI },
            onEnd: () => {
              if (playSequenceId.current !== seqId) return;
              setSpeaking(false);
              setPaused(false);
              if (p.onAudioEnd) p.onAudioEnd();
              if (p.autoplay && p.canNext) p.onNext();
            }
          });
        },
      });
    }
  };

  // ── Restart audio when TTS settings change while speaking ───────────────────
  // Compares relevant fields against the previous snapshot so that changes to
  // voice, speed, engine, or audio-mode take effect immediately without the
  // user needing to manually stop and press Play again.
  useEffect(() => {
    const prev = prevTTSSettings.current;
    prevTTSSettings.current = ttsSettings;

    const audioAffected =
      prev.rate        !== ttsSettings.rate        ||
      prev.edgeVoice   !== ttsSettings.edgeVoice   ||
      prev.voiceURI    !== ttsSettings.voiceURI     ||
      prev.ttsEngine   !== ttsSettings.ttsEngine    ||
      prev.audioMode   !== ttsSettings.audioMode    ||
      prev.muted       !== ttsSettings.muted;

    if (audioAffected && latestProps.current.speaking && hasUserStarted.current) {
      stop();
      const seqId = ++playSequenceId.current;
      setSpeaking(false);
      setPaused(false);
      // Small delay lets the state settle before starting the new sequence
      setTimeout(() => runSequence(seqId), 80);
    }
  }, [ttsSettings]);


  // ── Auto-advance when text changes (card navigation + autoplay) ───────────
  // Only fires once the user has manually pressed Play at least once, so the
  // session doesn't start talking the moment it loads.
  useEffect(() => {
    if (autoplay && hasUserStarted.current && (frontText || backText)) {
      const timer = setTimeout(() => {
        stop();
        const seqId = ++playSequenceId.current;
        runSequence(seqId);
      }, 100);
      return () => {
        clearTimeout(timer);
        stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        playSequenceId.current++; // invalidate sequence
        setSpeaking(false);
        setPaused(false);
      };
    }
  }, [frontText, backText, isFlipped, autoplay, sessionStyle]);

  const handleSpeak = () => {
    // Mark that the user has intentionally started playback.
    // The autoplay effect won't fire until this is true.
    hasUserStarted.current = true;

    if (paused) {
      resume();
      setPaused(false);
      setSpeaking(true);
      return;
    }
    stop();
    const seqId = ++playSequenceId.current;
    runSequence(seqId);
  };

  const handlePause = () => {
    pause();
    setPaused(true);
    setSpeaking(false);
  };

  const handleStop = () => {
    stop();
    playSequenceId.current++; // invalidate sequence
    setSpeaking(false);
    setPaused(false);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Close the settings drawer when the user clicks outside the control panel
  const containerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSettingsOpen]);

  return (
    <div ref={containerRef} className={styles.dockedContainer}>
      <div className={styles.primaryControls}>
        {/* Top row: Settings button and Segmented Control */}
        <div className={styles.topRow}>
          <button
            className={`btn btn-secondary btn-icon ${isSettingsOpen ? styles.activeSettingBtn : ''}`}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="Toggle Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>

          <div className={styles.segmentedControl}>
            {SESSION_STYLES.map((s) => (
              <button
                key={s.id}
                id={`style-${s.id}`}
                className={`${styles.segment} ${sessionStyle === s.id ? styles.segmentActive : ''}`}
                onClick={() => onStyleChange(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            id="btn-stop"
            className="btn btn-secondary btn-icon"
            onClick={handleStop}
            aria-label="Reload"
            disabled={!(speaking || paused)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>

        {/* Playback Controls Row */}
        <div className={styles.playbackRow}>
          <button
            id="btn-prev"
            className={styles.playControlBtn}
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Previous item"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          {speaking ? (
            <button
              id="btn-pause"
              className={styles.mainPlayBtn}
              onClick={handlePause}
              aria-label="Pause"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            </button>
          ) : (
            <button
              id="btn-play"
              className={styles.mainPlayBtn}
              onClick={handleSpeak}
              aria-label={paused ? 'Resume' : 'Play'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 4 }}>
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
          )}

          <button
            id="btn-next"
            className={styles.playControlBtn}
            onClick={onNext}
            disabled={!canNext}
            aria-label="Next item"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible Settings Panel */}
      <div className={`${styles.settingsDrawer} ${isSettingsOpen ? styles.settingsOpen : ''}`}>
        <div className={styles.settingsDrawerInner}>

          {/* Voice Engine selector */}
          <div className={styles.listRow}>
            <span className={styles.listLabel}>Voice Engine</span>
            <select
              id="tts-engine"
              className={`input ${styles.nativeSelect}`}
              value={ttsSettings.ttsEngine ?? 'edge'}
              onChange={(e) => updateTTS({ ttsEngine: e.target.value as TTSEngine })}
            >
              <option value="edge">Edge AI Voice</option>
              <option value="webspeech">Device Voice</option>
            </select>
          </div>

          {/* Edge voice selector — only when Edge engine is active */}
          {(ttsSettings.ttsEngine ?? 'edge') === 'edge' && (
            <div className={styles.listRow}>
              <span className={styles.listLabel}>Voice</span>
              <select
                id="tts-edge-voice"
                className={`input ${styles.nativeSelect}`}
                value={ttsSettings.edgeVoice ?? 'en-US-AriaNeural'}
                onChange={(e) => updateTTS({ edgeVoice: e.target.value })}
              >
                {EDGE_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className={styles.listRow}>
            <span className={styles.listLabel}>Speed</span>
            <select
              id="tts-speed"
              className={`input ${styles.nativeSelect}`}
              value={ttsSettings.rate}
              onChange={(e) => updateTTS({ rate: parseFloat(e.target.value) })}
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}×</option>
              ))}
            </select>
          </div>          {/* Audio mode + Device voice selectors — only for Web Speech */}
          {(ttsSettings.ttsEngine ?? 'edge') === 'webspeech' && (
            <>
              <div className={styles.listRow}>
                <span className={styles.listLabel}>Audio Mode</span>
                <select
                  id="tts-audio-mode"
                  className={`input ${styles.nativeSelect}`}
                  value={ttsSettings.audioMode || 'continuous'}
                  onChange={(e) => updateTTS({ audioMode: e.target.value as AudioPlaybackMode })}
                >
                  <option value="continuous">Continuous</option>
                  <option value="single-pause">Single (pause)</option>
                  <option value="switch">Switch Voices</option>
                </select>
              </div>

              {voices.length > 0 && (
                <>
                  <div className={styles.listRow}>
                    <span className={styles.listLabel}>{ttsSettings.audioMode === 'switch' ? 'Voice 1' : 'Voice'}</span>
                    <select
                      id="tts-voice"
                      className={`input ${styles.nativeSelect}`}
                      value={ttsSettings.voiceURI}
                      onChange={(e) => updateTTS({ voiceURI: e.target.value })}
                    >
                      {/* Show all available English voices — no Google-UK filter so Firefox
                          users see the voices their OS provides rather than an empty list */}
                      {voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  {ttsSettings.audioMode === 'switch' && (
                    <div className={styles.listRow}>
                      <span className={styles.listLabel}>Voice 2</span>
                      <select
                        id="tts-voice-secondary"
                        className={`input ${styles.nativeSelect}`}
                        value={ttsSettings.secondaryVoiceURI || ''}
                        onChange={(e) => updateTTS({ secondaryVoiceURI: e.target.value })}
                      >
                        <option value="">Same as Voice 1</option>
                        {voices.map((v) => (
                          <option key={`sec-${v.voiceURI}`} value={v.voiceURI}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </>
          )}  <label className={styles.listRow}>
            <span className={styles.listLabel}>Mute Voice</span>
            <input
              id="toggle-mute"
              type="checkbox"
              checked={ttsSettings.muted || false}
              onChange={(e) => updateTTS({ muted: e.target.checked })}
              className={styles.toggleSwitch}
            />
          </label>

          <label className={styles.listRow}>
            <span className={styles.listLabel}>Autoplay</span>
            <input
              id="toggle-autoplay"
              type="checkbox"
              checked={autoplay}
              onChange={(e) => onAutoplayChange(e.target.checked)}
              className={styles.toggleSwitch}
            />
          </label>

          <label className={styles.listRow}>
            <span className={styles.listLabel}>Shuffle</span>
            <input
              id="toggle-shuffle"
              type="checkbox"
              checked={shuffle}
              onChange={(e) => onShuffleChange(e.target.checked)}
              className={styles.toggleSwitch}
            />
          </label>

          <label className={styles.listRow}>
            <span className={styles.listLabel}>Repeat</span>
            <input
              id="toggle-repeat"
              type="checkbox"
              checked={repeat}
              onChange={(e) => onRepeatChange(e.target.checked)}
              className={styles.toggleSwitch}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
