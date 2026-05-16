import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Brain, Zap } from 'lucide-react';

interface QuizSettingsModalProps {
  isOpen: boolean;
  topic: string;
  onClose: () => void;
  onGenerate: (settings: QuizSettings) => void;
}

export interface QuizSettings {
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  format: 'multiple_choice' | 'true_false' | 'mixed';
}

export const QuizSettingsModal: React.FC<QuizSettingsModalProps> = ({
  isOpen,
  topic,
  onClose,
  onGenerate,
}) => {
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [format, setFormat] = useState<'multiple_choice' | 'true_false' | 'mixed'>('multiple_choice');

  const handleGenerate = () => {
    onGenerate({ numQuestions, difficulty, format });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary" />
            Custom Practice Quiz
          </DialogTitle>
          <DialogDescription>
            Customize your quiz settings for {topic}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Number of Questions */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Number of Questions</Label>
            <RadioGroup value={numQuestions.toString()} onValueChange={(val) => setNumQuestions(parseInt(val))}>
              <div className="grid grid-cols-2 gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <div
                    key={num}
                    className={`
                      glass rounded-lg p-2.5 cursor-pointer transition-all
                      ${numQuestions === num ? 'border-2 border-primary bg-primary/5' : 'border border-border hover:border-primary/50'}
                    `}
                    onClick={() => setNumQuestions(num)}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={num.toString()} id={`num-${num}`} />
                      <Label htmlFor={`num-${num}`} className="cursor-pointer font-medium text-sm">
                        {num} Questions
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Difficulty Level</Label>
            <RadioGroup value={difficulty} onValueChange={(val) => setDifficulty(val as 'easy' | 'medium' | 'hard')}>
              <div className="space-y-2">
                {[
                  { value: 'easy', label: 'Easy', desc: 'Basic concepts and fundamentals' },
                  { value: 'medium', label: 'Medium', desc: 'Intermediate knowledge and application' },
                  { value: 'hard', label: 'Hard', desc: 'Advanced concepts and problem-solving' },
                ].map((diff) => (
                  <div
                    key={diff.value}
                    className={`
                      glass rounded-lg p-2.5 cursor-pointer transition-all
                      ${difficulty === diff.value ? 'border-2 border-primary bg-primary/5' : 'border border-border hover:border-primary/50'}
                    `}
                    onClick={() => setDifficulty(diff.value as 'easy' | 'medium' | 'hard')}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={diff.value} id={`diff-${diff.value}`} />
                      <div className="flex-1">
                        <Label htmlFor={`diff-${diff.value}`} className="cursor-pointer font-medium text-sm">
                          {diff.label}
                        </Label>
                        <p className="text-[12px] text-muted-foreground mt-0.5 leading-tight">{diff.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Question Format */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Question Format</Label>
            <RadioGroup value={format} onValueChange={(val) => setFormat(val as 'multiple_choice' | 'true_false' | 'mixed')}>
              <div className="space-y-2">
                {[
                  { value: 'multiple_choice', label: 'Multiple Choice', desc: 'Choose from 4 options' },
                  { value: 'true_false', label: 'True/False', desc: 'Simple true or false questions' },
                  { value: 'mixed', label: 'Mixed', desc: 'Combination of both formats' },
                ].map((fmt) => (
                  <div
                    key={fmt.value}
                    className={`
                      glass rounded-lg p-2.5 cursor-pointer transition-all
                      ${format === fmt.value ? 'border-2 border-primary bg-primary/5' : 'border border-border hover:border-primary/50'}
                    `}
                    onClick={() => setFormat(fmt.value as 'multiple_choice' | 'true_false' | 'mixed')}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={fmt.value} id={`fmt-${fmt.value}`} />
                      <div className="flex-1">
                        <Label htmlFor={`fmt-${fmt.value}`} className="cursor-pointer font-medium text-sm">
                          {fmt.label}
                        </Label>
                        <p className="text-[12px] text-muted-foreground mt-0.5 leading-tight">{fmt.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleGenerate} className="flex-1">
              <Zap className="mr-2 h-4 w-4" />
              Generate Quiz
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
