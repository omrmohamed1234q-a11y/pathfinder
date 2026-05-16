import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, ArrowRight, BookOpen, Map, Trophy, Brain, Target } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar } from '@/components/layouts/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { SignInModal } from '@/components/auth/SignInModal';
import { generateCustomCareerPath } from '@/utils/personalizedPaths';

export const CareerPathGeneratorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialGoal = searchParams.get('goal') || '';
  const [goal, setGoal] = useState(initialGoal);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Auto-generate if goal is provided in URL
  useEffect(() => {
    if (initialGoal && !isGenerating) {
      handleGenerate();
    }
  }, [initialGoal]);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      toast.error('Please enter a career goal');
      return;
    }

    // Guest Limit Check
    if (!user) {
      const guestPaths = parseInt(localStorage.getItem('guest_paths_created') || '0');
      if (guestPaths >= 1) {
        setShowSignInModal(true);
        return;
      }
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const result = await generateCustomCareerPath(goal.trim());
      
      if (!result) {
        throw new Error("Failed to generate career path");
      }
      
      clearInterval(progressInterval);
      setProgress(100);

      // Save to localStorage
      const existingPaths = JSON.parse(localStorage.getItem('custom_career_paths') || '{}');
      existingPaths[result.id] = result;
      localStorage.setItem('custom_career_paths', JSON.stringify(existingPaths));
      
      // Track guest usage
      if (!user) {
        const guestPaths = parseInt(localStorage.getItem('guest_paths_created') || '0');
        localStorage.setItem('guest_paths_created', (guestPaths + 1).toString());
      }

      toast.success('Career path generated successfully!');
      
      // Navigate to the career path page
      setTimeout(() => {
        navigate(`/career-path/${result.id}`);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error generating career path:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate career path';
      toast.error(errorMessage);
      
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleGenerate();
    }
  };

  const exampleGoals = [
    { label: 'Full Stack Developer', icon: '💻' },
    { label: 'Data Scientist', icon: '📊' },
    { label: 'UI/UX Designer', icon: '🎨' },
    { label: 'Mobile App Developer', icon: '📱' },
    { label: 'DevOps Engineer', icon: '⚙️' },
    { label: 'Cybersecurity Analyst', icon: '🛡️' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--duo-bg)' }}>
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--duo-blue)', boxShadow: '0 5px 0 var(--duo-blue-dark)' }}
            >
              <Map className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black" style={{ color: 'var(--duo-text)' }}>
            Custom Career Path Generator
          </h1>
          <p className="text-lg font-semibold max-w-2xl mx-auto" style={{ color: 'var(--duo-text-muted)' }}>
            Enter your dream role and AI will build a personalized curriculum spanning multiple skill trees
          </p>
        </div>

        {/* Generator Card */}
        <div
          className="rounded-2xl p-8 mb-8 space-y-6"
          style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" style={{ color: 'var(--duo-blue)' }} />
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--duo-text)' }}>What is your career goal?</h2>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
              Enter a job title or goal, and we'll create a step-by-step learning journey
            </p>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="e.g., Become a Data Scientist, Master AWS Cloud..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isGenerating}
                className="w-full px-5 py-4 rounded-xl text-base font-semibold outline-none transition-all duration-200"
                style={{
                  background: 'var(--duo-bg)',
                  border: '2px solid var(--duo-border)',
                  color: 'var(--duo-text)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--duo-blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(73, 192, 248, 0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--duo-border)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !goal.trim()}
              className="btn-duo btn-duo-blue px-6 py-4 text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              style={!isGenerating && goal.trim() ? { background: 'var(--duo-blue)', color: 'white', borderBottom: '4px solid var(--duo-blue-dark)', borderRadius: '12px', fontWeight: '800' } : {}}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Path
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold" style={{ color: 'var(--duo-text-muted)' }}>Designing your curriculum...</span>
                <span className="font-extrabold" style={{ color: 'var(--duo-blue)' }}>{progress}%</span>
              </div>
              <div className="progress-duo">
                <div className="progress-duo-fill" style={{ width: `${progress}%`, background: 'var(--duo-blue)' }} />
              </div>
              <p className="text-xs text-center font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                This takes a few seconds as AI designs multiple trees...
              </p>
            </div>
          )}

          {/* Example Topics */}
          {!isGenerating && (
            <div className="space-y-3">
              <p className="text-sm font-extrabold" style={{ color: 'var(--duo-text-muted)' }}>
                Try these examples:
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleGoals.map((example) => (
                  <button
                    key={example.label}
                    onClick={() => setGoal(example.label)}
                    className="suggestion-chip text-sm font-bold"
                  >
                    <span className="mr-1.5">{example.icon}</span>
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: <Map className="h-6 w-6" />,
              color: 'var(--duo-blue)',
              colorDark: 'var(--duo-blue-dark)',
              title: 'Full Journey',
              emoji: '🗺️',
              description: 'Generates a complete roadmap containing multiple separate skill trees',
            },
            {
              icon: <Brain className="h-6 w-6" />,
              color: 'var(--duo-purple)',
              colorDark: 'var(--duo-purple-dark)',
              title: 'Expert Level',
              emoji: '🎓',
              description: 'Guides you from absolute beginner to job-ready professional',
            },
            {
              icon: <BookOpen className="h-6 w-6" />,
              color: 'var(--duo-green)',
              colorDark: 'var(--duo-green-dark)',
              title: 'Step by Step',
              emoji: '🪜',
              description: 'Each step contains its own deep-dive curriculum to master',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl p-6 space-y-3 transition-all duration-200"
              style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = feature.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--duo-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${feature.color}15` }}
              >
                <span className="text-2xl">{feature.emoji}</span>
              </div>
              <h3 className="text-lg font-extrabold" style={{ color: 'var(--duo-text)' }}>{feature.title}</h3>
              <p className="text-sm font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}
    </div>
  );
};
