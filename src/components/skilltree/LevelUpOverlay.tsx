import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playLevelUpSound } from '@/utils/soundEffects';

interface LevelUpOverlayProps {
  level: number;
  isVisible: boolean;
  onComplete: () => void;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ level, isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      playLevelUpSound();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 }, colors: ['#00D4FF', '#8B5CF6', '#FBBF24'] });
      const timer = setTimeout(() => onComplete(), 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center animate-level-up">
        <div className="relative">
          <h2 className="text-8xl font-bold gradient-text">Level {level}</h2>
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/30 to-secondary/30 -z-10" />
        </div>
        <p className="text-4xl mt-4">⬆️ Level Up!</p>
      </div>
    </div>
  );
};
