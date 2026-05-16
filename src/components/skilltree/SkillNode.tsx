import React, { useState, useRef, useEffect } from 'react';
import { Lock, CheckCircle2, Play, Crown, Star, Zap } from 'lucide-react';
import type { SkillNode as SkillNodeType } from '@/types/skilltree';
import { getIconForTopic, getIconForContentType } from '@/utils/iconMapping';
import { haptics } from '@/utils/haptics';
import { UnlockAnimation } from '@/components/effects/UnlockAnimation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SkillNodeProps {
  node: SkillNodeType;
  onClick?: () => void;
  style?: React.CSSProperties;
  topic?: string;
}

// SVG Ring progress around the node
const ProgressRing: React.FC<{ size: number; progress: number; color: string }> = ({ size, progress, color }) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg
      className="absolute inset-0 -rotate-90 pointer-events-none"
      width={size}
      height={size}
      style={{ zIndex: 1 }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      {progress > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      )}
    </svg>
  );
};

export const SkillNode: React.FC<SkillNodeProps> = ({ node, onClick, style, topic }) => {
  const isLocked = node.status === 'locked';
  const isUnlocked = node.status === 'unlocked';
  const isCompleted = node.status === 'completed';
  const isBonus = node.isBonusNode || node.isOptional;

  // Determine node appearance
  const shape = node.shape || 'circle';
  const size = node.size || 'medium';
  const variant = node.variant || 'standard';

  // Long-press preview state
  const [showPreview, setShowPreview] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);

  // Unlock animation state
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const prevStatusRef = useRef(node.status);

  // XP popup state
  const [showXPPopup, setShowXPPopup] = useState(false);

  // Detect when node unlocks
  useEffect(() => {
    if (prevStatusRef.current === 'locked' && node.status === 'unlocked') {
      setShowUnlockAnimation(true);
      setJustUnlocked(true);
      haptics.success();
    }
    // Detect completion for XP popup
    if (prevStatusRef.current === 'unlocked' && node.status === 'completed') {
      setShowXPPopup(true);
      setTimeout(() => setShowXPPopup(false), 1500);
    }
    prevStatusRef.current = node.status;
  }, [node.status]);

  const handleClick = () => {
    if (isUnlocked || isCompleted) {
      haptics.tap();
      onClick?.();
    }
  };

  // Handle long-press for preview
  const handlePointerDown = () => {
    if (!(isUnlocked || isCompleted)) return;
    
    longPressTimerRef.current = window.setTimeout(() => {
      haptics.longPress();
      setShowPreview(true);
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setShowPreview(false);
  };

  // Get preview content
  const getPreviewContent = () => {
    const parts = [];
    
    if (node.xp) parts.push(`${node.xp} XP`);
    if (node.variant) {
      const variantLabels: Record<string, string> = {
        checkpoint: '🏁 Checkpoint',
        boss: '⚔️ Boss Challenge',
        story: '📖 Story',
        practice: '💪 Practice',
        legendary: '👑 Legendary',
      };
      parts.push(variantLabels[node.variant] || '');
    }
    if (node.difficulty) parts.push(`Difficulty: ${node.difficulty}`);
    
    return parts.join(' • ');
  };

  // Progress ring sizing
  const ringSize = size === 'xl' ? 110 : size === 'large' ? 90 : size === 'small' ? 60 : 72;
  const nodeProgress = isCompleted ? 1 : isUnlocked ? 0.1 : 0;
  const ringColor = isCompleted ? 'var(--duo-green)' : 'var(--duo-gold)';

  return (
    <TooltipProvider>
      <div
        className="flex flex-col items-center gap-2"
        style={{ width: size === 'xl' ? '130px' : size === 'large' ? '110px' : size === 'small' ? '80px' : '120px', ...style }}
      >
        {/* The Node Button */}
        <Tooltip open={showPreview} onOpenChange={setShowPreview}>
          <TooltipTrigger asChild>
            <button
              className={`
                skill-node-button relative flex items-center justify-center
                transition-all duration-200 outline-none
                node-shape-${shape}
                node-size-${size}
                ${variant !== 'standard' ? `node-variant-${variant}` : ''}
                ${isCompleted ? 'node-completed' : ''}
                ${isUnlocked ? 'node-unlocked' : ''}
                ${isLocked ? 'node-locked' : ''}
                ${justUnlocked ? 'animate-unlock-glow' : ''}
              `}
              onClick={handleClick}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              disabled={isLocked}
              aria-label={`${node.title} - ${node.status}${isBonus ? ' (Bonus)' : ''}`}
              style={{
                // Ensure minimum touch target size on mobile
                minWidth: '48px',
                minHeight: '48px',
              }}
              onAnimationEnd={() => setJustUnlocked(false)}
            >
              {/* Progress ring around node */}
              {!isLocked && shape === 'circle' && (
                <ProgressRing size={ringSize} progress={nodeProgress} color={ringColor} />
              )}

              {/* Unlock animation overlay */}
              {showUnlockAnimation && (
                <UnlockAnimation onComplete={() => setShowUnlockAnimation(false)} />
              )}

              {/* XP popup */}
              {showXPPopup && (
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 animate-float-up pointer-events-none z-20"
                  style={{
                    color: 'var(--duo-gold)',
                    fontWeight: 900,
                    fontSize: '14px',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  +{node.xp} XP ⚡
                </div>
              )}

              {/* Crown for completed */}
              {isCompleted && (
                <div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                  style={{ color: 'var(--duo-gold)' }}
                >
                  <Crown className="h-5 w-5 fill-current" />
                </div>
              )}

              {/* Icon */}
              {isLocked ? (
                <Lock className="h-7 w-7" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <Play className="h-7 w-7 fill-current ml-0.5" />
              )}
              
              {/* Bonus badge */}
              {isBonus && !isLocked && (
                <div 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs z-10"
                  style={{ 
                    background: 'var(--duo-purple)',
                    boxShadow: '0 2px 0 var(--duo-purple-dark)',
                  }}
                >
                  <Star className="h-3 w-3 text-white fill-white" />
                </div>
              )}

              {/* Shimmer on unlocked */}
              {isUnlocked && (
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <div className="shimmer absolute inset-0" />
                </div>
              )}
            </button>
          </TooltipTrigger>
          {(isUnlocked || isCompleted) && (
            <TooltipContent
              className="rounded-xl px-4 py-3"
              style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)', color: 'var(--duo-text)' }}
            >
              <div className="text-sm">
                <p className="font-extrabold">{node.title}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: 'var(--duo-text-muted)' }}>{getPreviewContent()}</p>
                <p className="text-[10px] font-bold mt-1.5" style={{ color: 'var(--duo-green)' }}>Tap to open</p>
              </div>
            </TooltipContent>
          )}
        </Tooltip>

        {/* Title */}
        <span 
        className="text-xs font-extrabold text-center leading-tight line-clamp-2"
        style={{ 
          color: isLocked ? 'var(--duo-text-muted)' : 'var(--duo-text)',
          opacity: isLocked ? 0.5 : 1,
        }}
      >
        {node.title}
      </span>

      {/* XP badge */}
      <span 
        className="text-[10px] font-black flex items-center gap-1"
        style={{ 
          color: isCompleted ? 'var(--duo-green)' : isUnlocked ? 'var(--duo-gold)' : 'var(--duo-text-muted)',
          opacity: isLocked ? 0.4 : 1,
        }}
      >
        <Zap className="h-3 w-3" />
        {node.xp} XP
      </span>
      </div>
    </TooltipProvider>
  );
};
