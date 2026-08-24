'use client';

import React, { useEffect, useState } from 'react';
import type { TTSSettings, SessionStyle, AudioPlaybackMode } from '@/types';
import { onVoicesChanged, speak, pause, resume, stop } from '@/lib/tts';
import { getSettings, saveTTSSettings } from '@/lib/localStorage';
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

  const updateTTS = (patch: Partial<TTSSettings>) => {
    const next = { ...ttsSettings, ...patch };
    setTTSSettings(next);
    saveTTSSettings(next);
  };

  const latestProps = React.useRef({ ttsSettings, canNext, onNext, onAudioEnd, autoplay, sessionStyle, isFlipped, frontText, backText });
  useEffect(() => {
    latestProps.current = { ttsSettings, canNext, onNext, onAudioEnd, autoplay, sessionStyle, isFlipped, frontText, backText };
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

  useEffect(() => {
    if (autoplay && (frontText || backText)) {
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

  return (
    <div className={styles.container}>
      {/* Session Style Selector */}
      <div className={styles.styleSelector}>
        {SESSION_STYLES.map((s) => (
          <button
            key={s.id}
            id={`style-${s.id}`}
            className={`btn btn-sm ${sessionStyle === s.id ? 'btn-primary' : 'btn-secondary'} ${styles.styleButton}`}
            onClick={() => onStyleChange(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={`divider ${styles.divider}`} />

      {/* Playback Controls */}
      <div className={styles.controlsRow}>
        {/* Prev / Play / Pause / Stop / Next */}
        <div className={styles.playbackButtons}>
          <button
            id="btn-prev"
            className="btn btn-secondary btn-icon"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Previous item"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          {speaking ? (
            <button
              id="btn-pause"
              className="btn btn-primary btn-icon-lg"
              onClick={handlePause}
              aria-label="Pause"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            </button>
          ) : (
            <button
              id="btn-play"
              className="btn btn-primary btn-icon-lg"
              onClick={handleSpeak}
              aria-label={paused ? 'Resume' : 'Play'}
            >
              {paused ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </button>
          )}

          <button
            id="btn-stop"
            className="btn btn-secondary btn-icon-lg"
            onClick={handleStop}
            aria-label="Stop"
            disabled={!(speaking || paused)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16"/>
            </svg>
          </button>

          <button
            id="btn-next"
            className="btn btn-secondary btn-icon"
            onClick={onNext}
            disabled={!canNext}
            aria-label="Next item"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* TTS Settings */}
        <div className={styles.settingsGroup}>
          {/* Speed */}
          <div className={styles.settingItem}>
            <span className={styles.settingLabelNoWrap}>Speed</span>
            <select
              id="tts-speed"
              className={`input ${styles.selectSpeed}`}
              value={ttsSettings.rate}
              onChange={(e) => updateTTS({ rate: parseFloat(e.target.value) })}
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}×</option>
              ))}
            </select>
          </div>

          {/* Audio Playback Mode */}
          <div className={styles.settingItem}>
            <span className={styles.settingLabelNoWrap}>Audio Mode</span>
            <select
              id="tts-audio-mode"
              className={`input ${styles.selectSpeed}`}
              value={ttsSettings.audioMode || 'continuous'}
              onChange={(e) => updateTTS({ audioMode: e.target.value as AudioPlaybackMode })}
            >
              <option value="continuous">Continuous</option>
              <option value="single-pause">Single (with pause)</option>
              <option value="switch">Switch Voices</option>
            </select>
          </div>

          {/* Voice */}
          {voices.length > 0 && (
            <>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>{ttsSettings.audioMode === 'switch' ? 'Voice 1' : 'Voice'}</span>
                <select
                  id="tts-voice"
                  className={`input ${styles.selectVoice}`}
                  value={ttsSettings.voiceURI}
                  onChange={(e) => updateTTS({ voiceURI: e.target.value })}
                >
                  {voices
                    .filter((v) => v.name === 'Google UK English Male' || v.name === 'Google UK English Female')
                    .map((v) => {
                      const label = v.name === 'Google UK English Male' ? 'UK Male' : 'UK Female';
                      return (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {label}
                        </option>
                      );
                    })}
                </select>
              </div>
              
              {ttsSettings.audioMode === 'switch' && (
                <div className={styles.settingItem}>
                  <span className={styles.settingLabel}>Voice 2</span>
                  <select
                    id="tts-voice-secondary"
                    className={`input ${styles.selectVoice}`}
                    value={ttsSettings.secondaryVoiceURI || ''}
                    onChange={(e) => updateTTS({ secondaryVoiceURI: e.target.value })}
                  >
                    <option value="">Same as Voice 1</option>
                    {voices
                      .filter((v) => v.name === 'Google UK English Male' || v.name === 'Google UK English Female')
                      .map((v) => {
                        const label = v.name === 'Google UK English Male' ? 'UK Male' : 'UK Female';
                        return (
                          <option key={`sec-${v.voiceURI}`} value={v.voiceURI}>
                            {label}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Mute Voice */}
          <label className={styles.checkboxLabel}>
            <input
              id="toggle-mute"
              type="checkbox"
              checked={ttsSettings.muted || false}
              onChange={(e) => updateTTS({ muted: e.target.checked })}
              className={styles.toggleSwitch}
            />
            Mute Voice
          </label>

          {/* Autoplay */}
          <label className={styles.checkboxLabel}>
            <input
              id="toggle-autoplay"
              type="checkbox"
              checked={autoplay}
              onChange={(e) => onAutoplayChange(e.target.checked)}
              className={styles.toggleSwitch}
            />
            Autoplay
          </label>

          {/* Shuffle */}
          <label className={styles.checkboxLabel}>
            <input
              id="toggle-shuffle"
              type="checkbox"
              checked={shuffle}
              onChange={(e) => onShuffleChange(e.target.checked)}
              className={styles.toggleSwitch}
            />
            Shuffle
          </label>
        </div>
      </div>
    </div>
  );
}
