import React, { useState } from 'react';
import { TrendingUp, Code, Palette, Globe, Brain, Music, Camera, Dumbbell } from 'lucide-react';

interface SuggestionChipsNewProps {
  onChipClick: (topic: string) => void;
}

/**
 * Professional topic chips with personality.
 * 
 * Design improvements:
 * - Real icons (not emoji)
 * - Intentional color palette
 * - Hover micro-interactions
 * - Staggered animations
 * - Asymmetric layout
 */
export const SuggestionChipsNew: React.FC<SuggestionChipsNewProps> = ({ onChipClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const suggestions = [
    { topic: 'React Development', icon: Code, color: 'var(--duo-blue)', bg: 'rgba(73, 192, 248, 0.1)' },
    { topic: 'UI/UX Design', icon: Palette, color: 'var(--duo-purple)', bg: 'rgba(165, 96, 232, 0.1)' },
    { topic: 'Spanish Language', icon: Globe, color: 'var(--duo-green)', bg: 'rgba(88, 204, 2, 0.1)' },
    { topic: 'Machine Learning', icon: Brain, color: 'var(--duo-gold)', bg: 'rgba(255, 200, 0, 0.1)' },
    { topic: 'Piano Basics', icon: Music, color: 'var(--duo-purple)', bg: 'rgba(165, 96, 232, 0.1)' },
    { topic: 'Photography', icon: Camera, color: 'var(--duo-blue)', bg: 'rgba(73, 192, 248, 0.1)' },
    { topic: 'Fitness Training', icon: Dumbbell, color: 'var(--duo-orange)', bg: 'rgba(255, 150, 0, 0.1)' },
  ];

  return (
    <div style={{ width: '100%', maxWidth: '48rem', margin: '0 auto' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <TrendingUp style={{ width: '18px', height: '18px', color: 'var(--duo-green)' }} />
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--duo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Popular Topics
        </h3>
      </div>

      {/* Chips Grid */}
      <div 
        style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'flex-start',
        }}
      >
        {suggestions.map((item, index) => {
          const Icon = item.icon;
          const isHovered = hoveredIndex === index;

          return (
            <button
              key={index}
              onClick={() => onChipClick(item.topic)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="suggestion-chip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                background: isHovered ? item.bg : 'var(--duo-surface)',
                border: `2px solid ${isHovered ? item.color : 'var(--duo-border)'}`,
                color: isHovered ? item.color : 'var(--duo-text)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
                animationDelay: `${index * 40}ms`,
              }}
            >
              <Icon 
                style={{ 
                  width: '18px', 
                  height: '18px',
                  transition: 'transform 0.2s',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }} 
              />
              <span>{item.topic}</span>
            </button>
          );
        })}
      </div>

      {/* Helper Text */}
      <p 
        style={{ 
          fontSize: '0.8125rem', 
          color: 'var(--duo-text-muted)', 
          marginTop: '1rem',
          fontWeight: 500,
        }}
      >
        Or try: "Quantum Physics", "Italian Cooking", "Stock Trading", "3D Modeling"
      </p>
    </div>
  );
};
