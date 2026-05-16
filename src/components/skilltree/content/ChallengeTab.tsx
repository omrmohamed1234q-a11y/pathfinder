import React, { useState, useEffect } from 'react';
import { Zap, Clock, Play, Pause, RotateCw, CheckCircle, Lightbulb, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChallengeContent } from '@/types/skilltree';
import { playSound } from '@/utils/soundEffects';

interface ChallengeTabProps {
  content: ChallengeContent;
  onComplete?: () => void;
}

export const ChallengeTab: React.FC<ChallengeTabProps> = ({ content, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(content.timeLimit || 0);
  const [isRunning, setIsRunning] = useState(false);
  const [userSolution, setUserSolution] = useState('');
  const [testResults, setTestResults] = useState<boolean[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playSound('error');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = () => {
    switch (content.difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-primary';
    }
  };

  const getDifficultyBadge = () => {
    switch (content.difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      default: return '⭐';
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setTimeLeft(content.timeLimit || 300);
    playSound('click');
  };

  const handlePause = () => {
    setIsRunning(false);
    playSound('click');
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(content.timeLimit || 0);
    setUserSolution('');
    setTestResults([]);
    setCompleted(false);
    playSound('click');
  };

  const handleRunTests = () => {
    if (!content.testCases) return;

    // Simulate test execution (in real app, would execute code)
    const results = content.testCases.map(() => Math.random() > 0.3);
    setTestResults(results);

    const allPassed = results.every(r => r);
    if (allPassed) {
      setCompleted(true);
      setIsRunning(false);
      playSound('levelUp');
      onComplete?.();
    } else {
      playSound('error');
    }
  };

  const showNextHint = () => {
    if (content.hints && currentHintIndex < content.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
      playSound('click');
    }
  };

  const allTestsPassed = testResults.length > 0 && testResults.every(r => r);

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="h-6 w-6 text-background" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Coding Challenge</h3>
              <p className={`text-sm font-medium ${getDifficultyColor()}`}>
                {getDifficultyBadge()} {content.difficulty.toUpperCase()}
              </p>
            </div>
          </div>
          {content.timeLimit && (
            <div className={`flex items-center gap-2 text-2xl font-bold ${
              timeLeft < 60 ? 'text-red-500' : 'text-primary'
            }`}>
              <Clock className="h-6 w-6" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-foreground/80 leading-relaxed">{content.description}</p>

        {/* Timer Controls */}
        {content.timeLimit && (
          <div className="flex gap-2">
            {!isRunning && timeLeft === (content.timeLimit || 0) && (
              <Button onClick={handleStart} className="gap-2">
                <Play className="h-4 w-4" />
                Start Challenge
              </Button>
            )}
            {isRunning && (
              <Button onClick={handlePause} variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            {!isRunning && timeLeft < (content.timeLimit || 0) && timeLeft > 0 && (
              <Button onClick={() => setIsRunning(true)} className="gap-2">
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}
            {timeLeft < (content.timeLimit || 0) && (
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RotateCw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-bold">Your Solution</h3>
        <textarea
          value={userSolution}
          onChange={(e) => setUserSolution(e.target.value)}
          placeholder="Write your code here..."
          className="w-full h-[300px] bg-muted/50 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={completed}
        />
        <Button
          onClick={handleRunTests}
          disabled={!userSolution.trim() || completed}
          className="gap-2"
          style={{ background: 'linear-gradient(135deg, hsl(190,100%,50%), hsl(258,90%,66%))' }}
        >
          <Play className="h-4 w-4" />
          Run Tests
        </Button>
      </div>

      {/* Test Cases */}
      {content.testCases && content.testCases.length > 0 && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold">Test Cases</h3>
          <div className="space-y-2">
            {content.testCases.map((testCase, index) => (
              <div
                key={index}
                className={`glass rounded-lg p-4 border-l-4 ${
                  testResults[index] === undefined
                    ? 'border-muted'
                    : testResults[index]
                    ? 'border-green-500'
                    : 'border-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Test Case {index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Input:</strong> {testCase.input}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Expected:</strong> {testCase.expectedOutput}
                    </p>
                  </div>
                  {testResults[index] !== undefined && (
                    <div className={testResults[index] ? 'text-green-500' : 'text-red-500'}>
                      {testResults[index] ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-xl">✗</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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

      {/* Completion Message */}
      {completed && allTestsPassed && (
        <div className="glass-strong rounded-2xl p-6 text-center space-y-3 border-2 border-green-500 animate-scale-in">
          <div className="text-4xl">🏆</div>
          <h3 className="text-xl font-bold text-green-500">Challenge Complete!</h3>
          <p className="text-muted-foreground">
            All tests passed! You solved it in {formatTime((content.timeLimit || 0) - timeLeft)}.
          </p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Trophy className="h-5 w-5" />
            <span className="font-bold">+{content.difficulty === 'hard' ? 150 : content.difficulty === 'medium' ? 100 : 50} XP</span>
          </div>
        </div>
      )}

      {/* Time's Up Message */}
      {timeLeft === 0 && !completed && (
        <div className="glass-strong rounded-2xl p-6 text-center space-y-3 border-2 border-red-500">
          <div className="text-4xl">⏰</div>
          <h3 className="text-xl font-bold text-red-500">Time's Up!</h3>
          <p className="text-muted-foreground">
            Don't worry! You can reset and try again. Practice makes perfect!
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="glass rounded-xl p-4 border-l-4 border-primary">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Think through the problem before coding. Break it down into smaller steps, and test as you go!
        </p>
      </div>
    </div>
  );
};
