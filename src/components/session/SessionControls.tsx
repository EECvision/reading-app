'use client';

import { useEffect, useState } from 'react';
import type { TTSSettings, SessionStyle } from '@/types';
import { onVoicesChanged, speak, pause, resume, stop } from '@/lib/tts';
import { getSettings, saveTTSSettings } from '@/lib/localStorage';

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
}

const SESSION_STYLES: { id: SessionStyle; label: string }[] = [
  { id: 'card-flip',       label: 'Card Flip' },
  { id: 'tts-listen',      label: 'Listen Only' },
  { id: 'read-and-listen', label: 'Read + Listen' },
  { id: 'audio-first',     label: 'Audio First' },
  { id: 'study-session',   label: 'Study Session' },
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
        if (autoplay && canNext) onNext();
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
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-4) var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      {/* Session Style Selector */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {SESSION_STYLES.map((s) => (
          <button
            key={s.id}
            id={`style-${s.id}`}
            className={`btn btn-sm ${sessionStyle === s.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onStyleChange(s.id)}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* Playback Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        {/* Prev / Play / Pause / Stop / Next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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

          {(speaking || paused) && (
            <button
              id="btn-stop"
              className="btn btn-secondary btn-icon"
              onClick={handleStop}
              aria-label="Stop"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16"/>
              </svg>
            </button>
          )}

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {/* Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Speed</span>
            <select
              id="tts-speed"
              className="input"
              style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', width: 'auto' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Voice</span>
              <select
                id="tts-voice"
                className="input"
                style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', maxWidth: '140px' }}
                value={ttsSettings.voiceURI}
                onChange={(e) => updateTTS({ voiceURI: e.target.value })}
              >
                <option value="">Default</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Autoplay */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <input
              id="toggle-autoplay"
              type="checkbox"
              checked={autoplay}
              onChange={(e) => onAutoplayChange(e.target.checked)}
              style={{ accentColor: 'var(--brand-400)' }}
            />
            Autoplay
          </label>

          {/* Shuffle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <input
              id="toggle-shuffle"
              type="checkbox"
              checked={shuffle}
              onChange={(e) => onShuffleChange(e.target.checked)}
              style={{ accentColor: 'var(--brand-400)' }}
            />
            Shuffle
          </label>
        </div>
      </div>
    </div>
  );
}
