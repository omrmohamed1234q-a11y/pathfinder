import React, { useState } from 'react';
import { Rocket, CheckSquare, Clock, Lightbulb, Code, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProjectContent } from '@/types/skilltree';
import { playSound } from '@/utils/soundEffects';

interface ProjectTabProps {
  content: ProjectContent;
  onComplete?: () => void;
}

export const ProjectTab: React.FC<ProjectTabProps> = ({ content, onComplete }) => {
  const [completedRequirements, setCompletedRequirements] = useState<Set<number>>(new Set());
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const progress = completedRequirements.size / content.requirements.length;
  const isComplete = completedRequirements.size === content.requirements.length;

  const toggleRequirement = (index: number) => {
    const newCompleted = new Set(completedRequirements);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
      playSound('click');
    } else {
      newCompleted.add(index);
      playSound('success');
    }
    setCompletedRequirements(newCompleted);
  };

  const handleSubmit = () => {
    if (isComplete) {
      setSubmitted(true);
      playSound('levelUp');
      onComplete?.();
    }
  };

  const showNextHint = () => {
    if (content.hints && currentHintIndex < content.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
      playSound('click');
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'Varies';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Rocket className="h-6 w-6 text-background" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Build a Real Project</h3>
              <p className="text-sm text-muted-foreground">Apply what you've learned</p>
            </div>
          </div>
          {content.estimatedTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(content.estimatedTime)}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-foreground/80 leading-relaxed">{content.description}</p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {completedRequirements.size} / {content.requirements.length} requirements
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          Requirements
        </h3>
        <div className="space-y-2">
          {content.requirements.map((req, index) => (
            <label
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
            >
              <input
                type="checkbox"
                checked={completedRequirements.has(index)}
                onChange={() => toggleRequirement(index)}
                className="mt-1 w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <span className={`flex-1 ${completedRequirements.has(index) ? 'line-through text-muted-foreground' : ''}`}>
                {req}
              </span>
              {completedRequirements.has(index) && (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Starter Code */}
      {content.starterCode && (
        <div className="glass rounded-xl p-6 space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Starter Code
          </h3>
          <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm">{content.starterCode}</code>
          </pre>
        </div>
      )}

      {/* Hints */}
      {content.hints && content.hints.length > 0 && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Hints
            </h3>
            <Button
              onClick={() => setShowHints(!showHints)}
              variant="outline"
              size="sm"
            >
              {showHints ? 'Hide' : 'Show'} Hints
            </Button>
          </div>
          {showHints && (
            <div className="space-y-3">
              {content.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                <div key={index} className="glass rounded-lg p-4 border-l-4 border-primary">
                  <p className="text-sm">
                    <strong>Hint {index + 1}:</strong> {hint}
                  </p>
                </div>
              ))}
              {currentHintIndex < content.hints.length - 1 && (
                <Button
                  onClick={showNextHint}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Show Next Hint ({currentHintIndex + 1}/{content.hints.length})
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Solution */}
      {content.solution && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              Solution
            </h3>
            <Button
              onClick={() => setShowSolution(!showSolution)}
              variant="outline"
              size="sm"
            >
              {showSolution ? 'Hide' : 'Show'} Solution
            </Button>
          </div>
          {showSolution && (
            <div className="space-y-3">
              <div className="glass rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-muted-foreground">
                  ⚠️ Try to complete the project yourself first! Looking at the solution too early will hurt your learning.
                </p>
              </div>
              <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm">{content.solution}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || submitted}
          className="flex-1 text-lg font-bold py-6 gap-2"
          style={{ 
            background: isComplete ? 'linear-gradient(135deg, hsl(190,100%,50%), hsl(258,90%,66%))' : undefined,
            opacity: isComplete ? 1 : 0.5
          }}
        >
          <Rocket className="h-5 w-5" />
          {submitted ? 'Project Submitted!' : 'Submit Project'}
        </Button>
      </div>

      {/* Completion Message */}
      {submitted && (
        <div className="glass-strong rounded-2xl p-6 text-center space-y-3 border-2 border-green-500 animate-scale-in">
          <div className="text-4xl">🎉</div>
          <h3 className="text-xl font-bold text-green-500">Project Complete!</h3>
          <p className="text-muted-foreground">
            Excellent work! You've built something real and learned by doing.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="glass rounded-xl p-4 border-l-4 border-primary">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Don't just copy code - understand every line. Experiment, break things, and fix them. That's how you truly learn!
        </p>
      </div>
    </div>
  );
};
