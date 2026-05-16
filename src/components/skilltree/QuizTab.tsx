import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import type { GeneratedQuiz } from '@/services/aiService';
import { playCorrectSound, playWrongSound } from '@/utils/soundEffects';

interface QuizTabProps {
  quizData: GeneratedQuiz;
  nodeXP: number;
  onComplete: (passed: boolean, score: number) => void;
}

/**
 * Duolingo-style quiz experience with multiple questions:
 * - Progress bar at top showing question number
 * - Question with large text
 * - Full-width answer buttons
 * - Green "Great job!" bottom panel on correct
 * - Red shake + "Try again" on wrong
 * - One question at a time flow
 * - Final score screen at the end
 */
export const QuizTab: React.FC<QuizTabProps> = ({ quizData, nodeXP, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showFinalScore, setShowFinalScore] = useState(false);

  // Handle both old and new quiz formats
  const quiz = quizData as any;
  const rawQuestions = quiz.questions && Array.isArray(quiz.questions) ? quiz.questions : [quiz];
  
  // Normalize questions to ensure consistent format
  const questions = rawQuestions.map((q: any) => {
    // If options are objects with {text, correct}, convert to string[] + correct_answer index
    if (q.options?.length > 0 && typeof q.options[0] === 'object' && q.options[0].text) {
      return {
        ...q,
        options: q.options.map((o: any) => o.text),
        correct_answer: q.correct_answer ?? q.options.findIndex((o: any) => o.correct),
        explanation: q.explanation || '',
      };
    }
    return q;
  });
  
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  // Safety check: ensure quiz has required properties
  if (!currentQuestion || !currentQuestion.question || !currentQuestion.options || !Array.isArray(currentQuestion.options)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">Quiz data is not available or in an incorrect format.</p>
        <p className="text-sm text-muted-foreground">Please try regenerating the quiz.</p>
      </div>
    );
  }

  // Ensure we have at least 2 options
  if (currentQuestion.options.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">Quiz must have at least 2 options.</p>
        <p className="text-sm text-muted-foreground">Please try regenerating the quiz.</p>
      </div>
    );
  }

  const handleOptionSelect = (optionIndex: number) => {
    if (checked) return;
    setSelectedOption(optionIndex.toString());
  };

  const handleCheck = () => {
    if (selectedOption === null || checked) return;

    const selectedIndex = parseInt(selectedOption);
    const correctIndex = currentQuestion.correct_answer;

    setChecked(true);
    const correct = selectedIndex === correctIndex;
    setIsCorrect(correct);
    setAnswers([...answers, correct]);

    if (correct) {
      playCorrectSound();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B'],
      });
    } else {
      playWrongSound();
    }
  };

  const handleContinue = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setChecked(false);
    } else {
      // Show final score
      setShowFinalScore(true);
    }
  };

  const handleFinish = () => {
    const passed = scorePercent >= 60; // 60% passing grade
    onComplete(passed, scorePercent);
  };

  // Calculate score
  const correctAnswers = answers.filter(a => a).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const earnedXP = Math.round((scorePercent / 100) * nodeXP);
  const passed = scorePercent >= 60;

  // Progress: show current question / total
  const progressPercent = ((currentQuestionIndex + (checked ? 1 : 0)) / totalQuestions) * 100;

  // Show final score screen
  if (showFinalScore) {
    return (
      <div className="space-y-6">
        {/* Progress Bar - Complete */}
        <div className="w-full">
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--duo-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: '100%', background: 'var(--duo-green)' }}
            />
          </div>
        </div>

        {/* Final Score */}
        <div className="flex flex-col items-center justify-center py-8 space-y-5">
          <div className="text-5xl font-black" style={{ color: passed ? 'var(--duo-green)' : 'var(--duo-red, #ff4b4b)' }}>
            {scorePercent}%
          </div>
          <h3 className="text-xl font-extrabold" style={{ color: 'var(--duo-text)' }}>
            {passed 
              ? (scorePercent >= 80 ? '🎉 Excellent! You Passed!' : '👍 Good Job! You Passed!') 
              : '💪 Keep Practicing! Try Again'}
          </h3>
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
              You got <span className="font-bold" style={{ color: 'var(--duo-text)' }}>{correctAnswers}</span> out of{' '}
              <span className="font-bold" style={{ color: 'var(--duo-text)' }}>{totalQuestions}</span> questions correct
            </p>
            {passed ? (
              <p className="text-xs font-semibold" style={{ color: 'var(--duo-green)' }}>
                ✓ Passed! {nodeXP > 0 ? `Earned ${earnedXP} XP and unlocked next nodes` : 'Practice complete!'}
              </p>
            ) : (
              <p className="text-xs font-semibold" style={{ color: 'var(--duo-red, #ff4b4b)' }}>
                ✗ Failed (Need 60%+). Retry to continue.
              </p>
            )}
          </div>

          {/* Question Review */}
          <div className="w-full space-y-2 mt-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--duo-text-muted)' }}>
              Review
            </h4>
            {questions.map((q: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl flex items-start gap-3"
                style={{
                  background: 'var(--duo-surface)',
                  borderLeft: `4px solid ${answers[idx] ? 'var(--duo-green)' : 'var(--duo-red, #ff4b4b)'}`,
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {answers[idx] ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--duo-green)' }} />
                  ) : (
                    <XCircle className="h-4 w-4" style={{ color: 'var(--duo-red, #ff4b4b)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: 'var(--duo-text)' }}>
                    Q{idx + 1}: {q.question}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--duo-text-muted)' }}>
                    ✅ {q.options[q.correct_answer]}
                  </p>
                  {!answers[idx] && q.explanation && (
                    <p className="text-xs mt-1" style={{ color: 'var(--duo-text-muted)' }}>
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button - inline, not fixed */}
        <div className="pt-2 pb-4">
          <button
            onClick={handleFinish}
            className="btn-duo btn-duo-green w-full py-3.5 text-base"
          >
            {passed ? 'Continue' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-extrabold" style={{ color: 'var(--duo-text-muted)' }}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs font-extrabold" style={{ color: 'var(--duo-green)' }}>
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--duo-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: isCorrect ? 'var(--duo-green)' : 'var(--duo-blue)',
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-lg font-extrabold leading-relaxed" style={{ color: 'var(--duo-text)' }}>
          {currentQuestion.question}
        </h3>
      </div>

      {/* Answer Options */}
      <div className="space-y-2.5">
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
              className="w-full rounded-2xl px-4 py-3.5 text-left transition-all duration-200 flex items-center gap-3.5"
              style={{
                background: showCorrectResult ? 'rgba(88, 204, 2, 0.1)' :
                  showWrongResult ? 'rgba(255, 75, 75, 0.1)' :
                  isSelected ? 'rgba(88, 204, 2, 0.05)' : 'var(--duo-surface)',
                border: `2px solid ${
                  showCorrectResult ? 'var(--duo-green)' :
                  showWrongResult ? 'var(--duo-red, #ff4b4b)' :
                  isSelected ? 'var(--duo-green)' : 'var(--duo-border)'
                }`,
                opacity: checked && !isSelected && index !== currentQuestion.correct_answer ? 0.4 : 1,
                color: 'var(--duo-text)',
              }}
            >
              {/* Option circle */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm"
                style={{
                  background: showCorrectResult ? 'var(--duo-green)' :
                    showWrongResult ? 'var(--duo-red, #ff4b4b)' :
                    isSelected ? 'var(--duo-green)' : 'var(--duo-bg)',
                  color: (showCorrectResult || showWrongResult || isSelected) ? 'white' : 'var(--duo-text)',
                  border: `2px solid ${
                    showCorrectResult ? 'var(--duo-green)' :
                    showWrongResult ? 'var(--duo-red, #ff4b4b)' :
                    isSelected ? 'var(--duo-green)' : 'var(--duo-border)'
                  }`,
                }}
              >
                {showCorrectResult ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : showWrongResult ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  optionLabel
                )}
              </div>
              <span className="flex-1 font-semibold text-sm">{optionText}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Action Panel - inline, not fixed */}
      <div className="pt-2 pb-2">
        {/* Not yet checked — show CHECK button */}
        {!checked && (
          <button
            onClick={handleCheck}
            disabled={!selectedOption}
            className="btn-duo btn-duo-green w-full py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        )}

        {/* Correct — green panel */}
        {checked && isCorrect && (
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(88, 204, 2, 0.1)', border: '2px solid rgba(88, 204, 2, 0.3)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--duo-green)' }} />
              <span className="text-base font-extrabold" style={{ color: 'var(--duo-green)' }}>Great job!</span>
            </div>
            {currentQuestion.explanation && (
              <p className="text-xs font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                {currentQuestion.explanation}
              </p>
            )}
            <button
              onClick={handleContinue}
              className="btn-duo btn-duo-green w-full py-3"
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        )}

        {/* Wrong — red panel */}
        {checked && isCorrect === false && (
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(255, 75, 75, 0.1)', border: '2px solid rgba(255, 75, 75, 0.3)' }}>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--duo-red, #ff4b4b)' }} />
              <span className="text-base font-extrabold" style={{ color: 'var(--duo-red, #ff4b4b)' }}>Not quite right</span>
            </div>
            {currentQuestion.explanation && (
              <p className="text-xs font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                {currentQuestion.explanation}
              </p>
            )}
            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-xl font-bold transition-colors"
              style={{ background: 'var(--duo-red, #ff4b4b)', color: 'white' }}
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
