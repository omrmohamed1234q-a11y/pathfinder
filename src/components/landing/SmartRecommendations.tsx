import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Sparkles, Target, ArrowRight, Code, FileCode2, Bot, Triangle, RefreshCw, Server, Globe, Brain, Palette, Wand2, LayoutTemplate } from 'lucide-react';
import { getTopicProgress, getCompletedTopics } from '@/utils/progressStorage';

interface Recommendation {
  title: string;
  description: string;
  reason: string;
  icon: React.ReactNode;
  category: 'trending' | 'related' | 'skill-gap';
}

export const SmartRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    const completedTopics = await getCompletedTopics();
    const recs: Recommendation[] = [];

    // Trending topics (always show these)
    const trending: Recommendation[] = [
      {
        title: 'React Hooks',
        description: 'Master modern React development',
        reason: 'Hot topic in 2026',
        icon: <Code className="h-6 w-6" />,
        category: 'trending'
      },
      {
        title: 'TypeScript',
        description: 'Type-safe JavaScript development',
        reason: 'Industry standard',
        icon: <FileCode2 className="h-6 w-6" />,
        category: 'trending'
      },
      {
        title: 'AI Prompt Engineering',
        description: 'Craft effective AI prompts',
        reason: 'Fastest growing skill',
        icon: <Bot className="h-6 w-6" />,
        category: 'trending'
      }
    ];

    // Related topics based on completed trees
    if (completedTopics.length > 0) {
      const lastCompleted = completedTopics[completedTopics.length - 1];
      
      const relatedMap: Record<string, Recommendation[]> = {
        'react': [
          { title: 'Next.js', description: 'React framework for production', reason: `You completed ${lastCompleted}`, icon: <Triangle className="h-6 w-6" />, category: 'related' },
          { title: 'Redux', description: 'State management for React', reason: `You completed ${lastCompleted}`, icon: <RefreshCw className="h-6 w-6" />, category: 'related' }
        ],
        'javascript': [
          { title: 'Node.js', description: 'JavaScript on the server', reason: `You completed ${lastCompleted}`, icon: <Server className="h-6 w-6" />, category: 'related' },
          { title: 'TypeScript', description: 'Typed JavaScript', reason: `You completed ${lastCompleted}`, icon: <FileCode2 className="h-6 w-6" />, category: 'related' }
        ],
        'python': [
          { title: 'Django', description: 'Python web framework', reason: `You completed ${lastCompleted}`, icon: <Globe className="h-6 w-6" />, category: 'related' },
          { title: 'Machine Learning', description: 'AI with Python', reason: `You completed ${lastCompleted}`, icon: <Brain className="h-6 w-6" />, category: 'related' }
        ],
        'css': [
          { title: 'Tailwind CSS', description: 'Utility-first CSS framework', reason: `You completed ${lastCompleted}`, icon: <Palette className="h-6 w-6" />, category: 'related' },
          { title: 'CSS Animations', description: 'Advanced animations', reason: `You completed ${lastCompleted}`, icon: <Wand2 className="h-6 w-6" />, category: 'related' }
        ]
      };

      for (const [keyword, related] of Object.entries(relatedMap)) {
        if (lastCompleted.toLowerCase().includes(keyword)) {
          recs.push(...related.slice(0, 2));
          break;
        }
      }
    }

    // Skill gap analysis
    if (completedTopics.length === 0) {
      recs.push(
        { title: 'HTML Basics', description: 'Start your web development journey', reason: 'Perfect for beginners', icon: <LayoutTemplate className="h-6 w-6" />, category: 'skill-gap' },
        { title: 'CSS Fundamentals', description: 'Style your web pages', reason: 'Essential foundation', icon: <Palette className="h-6 w-6" />, category: 'skill-gap' }
      );
    }

    const allRecs = [...recs, ...trending].slice(0, 6);
    setRecommendations(allRecs);
  };

  const handleRecommendationClick = (title: string) => {
    navigate(`/skill-tree/${encodeURIComponent(title)}`);
  };

  const getCategoryMeta = (category: Recommendation['category']) => {
    switch (category) {
      case 'trending':
        return { icon: TrendingUp, label: 'Trending', color: 'var(--duo-orange)' };
      case 'related':
        return { icon: Sparkles, label: 'Related', color: 'var(--duo-green)' };
      case 'skill-gap':
        return { icon: Target, label: 'Recommended', color: 'var(--duo-blue)' };
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(165, 96, 232, 0.1)' }}
        >
          <Sparkles className="h-4.5 w-4.5" style={{ color: 'var(--duo-purple)' }} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--duo-text)' }}>
            Quick Start
          </h2>
          <p className="text-xs font-bold" style={{ color: 'var(--duo-text-muted)' }}>
            Jump into a trending or recommended topic
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((rec, index) => {
          const meta = getCategoryMeta(rec.category);
          const CatIcon = meta.icon;

          return (
            <div
              key={index}
              className="rounded-2xl p-5 cursor-pointer group transition-all duration-300"
              onClick={() => handleRecommendationClick(rec.title)}
              style={{
                background: 'var(--duo-surface)',
                border: '1.5px solid var(--duo-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = meta.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--duo-border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">{rec.icon}</div>
                <div className="flex items-center gap-1 text-[11px] font-extrabold" style={{ color: meta.color }}>
                  <CatIcon className="h-3 w-3" />
                  <span>{meta.label}</span>
                </div>
              </div>

              {/* Content */}
              <h3
                className="font-extrabold text-base mb-1.5 transition-colors duration-200"
                style={{ color: 'var(--duo-text)' }}
              >
                {rec.title}
              </h3>
              <p className="text-xs font-semibold mb-3 leading-relaxed" style={{ color: 'var(--duo-text-muted)' }}>
                {rec.description}
              </p>

              {/* Reason + Arrow */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold" style={{ color: meta.color, opacity: 0.8 }}>
                  {rec.reason}
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-all duration-200 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                  style={{ color: meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
