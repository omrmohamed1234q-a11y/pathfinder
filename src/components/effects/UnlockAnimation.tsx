import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { SparkleEffect } from './SparkleEffect';

interface UnlockAnimationProps {
  onComplete?: () => void;
}

export const UnlockAnimation: React.FC<UnlockAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'shake' | 'break' | 'sparkle' | 'done'>('shake');

  useEffect(() => {
    // Shake for 300ms
    const shakeTimer = setTimeout(() => setStage('break'), 300);
    
    // Break for 200ms
    const breakTimer = setTimeout(() => setStage('sparkle'), 500);
    
    // Sparkle for 400ms
    const sparkleTimer = setTimeout(() => {
      setStage('done');
      onComplete?.();
    }, 900);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(breakTimer);
      clearTimeout(sparkleTimer);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      {stage === 'shake' && (
        <div className="animate-shake">
          <Lock className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      {stage === 'break' && (
        <div className="relative">
          {/* Lock pieces flying apart */}
          <div className="absolute animate-break-top-left">
            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
          </div>
          <div className="absolute animate-break-top-right">
            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
          </div>
          <div className="absolute animate-break-bottom-left">
            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
          </div>
          <div className="absolute animate-break-bottom-right">
            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
          </div>
        </div>
      )}
      
      {stage === 'sparkle' && (
        <SparkleEffect show={true} />
      )}
    </div>
  );
};
