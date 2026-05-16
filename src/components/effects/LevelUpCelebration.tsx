import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap } from 'lucide-react';
import { ConfettiEffect } from './ConfettiEffect';

interface LevelUpCelebrationProps {
  level: number;
  onComplete?: () => void;
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({ level, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Flash effect */}
      <div className="absolute inset-0 bg-white animate-flash" />
      
      {/* Confetti */}
      <ConfettiEffect trigger={true} />
      
      {/* Level up message */}
      <div className="relative z-10 animate-bounce-in">
        <div 
          className="px-12 py-8 rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--duo-green) 0%, var(--duo-blue) 100%)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-white fill-white animate-spin-slow" />
              <Trophy className="h-12 w-12 text-white fill-white" />
              <Star className="h-8 w-8 text-white fill-white animate-spin-slow" />
            </div>
            
            <div className="text-center">
              <h2 className="text-4xl font-black text-white mb-2">
                LEVEL UP!
              </h2>
              <p className="text-2xl font-bold text-white/90">
                Level {level}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-300 fill-yellow-300" />
              <span className="text-lg font-bold text-white">
                Keep going!
              </span>
              <Zap className="h-6 w-6 text-yellow-300 fill-yellow-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
