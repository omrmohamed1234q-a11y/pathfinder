import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import type { GeneratedQuiz } from '@/services/aiService';
import { playCorrectSound, playWrongSound } from '@/utils/soundEffects';

interface PracticeQuizModalProps {
  isOpen: boolean;
  quizData: GeneratedQuiz;
  topic: string;
  onClose: () => void;
  onRetry: () => void;
}

export const PracticeQuizModal: React.FC<PracticeQuizModalProps> = ({
  isOpen,
  quizData,
  topic,
  onClose,
  onRetry,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showFinalScore, setShowFinalScore] = useState(false);

  const totalQuestions = quizData.questions.length;
  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (checked) return;
    setSelectedOption(index.toString());
  };

  const handleCheck = () => {
    if (selectedOption === null) return;

    const correct = parseInt(selectedOption) === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setChecked(true);
    setAnswers([...answers, correct]);

    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setChecked(false);
    } else {
      setShowFinalScore(true);
    }
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setChecked(false);
    setAnswers([]);
    setShowFinalScore(false);
  };

  const correctAnswers = answers.filter(a => a).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const progressPercent = ((currentQuestionIndex + (checked ? 1 : 0)) / totalQuestions) * 100;

  if (showFinalScore) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Practice Quiz Results</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 pb-8">
            {/* Progress Bar - Complete */}
            <Progress value={100} className="h-2" />

            {/* Final Score */}
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className={`text-6xl font-bold ${scorePercent >= 60 ? 'text-green-500' : 'text-primary'}`}>
                {scorePercent}%
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {scorePercent >= 80 ? '🎉 Excellent!' : scorePercent >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
              </h3>
              <div className="text-center space-y-2">
                <p className="text-lg text-muted-foreground">
                  You got <span className="font-bold text-foreground">{correctAnswers}</span> out of{' '}
                  <span className="font-bold text-foreground">{totalQuestions}</span> questions correct
                </p>
                <p className="text-sm text-muted-foreground">
                  This is a practice quiz - your progress is not affected
                </p>
              </div>

              {/* Question Review */}
              <div className="w-full space-y-3 mt-8">
                <h4 className="font-semibold text-lg">Question Review</h4>
                {quizData.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className={`glass rounded-lg p-4 ${answers[idx] ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}
                  >
                    <div className="flex items-start gap-3">
                      {answers[idx] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{q.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Correct answer: {q.options[q.correct_answer]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleRetryQuiz} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Quiz
              </Button>
              <Button onClick={onRetry} variant="outline" className="flex-1">
                New Quiz
              </Button>
              <Button onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Practice Quiz: {topic}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pb-32">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{Math.round(progressPercent)}% Complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Question */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 leading-relaxed">{currentQuestion.question}</h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((optionText: string, index: number) => {
                const isSelected = selectedOption === index.toString();
                const showCorrectResult = checked && index === currentQuestion.correct_answer;
                const showWrongResult = checked && isSelected && index !== currentQuestion.correct_answer;

                const optionLabel = String.fromCharCode(65 + index);

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={checked}
                    className={`
                      w-full rounded-2xl px-5 py-4 text-left transition-all duration-200
                      font-medium text-base flex items-center gap-4
                      ${!checked && !isSelected ? 'glass border-2 border-transparent hover:border-primary/30 active:scale-[0.98]' : ''}
                      ${!checked && isSelected ? 'glass border-2 border-primary bg-primary/10' : ''}
                      ${showCorrectResult ? 'border-2 border-green-500 bg-green-500/10 text-green-400' : ''}
                      ${showWrongResult ? 'border-2 border-red-500 bg-red-500/10 text-red-400 animate-shake' : ''}
                      ${checked && !isSelected && index !== currentQuestion.correct_answer ? 'opacity-40' : ''}
                    `}
                  >
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0
                        ${!checked && !isSelected ? 'glass border-2 border-border' : ''}
                        ${!checked && isSelected ? 'bg-primary text-background' : ''}
                        ${showCorrectResult ? 'bg-green-500 text-white' : ''}
                        ${showWrongResult ? 'bg-red-500 text-white' : ''}
                        ${checked && !isSelected && index !== currentQuestion.correct_answer ? 'glass border-2 border-border' : ''}
                      `}
                    >
                      {showCorrectResult ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : showWrongResult ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        optionLabel
                      )}
                    </div>
                    <span className="flex-1">{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Panel */}
          {!checked ? (
            <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border p-6">
              <div className="max-w-2xl mx-auto">
                <Button
                  onClick={handleCheck}
                  disabled={selectedOption === null}
                  className="w-full h-14 text-lg font-semibold"
                >
                  Check Answer
                </Button>
              </div>
            </div>
          ) : isCorrect ? (
            <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white p-6">
              <div className="max-w-2xl mx-auto flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold">Great job!</h4>
                  <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
                </div>
                <Button onClick={handleNext} size="lg" variant="secondary">
                  {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-6">
              <div className="max-w-2xl mx-auto flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold">Not quite!</h4>
                  <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
                </div>
                <Button onClick={handleNext} size="lg" variant="secondary">
                  {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
