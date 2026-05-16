import React from 'react';
import { Sparkles } from 'lucide-react';

interface SparkleEffectProps {
  show: boolean;
  color?: string;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({ 
  show, 
  color = 'var(--duo-gold)' 
}) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Center sparkle */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping"
        style={{ color }}
      >
        <Sparkles className="h-8 w-8" />
      </div>
      
      {/* Top-left sparkle */}
      <div 
        className="absolute top-0 left-0 animate-pulse"
        style={{ 
          color,
          animationDelay: '0.1s',
          animationDuration: '1s'
        }}
      >
        <Sparkles className="h-4 w-4" />
      </div>
      
      {/* Top-right sparkle */}
      <div 
        className="absolute top-0 right-0 animate-pulse"
        style={{ 
          color,
          animationDelay: '0.2s',
          animationDuration: '1s'
        }}
      >
        <Sparkles className="h-4 w-4" />
      </div>
      
      {/* Bottom-left sparkle */}
      <div 
        className="absolute bottom-0 left-0 animate-pulse"
        style={{ 
          color,
          animationDelay: '0.3s',
          animationDuration: '1s'
        }}
      >
        <Sparkles className="h-4 w-4" />
      </div>
      
      {/* Bottom-right sparkle */}
      <div 
        className="absolute bottom-0 right-0 animate-pulse"
        style={{ 
          color,
          animationDelay: '0.4s',
          animationDuration: '1s'
        }}
      >
        <Sparkles className="h-4 w-4" />
      </div>
    </div>
  );
};
