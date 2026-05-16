import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface SurveyQuestion {
  question: string;
  options: string[];
  category: 'familiarity' | 'goals' | 'time' | 'style';
}

interface SkillAssessmentModalProps {
  isOpen: boolean;
  topic: string;
  questions: SurveyQuestion[];
  onComplete: (responses: number[], skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert') => void;
  onSkip: () => void;
}

export const SkillAssessmentModal: React.FC<SkillAssessmentModalProps> = ({
  isOpen,
  topic,
  questions,
  onComplete,
  onSkip,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an option');
      return;
    }

    // Store answer
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate skill level based on first question (familiarity)
      const familiarityAnswer = newAnswers[0];
      let skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      
      // Map familiarity to skill level
      if (familiarityAnswer === 0) skillLevel = 'beginner';
      else if (familiarityAnswer === 1) skillLevel = 'intermediate';
      else if (familiarityAnswer === 2) skillLevel = 'advanced';
      else skillLevel = 'expert';

      onComplete(newAnswers, skillLevel);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary" />
            Skill Assessment: {topic}
          </DialogTitle>
          <DialogDescription>
            Answer these questions to help us personalize your learning path
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="glass-strong rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                {currentQuestionIndex + 1}
              </div>
              <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
            </div>

            {/* Options */}
            <RadioGroup value={selectedAnswer?.toString()} onValueChange={(val) => handleAnswerSelect(parseInt(val))}>
              <div className="space-y-3 mt-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;

                  return (
                    <div
                      key={index}
                      className={`
                        glass rounded-lg p-4 transition-all duration-300 cursor-pointer
                        ${isSelected ? 'border-2 border-primary bg-primary/5' : 'border border-border hover:border-primary/50'}
                      `}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                          {option}
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="flex-1"
            >
              <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Assessment'}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={onSkip}
              variant="outline"
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
