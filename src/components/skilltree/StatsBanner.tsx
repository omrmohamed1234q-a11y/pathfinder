import React, { useEffect, useState } from 'react';
import { Zap, Target, Trophy, Star } from 'lucide-react';
import { CountUpAnimation } from '@/components/effects/CountUpAnimation';

interface StatsBannerProps {
  level: number;
  completedNodes: number;
  totalNodes: number;
  currentXP: number;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ level, completedNodes, totalNodes, currentXP }) => {
  const progress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;
  const [prevXP, setPrevXP] = useState(currentXP);
  const [showXPAnimation, setShowXPAnimation] = useState(false);

  useEffect(() => {
    if (currentXP > prevXP) {
      setShowXPAnimation(true);
    }
    setPrevXP(currentXP);
  }, [currentXP, prevXP]);

  return (
    <div className="card-duo rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between gap-6">
        {/* Level */}
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ 
              background: 'var(--duo-gold)',
              boxShadow: '0 4px 0 var(--duo-gold-dark)',
            }}
          >
            <Star className="h-6 w-6 text-white fill-white" />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--duo-text-muted)' }}>Level</p>
            <p className="text-2xl font-black" style={{ color: 'var(--duo-gold)' }}>{level}</p>
          </div>
        </div>

        <div className="w-px h-12" style={{ background: 'var(--duo-border)' }} />

        {/* Progress */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: 'var(--duo-green)' }} />
              <span className="text-sm font-extrabold" style={{ color: 'var(--duo-text)' }}>Nodes</span>
            </div>
            <span className="text-sm font-black" style={{ color: 'var(--duo-text)' }}>{completedNodes}/{totalNodes}</span>
          </div>
          <div className="progress-duo">
            <div 
              className="progress-duo-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="w-px h-12" style={{ background: 'var(--duo-border)' }} />

        {/* XP */}
        <div className="flex items-center gap-3">
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center ${showXPAnimation ? 'animate-xp-pulse' : ''}`}
            style={{ 
              background: 'var(--duo-blue)',
              boxShadow: '0 4px 0 var(--duo-blue-dark)',
            }}
            onAnimationEnd={() => setShowXPAnimation(false)}
          >
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--duo-text-muted)' }}>XP</p>
            <p className="text-2xl font-black" style={{ color: 'var(--duo-blue)' }}>
              {showXPAnimation ? (
                <CountUpAnimation 
                  from={prevXP} 
                  to={currentXP} 
                  duration={600}
                  onComplete={() => setShowXPAnimation(false)}
                />
              ) : (
                currentXP
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
