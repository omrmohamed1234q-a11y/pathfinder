import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Share2, Sparkles, Trophy, Clock, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { playCompletionSound } from '@/utils/soundEffects';

interface CompletionOverlayProps {
  topic: string;
  totalXP: number;
  totalNodes: number;
  timeSpent: string;
  isVisible: boolean;
}

export const CompletionOverlay: React.FC<CompletionOverlayProps> = ({
  topic, totalXP, totalNodes, timeSpent, isVisible,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible) {
      playCompletionSound();
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#00D4FF', '#8B5CF6', '#F59E0B'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#00D4FF', '#8B5CF6', '#F59E0B'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleShare = () => {
    const text = `🏆 I just mastered "${topic}" on Pathfinder!\n⚡ ${totalXP} XP earned\n🎯 ${totalNodes} nodes completed\n⏱️ Time: ${timeSpent}\n\n#BuiltWithMeDo #Pathfinder`;
    if (navigator.share) {
      navigator.share({ title: 'Pathfinder Achievement', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Achievement copied to clipboard! Share it on social media 🚀');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md animate-scale-in">
      <div className="text-center space-y-8 max-w-2xl px-6">
        {/* Trophy */}
        <div className="relative inline-block">
          <div className="text-9xl animate-float">
            🏆
            <div className="absolute inset-0 blur-3xl bg-yellow-500/30 -z-10" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold gradient-text-gold">Skill Tree Complete!</h1>
          <p className="text-2xl text-foreground/80">You mastered {topic}!</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8">
          <div className="glass-strong rounded-xl p-4 min-w-[120px]">
            <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold gradient-text">{totalXP}</p>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </div>
          <div className="glass-strong rounded-xl p-4 min-w-[120px]">
            <Clock className="h-6 w-6 text-secondary mx-auto mb-2" />
            <p className="text-3xl font-bold gradient-text">{timeSpent}</p>
            <p className="text-sm text-muted-foreground">Time Spent</p>
          </div>
          <div className="glass-strong rounded-xl p-4 min-w-[120px]">
            <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold gradient-text">{totalNodes}/{totalNodes}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')} size="lg"
            className="text-lg font-bold rounded-xl px-8 hover-scale button-shimmer"
            style={{ background: 'linear-gradient(135deg, hsl(190,100%,50%), hsl(258,90%,66%))', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}>
            New Skill Tree
          </Button>
          <Button onClick={handleShare} size="lg" variant="outline" className="text-lg font-bold rounded-xl px-8 hover-scale">
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};
