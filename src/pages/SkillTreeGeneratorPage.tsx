import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, ArrowRight, Search, Layers, BookOpen, Trophy, Brain, GraduationCap, Gamepad2 } from 'lucide-react';
import { generateSkillTree } from '@/services/aiService';
import { canPerformAction, trackUsage } from '@/services/stripeService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar } from '@/components/layouts/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { SignInModal } from '@/components/auth/SignInModal';

export const SkillTreeGeneratorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';
  const [topic, setTopic] = useState(initialTopic);
  const [nodeCount, setNodeCount] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [statusText, setStatusText] = useState('Initializing...');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (initialTopic && !isGenerating) {
      handleGenerate();
    }
  }, [initialTopic]);

  useEffect(() => {
    if (!isGenerating) return;
    const msgs = [
      'Analyzing topic structure...',
      'Mapping prerequisite dependencies...',
      'Generating lesson content...',
      'Building quiz questions...',
      'Optimizing learning path...',
      'Finalizing curriculum...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % msgs.length;
      setStatusText(msgs[i]);
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    try {
      const { allowed, reason } = await canPerformAction('user-id', 'create_skill_tree');
      if (!allowed) {
        toast.error(reason || 'Subscription limit reached', {
          action: { label: 'Upgrade', onClick: () => navigate('/pricing') },
        });
        return;
      }
    } catch {
      // continue
    }

    if (!user) {
      const guestTrees = parseInt(localStorage.getItem('guest_trees_created') || '0');
      if (guestTrees >= 1) {
        setShowSignInModal(true);
        return;
      }
    }

    setIsGenerating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) { clearInterval(progressInterval); return 92; }
        return prev + Math.random() * 6 + 2;
      });
    }, 700);

    try {
      const result = await generateSkillTree(topic.trim(), nodeCount);
      clearInterval(progressInterval);
      setProgress(100);

      try {
        await trackUsage('user-id', 'skill_tree');
        if (!user) {
          const g = parseInt(localStorage.getItem('guest_trees_created') || '0');
          localStorage.setItem('guest_trees_created', (g + 1).toString());
        }
      } catch {}

      toast.success('Skill tree generated successfully!');
      setTimeout(() => navigate(`/skill-tree/${result.tree_id}`), 400);
    } catch (error) {
      clearInterval(progressInterval);
      const msg = error instanceof Error ? error.message : 'Failed to generate skill tree';
      toast.error(msg);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) handleGenerate();
  };

  const topics = [
    'Python Programming',
    'Web Development',
    'Machine Learning',
    'Digital Marketing',
    'Data Structures',
    'System Design',
    'Cybersecurity',
    'Cloud Computing',
  ];

  const sizes = [
    { value: 0, label: 'Auto', sub: 'AI decides' },
    { value: 8, label: 'Compact', sub: '8 nodes' },
    { value: 14, label: 'Standard', sub: '14 nodes' },
    { value: 18, label: 'Comprehensive', sub: '18 nodes' },
  ];

  // --- GENERATING STATE ---
  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--duo-bg)' }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-10">
            {/* Spinner */}
            <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}>
              <Loader2 className="h-9 w-9 animate-spin" style={{ color: 'var(--duo-green)' }} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black" style={{ color: 'var(--duo-text)' }}>
                Generating Skill Tree
              </h2>
              <p className="text-sm font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                {topic}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-3 px-4">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--duo-surface)', border: '1px solid var(--duo-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%`, background: 'var(--duo-green)' }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--duo-text-muted)' }}>
                <span>{statusText}</span>
                <span style={{ color: 'var(--duo-green)' }}>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN PAGE ---
  return (
    <div className="min-h-screen" style={{ background: 'var(--duo-bg)' }}>
      <Navbar />

      <div className="container mx-auto px-4 pt-14 pb-20 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--duo-text)' }}>
            Skill Tree Generator
          </h1>
          <p className="text-sm font-semibold max-w-md mx-auto" style={{ color: 'var(--duo-text-muted)' }}>
            Enter any topic to generate a structured, interactive learning curriculum powered by AI.
          </p>
        </div>

        {/* Generator */}
        <div
          className="rounded-2xl overflow-hidden mb-8"
          style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}
        >
          <div className="p-6 space-y-5">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5" style={{ color: 'var(--duo-text-muted)', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search any topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold outline-none transition-all duration-200"
                style={{ background: 'var(--duo-bg)', border: '2px solid var(--duo-border)', color: 'var(--duo-text)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--duo-green)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--duo-border)'; }}
              />
            </div>

            {/* Size selector */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--duo-text-muted)' }}>
                Depth
              </span>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map(s => {
                  const sel = nodeCount === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setNodeCount(s.value)}
                      className="rounded-lg py-2.5 px-2 text-center transition-all duration-150"
                      style={{
                        background: sel ? 'rgba(88, 204, 2, 0.08)' : 'var(--duo-bg)',
                        border: `1.5px solid ${sel ? 'var(--duo-green)' : 'var(--duo-border)'}`,
                      }}
                    >
                      <div className="text-xs font-extrabold" style={{ color: sel ? 'var(--duo-green)' : 'var(--duo-text)' }}>
                        {s.label}
                      </div>
                      <div className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--duo-text-muted)' }}>
                        {s.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!topic.trim()}
              className="w-full py-3.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'var(--duo-green)',
                color: '#fff',
                borderBottom: '4px solid var(--duo-green-dark)',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Generate Skill Tree
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--duo-border)' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--duo-text-muted)' }}>or try</span>
              <div className="flex-1 h-px" style={{ background: 'var(--duo-border)' }} />
            </div>

            {/* Topic chips */}
            <div className="flex flex-wrap gap-2">
              {topics.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                  style={{
                    background: topic === t ? 'rgba(88, 204, 2, 0.08)' : 'transparent',
                    border: `1.5px solid ${topic === t ? 'var(--duo-green)' : 'var(--duo-border)'}`,
                    color: topic === t ? 'var(--duo-green)' : 'var(--duo-text-muted)',
                  }}
                  onMouseEnter={(e) => { if (topic !== t) e.currentTarget.style.borderColor = 'var(--duo-text-muted)'; }}
                  onMouseLeave={(e) => { if (topic !== t) e.currentTarget.style.borderColor = 'var(--duo-border)'; }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--duo-text-muted)' }}>
            How it works
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { icon: <Layers className="h-4.5 w-4.5" />, title: 'Structured Nodes', desc: 'Multi-level branching tree with prerequisite tracking' },
              { icon: <BookOpen className="h-4.5 w-4.5" />, title: 'Lessons & Quizzes', desc: 'Each node contains AI-generated educational content' },
              { icon: <Trophy className="h-4.5 w-4.5" />, title: 'XP Progression', desc: 'Gamified progress tracking with achievements' },
            ].map(f => (
              <div
                key={f.title}
                className="rounded-xl p-4 space-y-2"
                style={{ background: 'var(--duo-surface)', border: '1px solid var(--duo-border)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(88, 204, 2, 0.08)', color: 'var(--duo-green)' }}>
                  {f.icon}
                </div>
                <h4 className="text-sm font-extrabold" style={{ color: 'var(--duo-text)' }}>{f.title}</h4>
                <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--duo-text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Other tools */}
        <div className="grid md:grid-cols-2 gap-3">
          <div
            className="rounded-xl p-4 cursor-pointer transition-all duration-150 group"
            style={{ background: 'var(--duo-surface)', border: '1px solid var(--duo-border)' }}
            onClick={() => navigate('/generate-path')}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--duo-blue)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--duo-border)'; }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--duo-blue)', color: '#fff' }}>
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: 'var(--duo-text)' }}>Career Paths</div>
                  <div className="text-[11px] font-semibold" style={{ color: 'var(--duo-text-muted)' }}>Multi-tree curriculum builder</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--duo-text-muted)' }} />
            </div>
          </div>

          <div
            className="rounded-xl p-4 cursor-pointer transition-all duration-150 group"
            style={{ background: 'var(--duo-surface)', border: '1px solid var(--duo-border)' }}
            onClick={() => navigate('/quiz')}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--duo-purple)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--duo-border)'; }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--duo-purple)', color: '#fff' }}>
                  <Gamepad2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: 'var(--duo-text)' }}>Quiz Studio</div>
                  <div className="text-[11px] font-semibold" style={{ color: 'var(--duo-text-muted)' }}>Custom AI-generated quizzes</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--duo-text-muted)' }} />
            </div>
          </div>
        </div>
      </div>

      <SignInModal open={showSignInModal} onOpenChange={setShowSignInModal} />
    </div>
  );
};
