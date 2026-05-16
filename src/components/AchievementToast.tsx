import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { Confetti } from './Confetti';

interface AchievementToastProps {
  achievement: {
    icon: string;
    title: string;
    description: string;
  } | null;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setShowConfetti(true);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out animation
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <>
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div 
        className={`fixed top-24 right-6 z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
        }`}
      >
        <div className="glass-strong rounded-2xl p-6 border-2 border-primary shadow-2xl glow-cyan max-w-sm">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl flex-shrink-0 animate-bounce">
              {achievement.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase text-primary">Achievement Unlocked!</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="glass rounded-full p-1.5 hover:bg-destructive/20 transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
