import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock, Zap, Trophy, ArrowRight, Target, Code, Globe, BarChart2, Camera, Shield, Crown, Coins } from 'lucide-react';

interface DailyChallenge {
  title: string;
  description: string;
  topic: string;
  goal: string;
  xpReward: number;
  icon: React.ReactNode;
  color: string;
  colorDark: string;
}

const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    title: 'Python Power Hour',
    description: 'Complete 3 Python nodes to earn bonus XP',
    topic: 'Python Programming',
    goal: 'Complete 3 nodes',
    xpReward: 150,
    icon: <Code />,
    color: 'var(--duo-green)',
    colorDark: 'var(--duo-green-dark)',
  },
  {
    title: 'Web Dev Sprint',
    description: 'Master 2 Web Development concepts',
    topic: 'Web Development Fundamentals',
    goal: 'Complete 2 nodes',
    xpReward: 100,
    icon: <Globe />,
    color: 'var(--duo-blue)',
    colorDark: 'var(--duo-blue-dark)',
  },
  {
    title: 'Data Explorer',
    description: 'Dive into Data Science and complete a quiz',
    topic: 'Data Science',
    goal: 'Pass 1 quiz',
    xpReward: 120,
    icon: <BarChart2 />,
    color: 'var(--duo-purple)',
    colorDark: 'var(--duo-purple-dark)',
  },
  {
    title: 'Creative Challenge',
    description: 'Learn something about Photography today',
    topic: 'Photography',
    goal: 'Complete 2 lessons',
    xpReward: 100,
    icon: <Camera />,
    color: 'var(--duo-gold)',
    colorDark: 'var(--duo-gold-dark)',
  },
  {
    title: 'Security Scholar',
    description: 'Strengthen your Cybersecurity knowledge',
    topic: 'Cybersecurity',
    goal: 'Complete 3 nodes',
    xpReward: 180,
    icon: <Shield />,
    color: 'var(--duo-red)',
    colorDark: 'var(--duo-red-dark)',
  },
  {
    title: 'Chess Grandmaster',
    description: 'Learn 2 new chess strategies',
    topic: 'Chess',
    goal: 'Complete 2 lessons',
    xpReward: 100,
    icon: <Crown />,
    color: 'var(--duo-orange)',
    colorDark: '#CE7500',
  },
  {
    title: 'Finance Fundamentals',
    description: 'Master personal finance basics',
    topic: 'Finance',
    goal: 'Complete 3 nodes',
    xpReward: 150,
    icon: <Coins />,
    color: 'var(--duo-green)',
    colorDark: 'var(--duo-green-dark)',
  },
];

const getTimeRemaining = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

const getDailyChallenge = (): DailyChallenge => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
};

export const DailyChallengeBanner: React.FC = () => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());
  const challenge = getDailyChallenge();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer"
      onClick={() => navigate(`/skill-tree/${encodeURIComponent(challenge.topic)}`)}
      style={{
        background: 'var(--duo-surface)',
        border: '1.5px solid var(--duo-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = challenge.color;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--duo-border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top accent bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${challenge.color}, var(--duo-gold))` }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left side */}
          <div className="flex items-start gap-4 flex-1">
            {/* Challenge icon */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: `${challenge.color}15`,
                boxShadow: `0 3px 0 ${challenge.color}20`,
              }}
            >
              {challenge.icon}
            </div>

            {/* Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    background: `${challenge.color}15`,
                    color: challenge.color,
                  }}
                >
                  <Flame className="h-3 w-3 inline mr-1" />
                  Daily Challenge
                </span>
              </div>
              <h3 className="text-base font-extrabold" style={{ color: 'var(--duo-text)' }}>
                {challenge.title}
              </h3>
              <p className="text-xs font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                {challenge.description}
              </p>

              {/* Goal + Reward */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold" style={{ color: 'var(--duo-text-muted)' }}>
                  <Target className="h-3 w-3" style={{ color: challenge.color }} />
                  {challenge.goal}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold" style={{ color: 'var(--duo-gold)' }}>
                  <Zap className="h-3 w-3" />
                  +{challenge.xpReward} XP
                </div>
              </div>
            </div>
          </div>

          {/* Right side — Timer + CTA */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            {/* Countdown */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" style={{ color: 'var(--duo-text-muted)' }} />
              <div className="flex items-center gap-1 text-sm font-black tabular-nums" style={{ color: 'var(--duo-text)' }}>
                <span
                  className="px-1.5 py-0.5 rounded-md text-xs"
                  style={{ background: 'var(--duo-bg)', border: '1px solid var(--duo-border)' }}
                >
                  {pad(timeRemaining.hours)}
                </span>
                <span style={{ color: 'var(--duo-text-muted)' }}>:</span>
                <span
                  className="px-1.5 py-0.5 rounded-md text-xs"
                  style={{ background: 'var(--duo-bg)', border: '1px solid var(--duo-border)' }}
                >
                  {pad(timeRemaining.minutes)}
                </span>
                <span style={{ color: 'var(--duo-text-muted)' }}>:</span>
                <span
                  className="px-1.5 py-0.5 rounded-md text-xs"
                  style={{ background: 'var(--duo-bg)', border: '1px solid var(--duo-border)' }}
                >
                  {pad(timeRemaining.seconds)}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all duration-200"
              style={{
                background: challenge.color,
                color: 'white',
                boxShadow: `0 3px 0 ${challenge.colorDark}`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/skill-tree/${encodeURIComponent(challenge.topic)}`);
              }}
            >
              Accept
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
