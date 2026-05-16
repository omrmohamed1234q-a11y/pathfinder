import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2, Zap, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SkillTreeHeaderProps {
  topic: string;
  currentXP: number;
  totalXP: number;
  isFromScan?: boolean;
  onShare?: () => void;
  onPracticeQuiz?: () => void;
}

export const SkillTreeHeader: React.FC<SkillTreeHeaderProps> = ({
  topic,
  currentXP,
  totalXP,
  isFromScan = false,
  onShare,
  onPracticeQuiz,
}) => {
  const navigate = useNavigate();
  const [displayXP, setDisplayXP] = useState(currentXP);
  const progress = totalXP > 0 ? (currentXP / totalXP) * 100 : 0;

  useEffect(() => {
    if (displayXP === currentXP) return;
    const duration = 1000;
    const steps = 30;
    const increment = (currentXP - displayXP) / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayXP(currentXP);
        clearInterval(timer);
      } else {
        setDisplayXP((prev) => Math.round(prev + increment));
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [currentXP, displayXP]);

  return (
    <div 
      className="py-4 px-6" 
      style={{ 
        background: 'var(--duo-bg)', 
        borderBottom: '2px solid var(--duo-border)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
          style={{ 
            background: 'var(--duo-surface)',
            border: '2px solid var(--duo-border)',
          }}
        >
          <ArrowLeft className="h-5 w-5" style={{ color: 'var(--duo-text)' }} />
        </button>

        {/* Topic Name */}
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-black" style={{ color: 'var(--duo-text)' }}>{topic}</h1>
          {isFromScan && (
            <span 
              className="px-3 py-1 rounded-full text-xs font-extrabold"
              style={{ 
                background: 'rgba(73, 192, 248, 0.15)',
                color: 'var(--duo-blue)',
                border: '1px solid rgba(73, 192, 248, 0.3)',
              }}
            >
              📸 From scan
            </span>
          )}
        </div>

        {/* XP Counter + Actions */}
        <div className="flex items-center space-x-3">
          {onPracticeQuiz && (
            <button
              onClick={onPracticeQuiz}
              className="btn-duo btn-duo-primary px-4 py-2 text-sm"
            >
              <Brain className="h-4 w-4 mr-2" />
              Practice Quiz
            </button>
          )}
          
          {onShare && (
            <button
              onClick={onShare}
              className="btn-duo btn-duo-outline px-4 py-2 text-sm"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          )}
          
          {/* Progress bar */}
          <div className="w-32">
            <div className="progress-duo h-3">
              <div 
                className="progress-duo-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 font-black text-sm" style={{ color: 'var(--duo-green)' }}>
            <Zap className="h-4 w-4" />
            {displayXP}/{totalXP}
          </div>
        </div>
      </div>
    </div>
  );
};
