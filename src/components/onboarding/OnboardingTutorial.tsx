import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Zap, MessageSquare, Map, Search, Target } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const ONBOARDING_KEY = 'pathfinder_onboarding_completed';

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Pathfinder! 🎉',
    description: 'Transform any topic into an interactive RPG skill tree. Learn anything through gamified, AI-powered lessons.',
    icon: <Sparkles style={{ width: '32px', height: '32px', color: 'var(--duo-green)' }} />,
    position: 'center'
  },
  {
    id: 'create-tree',
    title: 'Create Your First Skill Tree',
    description: 'Type any topic you want to learn (e.g., "React", "Python", "Photography") and hit Enter. Our AI will generate a complete learning path.',
    icon: <Zap style={{ width: '32px', height: '32px', color: 'var(--duo-green)' }} />,
    targetElement: 'input[placeholder*="topic"]',
    position: 'bottom'
  },
  {
    id: 'nodes',
    title: 'Unlock Nodes & Learn',
    description: 'Each node is a lesson. Click to open, read the content, take quizzes, and earn XP. Complete nodes to unlock the next ones!',
    icon: <Target style={{ width: '32px', height: '32px', color: 'var(--duo-green)' }} />,
    position: 'center'
  },
  {
    id: 'ai-tutor',
    title: 'AI Chat Tutor',
    description: 'Stuck? Click the "AI Tutor" tab in any node. Ask questions, get examples, or generate practice problems. It\'s like having a personal teacher!',
    icon: <MessageSquare style={{ width: '32px', height: '32px', color: 'var(--duo-green)' }} />,
    position: 'center'
  },
  {
    id: 'career-paths',
    title: 'Follow Career Paths',
    description: 'Want structured learning? Check out Career Paths on the homepage. They combine multiple trees into guided journeys like "Full-Stack Developer".',
    icon: <Map style={{ width: '32px', height: '32px', color: 'var(--duo-green)' }} />,
    position: 'center'
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts ⌨️',
    description: 'Press Cmd+K (or Ctrl+K) anytime to open global search. Navigate with arrow keys, press Enter to select. Work faster!',
    icon: <Search style={{ width: '32px', height: '32px', color: 'var(--duo-green)' }} />,
    position: 'center'
  }
];

export const OnboardingTutorial: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const step = steps[currentStep];
    if (step.targetElement) {
      const element = document.querySelector(step.targetElement);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}>
        {spotlightRect && (
          <div
            style={{
              position: 'absolute',
              top: spotlightRect.top - 8,
              left: spotlightRect.left - 8,
              width: spotlightRect.width + 16,
              height: spotlightRect.height + 16,
              border: '4px solid var(--duo-green)',
              borderRadius: '8px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              animation: 'pulse 2s infinite'
            }}
          />
        )}
      </div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'none' }}>
        <div style={{ background: 'var(--duo-surface)', border: '2px solid var(--duo-border)', borderRadius: '16px', padding: '32px', maxWidth: '512px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', pointerEvents: 'auto', position: 'relative' }}>
          <button
            onClick={handleComplete}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--duo-surface)', border: '1px solid var(--duo-border)', borderRadius: '50%', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--duo-border)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--duo-surface)'}
            aria-label="Skip tutorial"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--duo-border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--duo-green)', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ background: 'var(--duo-surface)', border: '1px solid var(--duo-border)', borderRadius: '50%', padding: '16px' }}>
              {step.icon}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', background: 'linear-gradient(135deg, var(--duo-green), var(--duo-text))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {step.title}
            </h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.8 }}>
              {step.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                style={{ flex: 1, padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--duo-border)', background: 'transparent', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--duo-surface)'; e.currentTarget.style.borderColor = 'var(--duo-green)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--duo-border)'; }}
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              style={{ flex: 1, padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--duo-green)', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {currentStep === steps.length - 1 ? (
                <>Get Started <Sparkles style={{ width: '16px', height: '16px' }} /></>
              ) : (
                <>Next <ArrowRight style={{ width: '16px', height: '16px' }} /></>
              )}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={handleComplete}
              style={{ fontSize: '14px', color: 'var(--duo-text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--duo-text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--duo-text-muted)'}
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const restartOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
  window.location.reload();
};
