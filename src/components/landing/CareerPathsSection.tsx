import React, { useState, useEffect } from 'react';
import { Map, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { CareerPathCard } from './CareerPathCard';
import { careerPaths } from '@/data/careerPaths';
import { getCompletedTopics } from '@/utils/progressStorage';
import { getCareerPathProgress } from '@/data/careerPaths';
import { generatePersonalizedPaths, type PersonalizedCareerPath } from '@/utils/personalizedPaths';
import { useNavigate } from 'react-router-dom';

export const CareerPathsSection: React.FC = () => {
  const navigate = useNavigate();
  const [sortedPaths, setSortedPaths] = useState(careerPaths);
  const [personalizedPaths, setPersonalizedPaths] = useState<PersonalizedCareerPath[]>([]);
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(true);
  
  useEffect(() => {
    // Load personalized recommendations
    generatePersonalizedPaths().then(paths => {
      setPersonalizedPaths(paths);
      setIsLoadingPersonalized(false);
    });

    // Sort static paths
    getCompletedTopics().then(completedTopics => {
      const sorted = [...careerPaths].sort((a, b) => {
        const progressA = getCareerPathProgress(a.id, completedTopics);
        const progressB = getCareerPathProgress(b.id, completedTopics);
        
        // Started paths first
        if (progressA > 0 && progressB === 0) return -1;
        if (progressA === 0 && progressB > 0) return 1;
        
        // Then by difficulty
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      });
      setSortedPaths(sorted);
    });
  }, []);
  
  // Show top 3 paths
  const featuredPaths = sortedPaths.slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Personalized Recommendations */}
      {personalizedPaths.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(88, 204, 2, 0.1)' }}
            >
              <Sparkles className="h-4.5 w-4.5" style={{ color: 'var(--duo-green)' }} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--duo-text)' }}>
                Recommended for You
              </h2>
              <p className="text-xs font-bold" style={{ color: 'var(--duo-text-muted)' }}>
                Based on your learning history
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalizedPaths.map((path) => (
              <div
                key={path.id}
                onClick={() => {
                  if (path.trees.length > 0) {
                    navigate(`/skill-tree/${encodeURIComponent(path.trees[0].topic)}`);
                  }
                }}
                className="rounded-2xl p-5 cursor-pointer group relative overflow-hidden transition-all duration-300"
                style={{
                  background: 'var(--duo-surface)',
                  border: '1.5px solid var(--duo-border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--duo-green)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--duo-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Match score badge */}
                <div
                  className="absolute top-4 right-4 text-xs font-extrabold px-2.5 py-1 rounded-lg"
                  style={{
                    background: 'rgba(88, 204, 2, 0.1)',
                    color: 'var(--duo-green)',
                    border: '1px solid rgba(88, 204, 2, 0.2)',
                  }}
                >
                  {path.matchScore}% Match
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold mb-1 pr-20" style={{ color: 'var(--duo-text)' }}>
                      {path.title}
                    </h3>
                    <p className="text-xs font-semibold leading-relaxed mb-2" style={{ color: 'var(--duo-text-muted)' }}>
                      {path.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--duo-green)' }}>
                      <Sparkles className="h-3 w-3" />
                      <span>{path.reason}</span>
                    </div>
                  </div>

                  {/* Path details */}
                  <div className="flex items-center gap-3 text-[11px] font-bold" style={{ color: 'var(--duo-text-muted)' }}>
                    <span className="capitalize">{path.difficulty}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{path.estimatedTime}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{path.trees.length} topics</span>
                  </div>

                  {/* Topics preview */}
                  <div className="space-y-1.5 pt-1">
                    {path.trees.slice(0, 3).map((tree, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <span className="font-extrabold" style={{ color: 'var(--duo-green)', minWidth: '14px' }}>
                          {tree.order}.
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                          {tree.topic}
                        </span>
                      </div>
                    ))}
                    {path.trees.length > 3 && (
                      <div className="text-[11px] font-bold pl-5" style={{ color: 'var(--duo-text-muted)', opacity: 0.7 }}>
                        +{path.trees.length - 3} more topics
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state for personalized */}
      {isLoadingPersonalized && personalizedPaths.length === 0 && (
        <div className="flex items-center justify-center gap-2.5 py-8">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--duo-text-muted)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--duo-text-muted)' }}>
            Generating recommendations...
          </span>
        </div>
      )}

      {/* Static Career Paths */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(73, 192, 248, 0.1)' }}
          >
            <Map className="h-4.5 w-4.5" style={{ color: 'var(--duo-blue)' }} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: 'var(--duo-text)' }}>
              {personalizedPaths.length > 0 ? 'Explore More Paths' : 'Career Paths'}
            </h2>
            <p className="text-xs font-bold" style={{ color: 'var(--duo-text-muted)' }}>
              Structured learning journeys to reach your goals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Custom Path Generator Card */}
          <div
            onClick={() => navigate('/generate-path')}
            className="rounded-2xl p-6 cursor-pointer group relative overflow-hidden transition-all duration-300 flex flex-col justify-between"
            style={{
              background: 'var(--duo-surface)',
              border: '2px dashed var(--duo-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--duo-green)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(88, 204, 2, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--duo-border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'var(--duo-surface)';
            }}
          >
            <div className="space-y-4 text-center mt-2">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-300"
                style={{ background: 'rgba(88, 204, 2, 0.1)' }}
              >
                <Sparkles className="h-7 w-7" style={{ color: 'var(--duo-green)' }} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold mb-2" style={{ color: 'var(--duo-text)' }}>
                  Create Custom Path
                </h3>
                <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--duo-text-muted)' }}>
                  Enter any topic or role and AI will build a personalized curriculum just for you.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <div 
                className="w-full py-3 rounded-xl text-sm font-extrabold text-center transition-all duration-300"
                style={{ 
                  background: 'var(--duo-bg)',
                  color: 'var(--duo-green)',
                  border: '1.5px solid var(--duo-border)'
                }}
              >
                Generate Path
              </div>
            </div>
          </div>

          {featuredPaths.map((path) => (
            <CareerPathCard key={path.id} path={path} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <a
            href="/career-paths"
            className="inline-flex items-center gap-2 text-sm font-extrabold transition-colors duration-200"
            style={{ color: 'var(--duo-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--duo-green)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--duo-text-muted)'; }}
          >
            View all {careerPaths.length} career paths
            <TrendingUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
