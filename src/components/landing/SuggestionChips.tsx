import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Code, ChefHat, Coins, Music, Brain, Crown, Rocket, Skull } from 'lucide-react';

interface SuggestionChipsProps {
  onChipClick?: (topic: string) => void;
}

const suggestions = [
  { text: 'Python Programming', icon: <Code className="h-4 w-4" />, color: '#49C0F8' },
  { text: 'Japanese Cooking', icon: <ChefHat className="h-4 w-4" />, color: '#FF9600' },
  { text: 'Personal Finance', icon: <Coins className="h-4 w-4" />, color: '#58CC02' },
  { text: 'Guitar Basics', icon: <Music className="h-4 w-4" />, color: '#FF4B4B' },
  { text: 'Machine Learning', icon: <Brain className="h-4 w-4" />, color: '#A560E8' },
  { text: 'Chess Strategy', icon: <Crown className="h-4 w-4" />, color: '#FFC800' },
  { text: 'Space Exploration', icon: <Rocket className="h-4 w-4" />, color: '#49C0F8' },
  { text: 'Zombie Survival', icon: <Skull className="h-4 w-4" />, color: '#FF4B4B' },
];

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onChipClick }) => {
  const navigate = useNavigate();

  const handleChipClick = (suggestion: string) => {
    onChipClick?.(suggestion);
    navigate(`/skill-tree/${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-center gap-2">
        <TrendingUp className="h-3.5 w-3.5" style={{ color: 'var(--duo-text-muted)' }} />
        <p className="text-[13px] font-bold" style={{ color: 'var(--duo-text-muted)' }}>
          Popular topics
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        {suggestions.map((s, index) => (
          <button
            key={s.text}
            className="suggestion-chip group"
            onClick={() => handleChipClick(s.text)}
            style={{
              animationDelay: `${index * 0.04}s`,
              ['--chip-color' as string]: s.color,
            }}
          >
            <span className="text-base mr-1">{s.icon}</span>
            <span className="text-[13px] font-extrabold" style={{ color: 'var(--duo-text)' }}>
              {s.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
