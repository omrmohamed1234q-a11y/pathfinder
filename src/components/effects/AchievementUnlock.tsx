import React, { useEffect, useState } from 'react';
import { Award, Star } from 'lucide-react';
import { SparkleEffect } from './SparkleEffect';

interface AchievementUnlockProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onComplete?: () => void;
}

export const AchievementUnlock: React.FC<AchievementUnlockProps> = ({
  title,
  description,
  icon,
  onComplete,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce-in">
      <div 
        className="relative px-6 py-4 rounded-xl shadow-2xl max-w-sm"
        style={{
          background: 'linear-gradient(135deg, var(--duo-purple) 0%, var(--duo-blue) 100%)',
        }}
      >
        {/* Sparkle effect */}
        <div className="absolute -top-2 -right-2">
          <SparkleEffect show={true} />
        </div>
        
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            {icon || <Award className="h-6 w-6 text-white" />}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                Achievement Unlocked
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-white/90">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
