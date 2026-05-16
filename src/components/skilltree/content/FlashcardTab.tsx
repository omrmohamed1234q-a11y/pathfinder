import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Brain, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FlashcardContent } from '@/types/skilltree';
import { playSound } from '@/utils/soundEffects';

interface FlashcardTabProps {
  content: FlashcardContent;
  onComplete?: () => void;
}

export const FlashcardTab: React.FC<FlashcardTabProps> = ({ content, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const [showHint, setShowHint] = useState(false);

  const currentCard = content.cards[currentIndex];
  const progress = masteredCards.size / content.cards.length;
  const isComplete = masteredCards.size === content.cards.length;

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playSound('click');
  };

  const handleNext = () => {
    if (currentIndex < content.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
      playSound('click');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
      playSound('click');
    }
  };

  const handleMastered = (mastered: boolean) => {
    const newMastered = new Set(masteredCards);
    if (mastered) {
      newMastered.add(currentIndex);
      playSound('success');
    } else {
      newMastered.delete(currentIndex);
      playSound('error');
    }
    setMasteredCards(newMastered);
    
    // Auto-advance to next card
    setTimeout(() => {
      if (currentIndex < content.cards.length - 1) {
        handleNext();
      }
    }, 500);
  };

  const handleShuffle = () => {
    const unmastered = content.cards
      .map((_, i) => i)
      .filter(i => !masteredCards.has(i));
    
    if (unmastered.length > 0) {
      const randomIndex = unmastered[Math.floor(Math.random() * unmastered.length)];
      setCurrentIndex(randomIndex);
      setIsFlipped(false);
      setShowHint(false);
      playSound('click');
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground">
            {masteredCards.size} / {content.cards.length} mastered
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="relative h-[400px] cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 glass-strong rounded-3xl p-8 flex flex-col items-center justify-center backface-hidden border-2 border-card-border">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-primary">Question</div>
              <p className="text-2xl font-bold leading-relaxed">{currentCard.front}</p>
              <div className="text-sm text-muted-foreground mt-8">Click to reveal answer</div>
            </div>
            {masteredCards.has(currentIndex) && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            )}
          </div>

          {/* Back */}
          <div className="absolute inset-0 glass-strong rounded-3xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 border-2 border-primary">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-primary">Answer</div>
              <p className="text-2xl font-bold leading-relaxed">{currentCard.back}</p>
              <div className="text-sm text-muted-foreground mt-8">Click to flip back</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint */}
      {currentCard.hint && !isFlipped && (
        <div className="text-center">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowHint(!showHint);
            }}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
          {showHint && (
            <div className="mt-3 glass rounded-xl p-4 text-sm text-muted-foreground">
              💡 {currentCard.hint}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {content.cards.length}
          </span>
          <Button
            onClick={handleShuffle}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Shuffle
          </Button>
        </div>

        <Button
          onClick={handleNext}
          disabled={currentIndex === content.cards.length - 1}
          variant="outline"
          className="gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Mastery Buttons (only show when flipped) */}
      {isFlipped && (
        <div className="flex gap-3">
          <Button
            onClick={() => handleMastered(false)}
            variant="outline"
            className="flex-1 gap-2 border-red-500/50 hover:bg-red-500/20"
          >
            <XCircle className="h-4 w-4" />
            Need More Practice
          </Button>
          <Button
            onClick={() => handleMastered(true)}
            className="flex-1 gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(142,76%,36%), hsl(142,76%,56%))' }}
          >
            <CheckCircle className="h-4 w-4" />
            Got It!
          </Button>
        </div>
      )}

      {/* Completion Message */}
      {isComplete && (
        <div className="glass-strong rounded-2xl p-6 text-center space-y-3 border-2 border-green-500">
          <div className="text-4xl">🎉</div>
          <h3 className="text-xl font-bold text-green-500">All Cards Mastered!</h3>
          <p className="text-muted-foreground">
            Great job! You've mastered all {content.cards.length} flashcards.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="glass rounded-xl p-4 border-l-4 border-primary">
        <p className="text-sm text-muted-foreground">
          <Brain className="inline h-4 w-4 mr-1" />
          <strong>Spaced Repetition:</strong> Review these cards regularly for long-term retention. Come back tomorrow, then in 3 days, then in a week!
        </p>
      </div>
    </div>
  );
};
