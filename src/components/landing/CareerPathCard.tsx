import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Target, CheckCircle2, Laptop, Database, Paintbrush, Smartphone, Settings, Brain } from 'lucide-react';
import type { CareerPath } from '@/data/careerPaths';
import { getCareerPathProgress, getNextTreeInPath } from '@/data/careerPaths';
import { getCompletedTopics } from '@/utils/progressStorage';

interface CareerPathCardProps {
  path: CareerPath;
}

export const CareerPathCard: React.FC<CareerPathCardProps> = ({ path }) => {
  const navigate = useNavigate();
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [nextTree, setNextTree] = useState<any>(null);
  
  useEffect(() => {
    getCompletedTopics().then(topics => {
      setCompletedTopics(topics);
      setProgress(getCareerPathProgress(path.id, topics));
      setNextTree(getNextTreeInPath(path.id, topics));
    });
  }, [path.id]);
  
  const isStarted = progress > 0;
  const isCompleted = progress === 100;

  const handleClick = () => {
    navigate(`/career-path/${path.id}`);
  };

  const handleStartNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextTree) {
      navigate(`/skill-tree/${encodeURIComponent(nextTree.topic)}`);
    } else {
      navigate(`/career-path/${path.id}`);
    }
  };

  const getDifficultyBadge = () => {
    switch (path.difficulty) {
      case 'beginner': return { bg: 'rgba(88, 204, 2, 0.1)', color: 'var(--duo-green)', border: 'rgba(88, 204, 2, 0.2)' };
      case 'intermediate': return { bg: 'rgba(255, 150, 0, 0.1)', color: 'var(--duo-orange)', border: 'rgba(255, 150, 0, 0.2)' };
      case 'advanced': return { bg: 'rgba(255, 75, 75, 0.1)', color: 'var(--duo-red)', border: 'rgba(255, 75, 75, 0.2)' };
    }
  };

  const difficultyStyle = getDifficultyBadge();

  const iconMap: Record<string, React.ReactNode> = {
    'Laptop': <Laptop className="w-6 h-6" />,
    'Database': <Database className="w-6 h-6" />,
    'Paintbrush': <Paintbrush className="w-6 h-6" />,
    'Smartphone': <Smartphone className="w-6 h-6" />,
    'Settings': <Settings className="w-6 h-6" />,
    'Brain': <Brain className="w-6 h-6" />,
  };

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col"
      onClick={handleClick}
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
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{ background: 'rgba(73, 192, 248, 0.1)', color: 'var(--duo-blue)' }}
            >
              {iconMap[path.icon as string] || <Laptop className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-extrabold text-lg transition-colors" style={{ color: 'var(--duo-text)' }}>
                {path.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{ background: difficultyStyle.bg, color: difficultyStyle.color, border: `1px solid ${difficultyStyle.border}` }}
                >
                  {path.difficulty}
                </span>
                <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--duo-text-muted)' }}>
                  <Clock className="h-3 w-3" />
                  {path.estimatedMonths} mos
                </span>
              </div>
            </div>
          </div>
          {isCompleted && (
            <div className="rounded-full p-1.5" style={{ background: 'rgba(88, 204, 2, 0.1)' }}>
              <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--duo-green)' }} />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--duo-text-muted)' }}>
          {path.description}
        </p>

        {/* Progress */}
        {isStarted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span style={{ color: 'var(--duo-text-muted)' }}>Progress</span>
              <span style={{ color: 'var(--duo-green)' }}>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--duo-bg)' }}>
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress}%`, background: 'var(--duo-green)' }} 
              />
            </div>
            {nextTree && !isCompleted && (
              <p className="text-xs font-bold" style={{ color: 'var(--duo-text-muted)' }}>
                Next: {nextTree.topic}
              </p>
            )}
          </div>
        )}

        {/* Skills - Push to bottom */}
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {path.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: 'var(--duo-bg)', color: 'var(--duo-text-muted)', border: '1px solid var(--duo-border)' }}
            >
              {skill}
            </span>
          ))}
          {path.skills.length > 3 && (
            <span className="text-[11px] font-bold px-2 py-1" style={{ color: 'var(--duo-text-muted)', opacity: 0.6 }}>
              +{path.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartNext}
          className={`w-full py-3 text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all ${isStarted ? 'btn-duo btn-duo-green' : ''}`}
          style={!isStarted ? { background: 'var(--duo-bg)', color: 'var(--duo-text)', border: '1.5px solid var(--duo-border)' } : {}}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              View Path
            </>
          ) : isStarted ? (
            <>
              Continue Learning
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <Target className="h-4 w-4" style={{ color: 'var(--duo-green)' }} />
              Start Path
            </>
          )}
        </button>
      </div>
    </div>
  );
};
