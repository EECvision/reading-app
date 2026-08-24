'use client';

import React, { useEffect, useState } from 'react';
import type { TTSSettings, SessionStyle } from '@/types';
import { onVoicesChanged, speak, pause, resume, stop } from '@/lib/tts';
import { getSettings, saveTTSSettings } from '@/lib/localStorage';
import styles from './SessionControls.module.css';

interface SessionControlsProps {
  currentText: string;       // text to speak for current item
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
  currentText,
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

  const updateTTS = (patch: Partial<TTSSettings>) => {
    const next = { ...ttsSettings, ...patch };
    setTTSSettings(next);
    saveTTSSettings(next);
  };

  const latestProps = React.useRef({ ttsSettings, canNext, onNext, onAudioEnd, autoplay, sessionStyle });
  useEffect(() => {
    latestProps.current = { ttsSettings, canNext, onNext, onAudioEnd, autoplay, sessionStyle };
  });

  useEffect(() => {
    if (autoplay && currentText) {
      const timer = setTimeout(() => {
        stop();
        speak({
          text: currentText,
          settings: latestProps.current.ttsSettings,
          onStart: () => { setSpeaking(true); setPaused(false); },
          onEnd: () => {
            setSpeaking(false);
            setPaused(false);
            const p = latestProps.current;
            if (p.onAudioEnd) p.onAudioEnd();
            if (p.autoplay && p.canNext && p.sessionStyle !== 'card-flip') p.onNext();
          },
        });
      }, 100);
      return () => {
        clearTimeout(timer);
        stop();
        setSpeaking(false);
        setPaused(false);
      };
    }
  }, [currentText, autoplay]);

  const handleSpeak = () => {
    if (paused) {
      resume();
      setPaused(false);
      setSpeaking(true);
      return;
    }
    speak({
      text: currentText,
      settings: ttsSettings,
      onStart: () => { setSpeaking(true); setPaused(false); },
      onEnd: () => {
        setSpeaking(false);
        setPaused(false);
        if (onAudioEnd) onAudioEnd();
        if (autoplay && canNext && sessionStyle !== 'card-flip') onNext();
      },
    });
  };

  const handlePause = () => {
    pause();
    setPaused(true);
    setSpeaking(false);
  };

  const handleStop = () => {
    stop();
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

          {/* Voice */}
          {voices.length > 0 && (
            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>Voice</span>
              <select
                id="tts-voice"
                className={`input ${styles.selectVoice}`}
                value={ttsSettings.voiceURI}
                onChange={(e) => updateTTS({ voiceURI: e.target.value })}
              >
                {voices
                  .filter((v) => v.name === 'Google UK English Male' || v.name === 'Google UK English Female')
                  .map((v) => {
                    const label = v.name === 'Google UK English Male' ? 'Male voice' : 'Female voice';
                    return (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {label}
                      </option>
                    );
                  })}
              </select>
            </div>
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
