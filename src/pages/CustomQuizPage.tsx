import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layouts/Navbar';
import { AnimatedBackground } from '@/components/landing/AnimatedBackground';
import { generateQuiz } from '@/services/aiService';
import { playCorrectSound, playWrongSound } from '@/utils/soundEffects';
import { 
  Brain, Sparkles, Loader2, ArrowRight, ArrowLeft, RotateCcw, 
  CheckCircle2, XCircle, Zap, Trophy, Target, BookOpen, Home
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export const CustomQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';

  // Setup state
  const [topic, setTopic] = useState(initialTopic);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('hard');
  const [phase, setPhase] = useState<'setup' | 'loading' | 'quiz' | 'results'>('setup');
  
  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic first!'); return; }
    setPhase('loading');
    
    try {
      const result = await generateQuiz(topic.trim(), topic.trim(), numQuestions, difficulty, 'multiple_choice');
      
      // Normalize questions
      const rawQ = result.quiz?.questions || result.questions || [];
      const normalized: QuizQuestion[] = rawQ.map((q: any) => {
        if (q.options?.length > 0 && typeof q.options[0] === 'object' && q.options[0].text) {
          return {
            question: q.question,
            options: q.options.map((o: any) => o.text),
            correct_answer: q.correct_answer ?? q.options.findIndex((o: any) => o.correct),
            explanation: q.explanation || '',
          };
        }
        return q;
      });
      
      setQuestions(normalized);
      setCurrentIdx(0);
      setSelectedOption(null);
      setChecked(false);
      setAnswers([]);
      setStreak(0);
      setMaxStreak(0);
      setPhase('quiz');
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast.error('Failed to generate quiz — please try again');
      setPhase('setup');
    }
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === questions[currentIdx].correct_answer;
    setChecked(true);
    setAnswers(prev => [...prev, correct]);
    if (correct) {
      playCorrectSound();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      playWrongSound();
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setChecked(false);
    } else {
      setPhase('results');
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setChecked(false);
    setAnswers([]);
    setStreak(0);
    setMaxStreak(0);
    setPhase('quiz');
  };

  const handleNewQuiz = () => {
    setPhase('setup');
    setQuestions([]);
    setAnswers([]);
  };

  const correctCount = answers.filter(Boolean).length;
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  // Setup Phase
  if (phase === 'setup') {
    return (
      <div className="min-h-screen relative" style={{ background: 'var(--duo-bg)' }}>
        <AnimatedBackground topic={topic} />
        <Navbar />
        <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10 space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--duo-purple)', boxShadow: '0 5px 0 #6b21a8' }}>
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black" style={{ color: 'var(--duo-text)' }}>
              Custom Quiz Studio
            </h1>
            <p className="text-lg font-semibold max-w-2xl mx-auto" style={{ color: 'var(--duo-text-muted)' }}>
              NotebookLM-style deep testing — generate expert-level quizzes on any topic
            </p>
          </div>

          {/* Quiz Builder Card */}
          <div className="rounded-2xl p-8 space-y-8"
            style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}>
            
            {/* Topic Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" style={{ color: 'var(--duo-green)' }} />
                <label className="text-lg font-extrabold" style={{ color: 'var(--duo-text)' }}>Topic</label>
              </div>
              <input
                type="text"
                placeholder="e.g., Quantum Entanglement, React Hooks, Renaissance Art..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                className="w-full px-5 py-4 rounded-xl text-base font-semibold outline-none transition-all duration-200"
                style={{ background: 'var(--duo-bg)', border: '2px solid var(--duo-border)', color: 'var(--duo-text)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--duo-green)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(88, 204, 2, 0.15)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--duo-border)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Number of Questions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" style={{ color: 'var(--duo-blue)' }} />
                <span className="text-sm font-extrabold" style={{ color: 'var(--duo-text)' }}>Questions</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button key={n} onClick={() => setNumQuestions(n)}
                    className="rounded-xl p-3 text-center transition-all duration-200"
                    style={{
                      background: numQuestions === n ? 'rgba(73, 192, 248, 0.1)' : 'var(--duo-bg)',
                      border: `2px solid ${numQuestions === n ? 'var(--duo-blue)' : 'var(--duo-border)'}`,
                    }}>
                    <span className="text-lg font-extrabold" style={{ color: numQuestions === n ? 'var(--duo-blue)' : 'var(--duo-text)' }}>
                      {n}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: 'var(--duo-gold)' }} />
                <span className="text-sm font-extrabold" style={{ color: 'var(--duo-text)' }}>Difficulty</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'easy' as const, label: 'Easy', emoji: '🌱', desc: 'Recall & basics' },
                  { value: 'medium' as const, label: 'Medium', emoji: '⚡', desc: 'Application' },
                  { value: 'hard' as const, label: 'Hard', emoji: '🔥', desc: 'Expert-level' },
                ]).map(d => (
                  <button key={d.value} onClick={() => setDifficulty(d.value)}
                    className="rounded-xl p-4 text-left transition-all duration-200"
                    style={{
                      background: difficulty === d.value ? 'rgba(255, 200, 0, 0.1)' : 'var(--duo-bg)',
                      border: `2px solid ${difficulty === d.value ? 'var(--duo-gold)' : 'var(--duo-border)'}`,
                    }}>
                    <div className="text-xl mb-1">{d.emoji}</div>
                    <div className="text-sm font-extrabold" style={{ color: difficulty === d.value ? 'var(--duo-gold)' : 'var(--duo-text)' }}>
                      {d.label}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--duo-text-muted)' }}>{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={!topic.trim()}
              className="btn-duo btn-duo-green w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Quiz
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading Phase
  if (phase === 'loading') {
    return (
      <div className="min-h-screen relative" style={{ background: 'var(--duo-bg)' }}>
        <AnimatedBackground topic={topic} />
        <Navbar />
        <div className="relative z-10 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
              style={{ background: 'var(--duo-surface)', border: '2px solid var(--duo-border)' }}>
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--duo-green)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--duo-text)' }}>Generating your quiz...</h2>
              <p className="text-sm font-semibold mt-2" style={{ color: 'var(--duo-text-muted)' }}>
                Creating {numQuestions} {difficulty} questions about {topic}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Phase
  if (phase === 'results') {
    const grade = scorePercent >= 90 ? 'S' : scorePercent >= 80 ? 'A' : scorePercent >= 70 ? 'B' : scorePercent >= 60 ? 'C' : 'F';
    const gradeColor = scorePercent >= 80 ? 'var(--duo-green)' : scorePercent >= 60 ? 'var(--duo-gold)' : 'var(--duo-red, #ff4b4b)';
    
    return (
      <div className="min-h-screen relative" style={{ background: 'var(--duo-bg)' }}>
        <AnimatedBackground topic={topic} />
        <Navbar />
        <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
          <div className="rounded-2xl p-8 space-y-8"
            style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}>
            
            {/* Score Header */}
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl font-black"
                style={{ background: `${gradeColor}20`, border: `3px solid ${gradeColor}`, color: gradeColor }}>
                {grade}
              </div>
              <h2 className="text-3xl font-black" style={{ color: 'var(--duo-text)' }}>
                {scorePercent >= 80 ? '🎉 Excellent!' : scorePercent >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
              </h2>
              <p className="text-lg font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                {correctCount}/{questions.length} correct • {scorePercent}% accuracy
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Score', value: `${scorePercent}%`, icon: <Trophy className="h-5 w-5" />, color: 'var(--duo-gold)' },
                { label: 'Best Streak', value: `${maxStreak}🔥`, icon: <Zap className="h-5 w-5" />, color: 'var(--duo-green)' },
                { label: 'Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), icon: <Target className="h-5 w-5" />, color: 'var(--duo-blue)' },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl p-4 text-center"
                  style={{ background: 'var(--duo-bg)', border: '1.5px solid var(--duo-border)' }}>
                  <div className="flex justify-center mb-2" style={{ color: stat.color }}>{stat.icon}</div>
                  <div className="text-xl font-black" style={{ color: 'var(--duo-text)' }}>{stat.value}</div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--duo-text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Question Review */}
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold" style={{ color: 'var(--duo-text)' }}>Review</h3>
              {questions.map((q, idx) => (
                <div key={idx} className="rounded-xl p-4 flex items-start gap-3"
                  style={{ background: 'var(--duo-bg)', borderLeft: `4px solid ${answers[idx] ? 'var(--duo-green)' : 'var(--duo-red, #ff4b4b)'}` }}>
                  {answers[idx] 
                    ? <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--duo-green)' }} />
                    : <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--duo-red, #ff4b4b)' }} />
                  }
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--duo-text)' }}>{q.question}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: 'var(--duo-text-muted)' }}>
                      ✅ {q.options[q.correct_answer]}
                    </p>
                    {q.explanation && (
                      <p className="text-xs mt-1" style={{ color: 'var(--duo-text-muted)' }}>💡 {q.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={handleRestart} className="btn-duo px-4 py-3 text-sm"
                style={{ background: 'var(--duo-surface)', border: '2px solid var(--duo-border)', color: 'var(--duo-text)' }}>
                <RotateCcw className="h-4 w-4 mr-1" /> Retry
              </button>
              <button onClick={handleNewQuiz} className="btn-duo btn-duo-blue px-4 py-3 text-sm">
                <Sparkles className="h-4 w-4 mr-1" /> New Quiz
              </button>
              <button onClick={() => navigate('/')} className="btn-duo btn-duo-green px-4 py-3 text-sm">
                <Home className="h-4 w-4 mr-1" /> Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Phase
  const q = questions[currentIdx];
  const progress = ((currentIdx + (checked ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: 'var(--duo-bg)' }}>
      <AnimatedBackground topic={topic} />
      <Navbar />
      
      <div className="relative z-10 flex-1 flex flex-col container mx-auto px-4 py-6 max-w-3xl">
        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-sm font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
            <span>Question {currentIdx + 1}/{questions.length}</span>
            <div className="flex items-center gap-3">
              {streak > 0 && <span style={{ color: 'var(--duo-gold)' }}>{streak}🔥</span>}
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--duo-border)' }}>
            <div className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: 'var(--duo-green)' }} />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl p-8 mb-6 flex-1"
          style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}>
          
          <h2 className="text-xl md:text-2xl font-black mb-8 leading-relaxed" style={{ color: 'var(--duo-text)' }}>
            {q.question}
          </h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = checked && i === q.correct_answer;
              const isWrong = checked && isSelected && i !== q.correct_answer;
              const label = String.fromCharCode(65 + i);

              return (
                <button key={i} onClick={() => !checked && setSelectedOption(i)} disabled={checked}
                  className="w-full rounded-2xl px-5 py-4 text-left flex items-center gap-4 transition-all duration-200"
                  style={{
                    background: isCorrect ? 'rgba(88, 204, 2, 0.1)' : isWrong ? 'rgba(255, 75, 75, 0.1)' : isSelected ? 'rgba(88, 204, 2, 0.05)' : 'var(--duo-bg)',
                    border: `2px solid ${isCorrect ? 'var(--duo-green)' : isWrong ? 'var(--duo-red, #ff4b4b)' : isSelected ? 'var(--duo-green)' : 'var(--duo-border)'}`,
                    opacity: checked && !isSelected && !isCorrect ? 0.4 : 1,
                    color: 'var(--duo-text)',
                  }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm"
                    style={{
                      background: isCorrect ? 'var(--duo-green)' : isWrong ? 'var(--duo-red, #ff4b4b)' : isSelected ? 'var(--duo-green)' : 'var(--duo-bg)',
                      color: (isCorrect || isWrong || isSelected) ? 'white' : 'var(--duo-text)',
                      border: `2px solid ${isCorrect ? 'var(--duo-green)' : isWrong ? 'var(--duo-red, #ff4b4b)' : isSelected ? 'var(--duo-green)' : 'var(--duo-border)'}`,
                    }}>
                    {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : isWrong ? <XCircle className="h-5 w-5" /> : label}
                  </div>
                  <span className="font-semibold text-base">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Bar */}
        {!checked ? (
          <div className="rounded-2xl p-4"
            style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}>
            <button onClick={handleCheck} disabled={selectedOption === null}
              className="btn-duo btn-duo-green w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed">
              Check Answer
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-4"
            style={{
              background: answers[answers.length - 1] ? 'rgba(88, 204, 2, 0.15)' : 'rgba(255, 75, 75, 0.15)',
              border: `1.5px solid ${answers[answers.length - 1] ? 'var(--duo-green)' : 'var(--duo-red, #ff4b4b)'}`,
            }}>
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <h4 className="text-lg font-black" style={{ color: answers[answers.length - 1] ? 'var(--duo-green)' : 'var(--duo-red, #ff4b4b)' }}>
                  {answers[answers.length - 1] ? '✅ Correct!' : '❌ Not quite!'}
                </h4>
                {q.explanation && (
                  <p className="text-sm font-semibold mt-1" style={{ color: 'var(--duo-text-muted)' }}>{q.explanation}</p>
                )}
              </div>
              <button onClick={handleNext} className="btn-duo btn-duo-green px-6 py-3 flex-shrink-0">
                {currentIdx < questions.length - 1 ? 'Next' : 'Finish'} <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
