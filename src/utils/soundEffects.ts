// Pathfinder Sound Effects System — Lightweight Web Audio API
import { isSoundEnabled } from './progressStorage';

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio not available
  }
};

const playSequence = (notes: { freq: number; time: number; dur: number }[], type: OscillatorType = 'sine') => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur);
    });
  } catch (e) {
    // Silently fail
  }
};

/** Bright ascending chime — quiz correct answer */
export const playCorrectSound = () => {
  playSequence([
    { freq: 523.25, time: 0, dur: 0.15 },     // C5
    { freq: 659.25, time: 0.1, dur: 0.15 },    // E5
    { freq: 783.99, time: 0.2, dur: 0.3 },      // G5
  ], 'sine');
};

/** Soft low buzz — quiz wrong answer */
export const playWrongSound = () => {
  playSequence([
    { freq: 200, time: 0, dur: 0.15 },
    { freq: 180, time: 0.1, dur: 0.2 },
  ], 'square');
};

/** Triumphant fanfare — level up */
export const playLevelUpSound = () => {
  playSequence([
    { freq: 523.25, time: 0, dur: 0.12 },
    { freq: 659.25, time: 0.1, dur: 0.12 },
    { freq: 783.99, time: 0.2, dur: 0.12 },
    { freq: 1046.5, time: 0.3, dur: 0.5 },
  ], 'sine');
};

/** Magical whoosh — node unlock */
export const playUnlockSound = () => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Silently fail
  }
};

/** Click feedback */
export const playClickSound = () => {
  playTone(800, 0.05, 'sine', 0.08);
};

/** Achievement unlocked */
export const playAchievementSound = () => {
  playSequence([
    { freq: 587.33, time: 0, dur: 0.15 },
    { freq: 739.99, time: 0.12, dur: 0.15 },
    { freq: 880, time: 0.24, dur: 0.15 },
    { freq: 1174.66, time: 0.36, dur: 0.5 },
  ], 'sine');
};

/** Completion celebration */
export const playCompletionSound = () => {
  playSequence([
    { freq: 523.25, time: 0, dur: 0.2 },
    { freq: 659.25, time: 0.15, dur: 0.2 },
    { freq: 783.99, time: 0.3, dur: 0.2 },
    { freq: 1046.5, time: 0.45, dur: 0.2 },
    { freq: 1318.5, time: 0.6, dur: 0.5 },
  ], 'sine');
};

// Legacy exports for backward compatibility
export const playCorrectAnswer = playCorrectSound;
export const playWrongAnswer = playWrongSound;
export const playLevelUp = playLevelUpSound;
export const playNodeUnlock = playUnlockSound;
export const playButtonClick = playClickSound;
export const playAchievementUnlock = playAchievementSound;
export const playTreeComplete = playCompletionSound;

export const initAudioContext = (): void => {
  try {
    getAudioContext();
  } catch (error) {
    console.error('Failed to initialize audio context:', error);
  }
};

export const setSoundEnabled = (enabled: boolean): void => {
  localStorage.setItem('pathfinder_sound_enabled', String(enabled));
};

export const getSoundEnabled = (): boolean => {
  return isSoundEnabled();
};

/** Generic playSound function for easy use in components */
export const playSound = (soundType: 'click' | 'success' | 'error' | 'levelUp' | 'unlock' | 'achievement' | 'completion'): void => {
  switch (soundType) {
    case 'click':
      playClickSound();
      break;
    case 'success':
      playCorrectSound();
      break;
    case 'error':
      playWrongSound();
      break;
    case 'levelUp':
      playLevelUpSound();
      break;
    case 'unlock':
      playUnlockSound();
      break;
    case 'achievement':
      playAchievementSound();
      break;
    case 'completion':
      playCompletionSound();
      break;
    default:
      playClickSound();
  }
};
