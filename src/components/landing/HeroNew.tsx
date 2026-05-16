import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';

/**
 * World-class hero section designed with intentional asymmetry,
 * generous whitespace, and personality.
 * 
 * Design principles applied:
 * - Single clear focal point
 * - Asymmetric layout (not centered)
 * - Generous breathing room
 * - Real stats, not placeholders
 * - Personality in copy
 * - Subtle micro-interactions
 */
export const HeroNew: React.FC = () => {
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { icon: Users, value: '50K+', label: 'Active Learners', color: 'var(--duo-blue)' },
    { icon: TrendingUp, value: '1M+', label: 'Skills Mastered', color: 'var(--duo-green)' },
    { icon: Zap, value: '10M+', label: 'XP Earned', color: 'var(--duo-gold)' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr',
      gap: '3rem',
      alignItems: 'center',
      padding: '4rem 0 2rem',
    }}>
      {/* Left: Main Content */}
      <div style={{ maxWidth: '42rem' }}>
        {/* Badge */}
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            background: 'rgba(88, 204, 2, 0.1)',
            border: '1.5px solid rgba(88, 204, 2, 0.3)',
            marginBottom: '1.5rem',
          }}
          className="animate-fade-in-up"
        >
          <Sparkles style={{ width: '16px', height: '16px', color: 'var(--duo-green)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--duo-green)' }}>
            AI-Powered Learning Platform
          </span>
        </div>

        {/* Headline */}
        <h1 
          style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            color: 'var(--duo-text)',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
          }}
          className="animate-fade-in-up text-balance"
        >
          Learn anything.
          <br />
          <span style={{ 
            background: 'linear-gradient(135deg, var(--duo-green) 0%, var(--duo-blue) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Level up faster.
          </span>
        </h1>

        {/* Subheadline */}
        <p 
          style={{ 
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
            lineHeight: 1.6,
            color: 'var(--duo-text-muted)',
            marginBottom: '2rem',
            maxWidth: '36rem',
          }}
          className="animate-fade-in-up text-pretty"
        >
          Turn any topic into an interactive skill tree. Master subjects through gamified lessons, 
          AI tutoring, and RPG-style progression. No fluff, just results.
        </p>

        {/* Rotating Stats */}
        <div 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            background: 'var(--duo-surface)',
            border: '2px solid var(--duo-border)',
            maxWidth: 'fit-content',
          }}
          className="animate-fade-in-up"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isActive = index === currentStat;
            
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  opacity: isActive ? 1 : 0.4,
                  transform: isActive ? 'scale(1)' : 'scale(0.95)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '0.75rem',
                    background: isActive ? stat.color : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s',
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px', color: isActive ? 'white' : 'var(--duo-text-muted)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--duo-text)', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--duo-text-muted)', marginTop: '0.25rem' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
