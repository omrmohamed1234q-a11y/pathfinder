import React, { useState, useEffect } from 'react';
import { X, BookOpen, Video, Code, Brain, Rocket, Zap, MessageSquare, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LessonTab } from './LessonTab';
import { QuizTab } from './QuizTab';
import { AIChatTab } from './AIChatTab';
import { VideoTab } from './content/VideoTab';
import { InteractiveTab } from './content/InteractiveTab';
import { FlashcardTab } from './content/FlashcardTab';
import { ProjectTab } from './content/ProjectTab';
import { ChallengeTab } from './content/ChallengeTab';
import type { SkillNode } from '@/types/skilltree';
import { generateLesson, generateQuiz } from '@/services/aiService';
import type { GeneratedLesson, GeneratedQuiz } from '@/services/aiService';
import { getCachedLesson, cacheLesson, getCachedQuiz, cacheQuiz } from '@/utils/progressStorage';
import { toast } from 'sonner';

interface NodeModalProps {
  node: SkillNode;
  topic: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type TabType = 'lesson' | 'quiz' | 'chat' | 'video' | 'interactive' | 'flashcard' | 'project' | 'challenge';

export const NodeModal: React.FC<NodeModalProps> = ({ node, topic, isOpen, onClose, onComplete }) => {
  // Determine initial tab based on node content type
  const getInitialTab = (): TabType => {
    if (node.contentType) {
      return node.contentType as TabType;
    }
    return 'lesson';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [lessonData, setLessonData] = useState<GeneratedLesson | null>(null);
  const [quizData, setQuizData] = useState<GeneratedQuiz | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Custom quiz state
  const [quizMode, setQuizMode] = useState<'choose' | 'completion' | 'custom-setup' | 'custom-play'>('choose');
  const [customQuizData, setCustomQuizData] = useState<GeneratedQuiz | null>(null);
  const [customQuizLoading, setCustomQuizLoading] = useState(false);
  const [customQuizError, setCustomQuizError] = useState<string | null>(null);
  const [customNumQ, setCustomNumQ] = useState(5);
  const [customDiff, setCustomDiff] = useState<'easy' | 'medium' | 'hard'>('hard');

  // Reset tab when node changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(getInitialTab());
      setQuizMode('choose');
      setCustomQuizData(null);
    }
  }, [node.id, isOpen]);

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load lesson when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const loadLesson = async () => {
      const cached = getCachedLesson(topic, node.id) as GeneratedLesson | null;
      if (cached) { setLessonData(cached); return; }
      setIsLoadingLesson(true);
      setLessonError(null);
      try {
        const result = await generateLesson(node.title, topic);
        setLessonData(result.content);
        cacheLesson(topic, node.id, result.content);
      } catch (error) {
        setLessonError(error instanceof Error ? error.message : 'Failed to load lesson');
      } finally {
        setIsLoadingLesson(false);
      }
    };
    loadLesson();
  }, [isOpen, node.id, node.title, topic]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Completion Quiz (unlocks node)
  const handleTakeCompletionQuiz = async () => {
    setQuizMode('completion');
    setActiveTab('quiz');
    const cached = getCachedQuiz(topic, node.id) as GeneratedQuiz | null;
    if (cached) { setQuizData(cached); return; }
    setIsLoadingQuiz(true);
    setQuizError(null);
    try {
      const result = await generateQuiz(node.title, topic, 5, 'hard', 'multiple_choice');
      setQuizData(result.quiz);
      cacheQuiz(topic, node.id, result.quiz);
    } catch (error) {
      setQuizError(error instanceof Error ? error.message : 'Failed to load quiz');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Custom Quiz (practice, doesn't unlock)
  const handleGenerateCustomQuiz = async () => {
    setCustomQuizLoading(true);
    setCustomQuizError(null);
    try {
      const result = await generateQuiz(node.title, topic, customNumQ, customDiff, 'multiple_choice');
      // Normalize the custom quiz data
      const rawQ = result.quiz?.questions || result.questions || [];
      const normalized = rawQ.map((q: any) => {
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
      setCustomQuizData({ questions: normalized } as GeneratedQuiz);
      setQuizMode('custom-play');
    } catch (error) {
      setCustomQuizError(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setCustomQuizLoading(false);
    }
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed) {
      onComplete();
      onClose();
      setTimeout(() => { setActiveTab(getInitialTab()); setLessonData(null); setQuizData(null); }, 300);
    } else {
      setQuizData(null);
    }
  };

  const handleCustomQuizComplete = (_passed: boolean, _score: number) => {
    // Custom quiz never unlocks the node — just go back to choose
    setQuizMode('choose');
    setCustomQuizData(null);
  };

  const handleRetryLesson = () => {
    setLessonData(null); setLessonError(null); setIsLoadingLesson(true);
    generateLesson(node.title, topic)
      .then(result => { setLessonData(result.content); cacheLesson(topic, node.id, result.content); })
      .catch(e => setLessonError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setIsLoadingLesson(false));
  };

  const handleRetryQuiz = () => {
    setQuizData(null); setQuizError(null); setIsLoadingQuiz(true);
    generateQuiz(node.title, topic, 5, 'hard', 'multiple_choice')
      .then(result => { setQuizData(result.quiz); cacheQuiz(topic, node.id, result.quiz); })
      .catch(e => setQuizError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setIsLoadingQuiz(false));
  };

  // Get available tabs based on node content
  const getAvailableTabs = () => {
    const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
      { id: 'lesson', label: 'Lesson', icon: <BookOpen className="h-4 w-4" /> },
    ];

    // Add content-specific tab if node has special content
    if (node.content) {
      switch (node.content.type) {
        case 'video':
          tabs.push({ id: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> });
          break;
        case 'interactive':
          tabs.push({ id: 'interactive', label: 'Interactive', icon: <Code className="h-4 w-4" /> });
          break;
        case 'flashcard':
          tabs.push({ id: 'flashcard', label: 'Flashcards', icon: <Brain className="h-4 w-4" /> });
          break;
        case 'project':
          tabs.push({ id: 'project', label: 'Project', icon: <Rocket className="h-4 w-4" /> });
          break;
        case 'challenge':
          tabs.push({ id: 'challenge', label: 'Challenge', icon: <Zap className="h-4 w-4" /> });
          break;
      }
    }

    // Always add AI Chat and Quiz tabs
    tabs.push({ id: 'chat', label: 'AI Tutor', icon: <MessageSquare className="h-4 w-4" /> });
    tabs.push({ id: 'quiz', label: 'Quiz', icon: <span>🎯</span> });
    return tabs;
  };

  const availableTabs = getAvailableTabs();

  // Progress flow steps
  const flowSteps = ['Lesson', 'Practice', 'Quiz'];
  const currentStep = activeTab === 'quiz' ? 2 : activeTab === 'chat' || activeTab === 'interactive' || activeTab === 'flashcard' ? 1 : 0;

  const handleTabClick = (tabId: TabType) => {
    if (tabId === 'quiz') {
      setActiveTab('quiz');
      if (quizMode !== 'completion' && quizMode !== 'custom-play' && quizMode !== 'custom-setup') {
        setQuizMode('choose');
      }
    } else {
      setActiveTab(tabId);
    }
  };

  // Render the quiz chooser (two options: Completion Quiz + Custom Quiz)
  const renderQuizChooser = () => (
    <div className="space-y-4 py-4">
      <p className="text-center text-sm font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
        Choose your quiz experience for <span style={{ color: 'var(--duo-green)' }}>{node.title}</span>
      </p>

      {/* Completion Quiz */}
      <button
        onClick={handleTakeCompletionQuiz}
        className="w-full rounded-2xl p-5 text-left transition-all duration-200"
        style={{ background: 'var(--duo-surface)', border: '2px solid var(--duo-border)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--duo-green)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--duo-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--duo-green)', boxShadow: '0 3px 0 var(--duo-green-dark)' }}>
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold" style={{ color: 'var(--duo-text)' }}>
              ⚡ Completion Quiz
            </h3>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--duo-text-muted)' }}>
              5 hard questions • Pass to unlock node • Earn {node.xp} XP
            </p>
          </div>
        </div>
      </button>

      {/* Custom / Practice Quiz */}
      <button
        onClick={() => setQuizMode('custom-setup')}
        className="w-full rounded-2xl p-5 text-left transition-all duration-200"
        style={{ background: 'var(--duo-surface)', border: '2px solid var(--duo-border)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--duo-purple)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--duo-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--duo-purple)', boxShadow: '0 3px 0 #6b21a8' }}>
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold" style={{ color: 'var(--duo-text)' }}>
              🧠 Custom Quiz Studio
            </h3>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--duo-text-muted)' }}>
              Choose # of questions & difficulty • Practice mode • NotebookLM-style
            </p>
          </div>
        </div>
      </button>
    </div>
  );

  // Render custom quiz setup
  const renderCustomSetup = () => (
    <div className="space-y-5 py-2">
      <div className="flex items-center gap-2">
        <button onClick={() => setQuizMode('choose')} className="text-sm font-extrabold" style={{ color: 'var(--duo-text-muted)' }}>
          ← Back
        </button>
        <h3 className="text-base font-extrabold" style={{ color: 'var(--duo-text)' }}>
          Custom Quiz: {node.title}
        </h3>
      </div>

      {/* Number of Questions */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold" style={{ color: 'var(--duo-text-muted)' }}>Questions</span>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 20].map(n => (
            <button key={n} onClick={() => setCustomNumQ(n)}
              className="rounded-xl py-2.5 text-center transition-all text-sm font-extrabold"
              style={{
                background: customNumQ === n ? 'rgba(73, 192, 248, 0.1)' : 'var(--duo-surface)',
                border: `2px solid ${customNumQ === n ? 'var(--duo-blue)' : 'var(--duo-border)'}`,
                color: customNumQ === n ? 'var(--duo-blue)' : 'var(--duo-text)',
              }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold" style={{ color: 'var(--duo-text-muted)' }}>Difficulty</span>
        <div className="grid grid-cols-3 gap-2">
          {([
            { v: 'easy' as const, label: '🌱 Easy' },
            { v: 'medium' as const, label: '⚡ Medium' },
            { v: 'hard' as const, label: '🔥 Hard' },
          ]).map(d => (
            <button key={d.v} onClick={() => setCustomDiff(d.v)}
              className="rounded-xl py-2.5 text-center transition-all text-sm font-extrabold"
              style={{
                background: customDiff === d.v ? 'rgba(255, 200, 0, 0.1)' : 'var(--duo-surface)',
                border: `2px solid ${customDiff === d.v ? 'var(--duo-gold)' : 'var(--duo-border)'}`,
                color: customDiff === d.v ? 'var(--duo-gold)' : 'var(--duo-text)',
              }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {customQuizError && (
        <p className="text-sm font-semibold" style={{ color: 'var(--duo-red, #ff4b4b)' }}>{customQuizError}</p>
      )}

      <button onClick={handleGenerateCustomQuiz} disabled={customQuizLoading}
        className="btn-duo btn-duo-green w-full py-3 text-sm disabled:opacity-50">
        {customQuizLoading ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Generating...</>
        ) : (
          <><Sparkles className="h-4 w-4 mr-2" /> Generate {customNumQ} Questions</>
        )}
      </button>

      <p className="text-xs text-center font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
        Practice mode — does not affect your progress or XP
      </p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(19, 31, 36, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-modal-slide-up flex flex-col"
        style={{
          background: 'var(--duo-bg)',
          border: '1.5px solid var(--duo-border)',
          borderRadius: '24px 24px 0 0',
          ...(window.innerWidth >= 640 ? { borderRadius: '24px' } : {}),
        }}
      >
        {/* Progress Flow */}
        <div className="flex items-center justify-center gap-2 px-5 pt-4 pb-2">
          {flowSteps.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300"
                  style={{
                    background: i <= currentStep ? 'var(--duo-green)' : 'var(--duo-surface)',
                    color: i <= currentStep ? 'white' : 'var(--duo-text-muted)',
                    border: i <= currentStep ? 'none' : '1.5px solid var(--duo-border)',
                    boxShadow: i <= currentStep ? '0 2px 0 var(--duo-green-dark)' : 'none',
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="text-[11px] font-extrabold hidden sm:inline"
                  style={{ color: i <= currentStep ? 'var(--duo-green)' : 'var(--duo-text-muted)' }}
                >
                  {step}
                </span>
              </div>
              {i < flowSteps.length - 1 && (
                <div
                  className="w-8 h-0.5 rounded-full transition-colors duration-300"
                  style={{ background: i < currentStep ? 'var(--duo-green)' : 'var(--duo-border)' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1.5px solid var(--duo-border)' }}>
          {/* Node Thumbnail */}
          <div
            className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--duo-green), var(--duo-blue))' }}
          >
            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">
              {node.level <= 1 ? '🌱' : node.level <= 2 ? '📘' : node.level <= 3 ? '⚡' : node.level <= 4 ? '🔥' : node.level <= 5 ? '💎' : '🏆'}
            </div>
          </div>

          {/* Title + Meta */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold truncate" style={{ color: 'var(--duo-text)' }}>{node.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span
                className="px-2 py-0.5 rounded-lg font-extrabold"
                style={{ background: 'rgba(88, 204, 2, 0.1)', color: 'var(--duo-green)' }}
              >
                Level {node.level}
              </span>
              <span className="flex items-center gap-1 font-extrabold" style={{ color: 'var(--duo-gold)' }}>
                <Star className="h-3 w-3 fill-current" />
                {node.xp} XP
              </span>
              <span className="font-bold truncate" style={{ color: 'var(--duo-text-muted)' }}>{topic}</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--duo-red)'; e.currentTarget.style.color = 'var(--duo-red)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--duo-border)'; e.currentTarget.style.color = 'var(--duo-text-muted)'; }}
          >
            <X className="h-4 w-4" style={{ color: 'inherit' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto" style={{ borderBottom: '1.5px solid var(--duo-border)' }}>
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="relative px-5 py-3 font-extrabold transition-colors duration-200 flex items-center gap-2 whitespace-nowrap text-sm"
              style={{
                color: activeTab === tab.id ? 'var(--duo-green)' : 'var(--duo-text-muted)',
                background: activeTab === tab.id ? 'rgba(88, 204, 2, 0.05)' : 'transparent',
              }}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full"
                  style={{ background: 'var(--duo-green)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'lesson' && (
            <>
              {isLoadingLesson && <LoadingState message="Loading lesson..." />}
              {lessonError && <ErrorMessage message={lessonError} onRetry={handleRetryLesson} />}
              {lessonData && !isLoadingLesson && !lessonError && <LessonTab lessonData={lessonData} onTakeQuiz={() => { setActiveTab('quiz'); setQuizMode('choose'); }} />}
            </>
          )}
          {activeTab === 'chat' && (
            <AIChatTab nodeTitle={node.title} topic={topic} />
          )}
          {activeTab === 'quiz' && (
            <>
              {/* Quiz Chooser */}
              {quizMode === 'choose' && renderQuizChooser()}

              {/* Completion Quiz */}
              {quizMode === 'completion' && (
                <>
                  {isLoadingQuiz && <LoadingState message="Generating completion quiz..." />}
                  {quizError && <ErrorMessage message={quizError} onRetry={handleRetryQuiz} />}
                  {quizData && !isLoadingQuiz && !quizError && <QuizTab quizData={quizData} nodeXP={node.xp} onComplete={handleQuizComplete} />}
                </>
              )}

              {/* Custom Quiz Setup */}
              {quizMode === 'custom-setup' && renderCustomSetup()}

              {/* Custom Quiz Play */}
              {quizMode === 'custom-play' && customQuizData && (
                <QuizTab quizData={customQuizData} nodeXP={0} onComplete={handleCustomQuizComplete} />
              )}
            </>
          )}
          {activeTab === 'video' && node.content?.type === 'video' && (
            <VideoTab content={node.content} />
          )}
          {activeTab === 'interactive' && node.content?.type === 'interactive' && (
            <InteractiveTab content={node.content} />
          )}
          {activeTab === 'flashcard' && node.content?.type === 'flashcard' && (
            <FlashcardTab content={node.content} />
          )}
          {activeTab === 'project' && node.content?.type === 'project' && (
            <ProjectTab content={node.content} />
          )}
          {activeTab === 'challenge' && node.content?.type === 'challenge' && (
            <ChallengeTab content={node.content} />
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="text-base font-semibold">{message}</p>
    <p className="text-sm text-muted-foreground">AI is crafting content just for you...</p>
  </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="text-6xl">😵</div>
    <p className="text-base text-destructive font-semibold">{message}</p>
    <Button onClick={onRetry} variant="outline">Try Again</Button>
  </div>
);
