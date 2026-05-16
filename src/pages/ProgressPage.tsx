import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Trophy, Target, Zap, Flame, BookOpen, Calendar, ArrowRight, Star, TrendingUp, Map, Rocket, Brain } from 'lucide-react';
import {
  getAllTopics, getAllProgress, getTopicProgress, getTotalXP, getOverallLevel,
  getCompletionStats, deleteTopicProgress, getCachedSkillTree,
  getCachedNodeImage, getStreakData, getAchievements,
  type TopicProgress,
} from '@/utils/progressStorage';
import { debugStorageState } from '@/utils/debugStorage';
import type { SkillTree } from '@/types/skilltree';
import { toast } from 'sonner';

// Generate heatmap data from progress (last 90 days)
const generateHeatmapData = (progressData: Record<string, TopicProgress>) => {
  const data: { date: string; count: number }[] = [];
  const today = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Count completed nodes on this date based on progress timestamps
    let count = 0;
    for (const progress of Object.values(progressData)) {
      if (progress.startTimestamp) {
        const startDate = new Date(progress.startTimestamp).toISOString().split('T')[0];
        if (startDate === dateStr) count += Math.min(progress.completedNodeIds.length, 5);
      }
      if (progress.completionTimestamp) {
        const compDate = new Date(progress.completionTimestamp).toISOString().split('T')[0];
        if (compDate === dateStr) count += 3;
      }
    }
    data.push({ date: dateStr, count: Math.min(count, 10) });
  }
  return data;
};

const getHeatmapColor = (count: number) => {
  if (count === 0) return 'var(--duo-surface)';
  if (count <= 2) return 'rgba(88, 204, 2, 0.2)';
  if (count <= 4) return 'rgba(88, 204, 2, 0.4)';
  if (count <= 6) return 'rgba(88, 204, 2, 0.6)';
  return 'var(--duo-green)';
};

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<string[]>([]);
  const [progressData, setProgressData] = useState<Record<string, TopicProgress>>({});
  const [totalXP, setTotalXP] = useState(0);
  const [overallLevel, setOverallLevel] = useState(1);
  const [stats, setStats] = useState({ started: 0, completed: 0 });
  const [error, setError] = useState<string | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    document.title = 'Pathfinder | My Progress';
    
    if (import.meta.env.DEV) {
      debugStorageState();
    }
    
    loadProgress().catch(err => {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    });
  }, []);

  const loadProgress = async () => {
    try {
      const allProgress = await getAllProgress();
      setProgressData(allProgress);
      const allTopics = Object.keys(allProgress);
      setTopics(allTopics);
      const xp = await getTotalXP();
      setTotalXP(xp);
      setOverallLevel(getOverallLevel(xp));
      const statsData = await getCompletionStats();
      setStats(statsData);
      setHeatmapData(generateHeatmapData(allProgress));
    } catch (err) {
      console.error('Failed to load progress:', err);
      throw err;
    }
  };

  const handleDelete = async (topic: string) => {
    if (confirm(`Delete progress for "${topic}"? This cannot be undone.`)) {
      try {
        await deleteTopicProgress(topic);
        await loadProgress();
        toast.success(`Deleted progress for ${topic}`);
      } catch (err) {
        toast.error('Failed to delete progress');
        console.error(err);
      }
    }
  };

  const streak = getStreakData();
  const achievements = getAchievements();
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--duo-bg)' }}>
      <div className="text-center space-y-4">
        <div className="text-6xl text-red-500"><Flame className="h-16 w-16 mx-auto" /></div>
        <h2 className="text-2xl font-extrabold" style={{ color: 'var(--duo-text)' }}>Error Loading Progress</h2>
        <p style={{ color: 'var(--duo-text-muted)' }}>{error}</p>
        <button onClick={() => navigate('/')} className="btn-duo btn-duo-green px-6 py-2.5 text-sm">Go to Home</button>
      </div>
    </div>
  );

  if (topics.length === 0) return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--duo-bg)' }}>
      <header style={{ borderBottom: '1.5px solid var(--duo-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-lg font-extrabold transition-opacity hover:opacity-80" style={{ color: 'var(--duo-green)' }}>
            <ArrowLeft className="h-5 w-5" />
            Your Learning Journey
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-lg">
          {/* Animated illustration */}
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(88,204,2,0.15), rgba(73,192,248,0.15))', border: '1.5px solid var(--duo-border)' }} />
            <div className="absolute inset-0 flex items-center justify-center text-6xl" style={{ animation: 'float 3s ease-in-out infinite' }}>
              <Map className="h-16 w-16" style={{ color: 'var(--duo-blue)' }} />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--duo-text)' }}>Your adventure awaits!</h2>
            <p className="text-base font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
              Generate your first AI-powered skill tree and start mastering any topic.
            </p>
          </div>

          {/* Preview stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Zap className="h-6 w-6 mx-auto mb-1" />, label: 'XP', value: '0', color: 'var(--duo-green)' },
              { icon: <Flame className="h-6 w-6 mx-auto mb-1" />, label: 'Streak', value: '0 days', color: 'var(--duo-orange)' },
              { icon: <Trophy className="h-6 w-6 mx-auto mb-1" />, label: 'Level', value: '1', color: 'var(--duo-gold)' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--duo-surface)', border: '1px solid var(--duo-border)' }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--duo-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-3 text-left">
            {[
              { step: '1', text: 'Pick any topic you want to learn', icon: <Target className="h-5 w-5" style={{ color: 'var(--duo-blue)' }} /> },
              { step: '2', text: 'AI generates a structured skill tree', icon: <Brain className="h-5 w-5" style={{ color: 'var(--duo-purple)' }} /> },
              { step: '3', text: 'Complete nodes to earn XP & level up', icon: <Rocket className="h-5 w-5" style={{ color: 'var(--duo-orange)' }} /> },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--duo-surface)', border: '1px solid var(--duo-border)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: 'var(--duo-green)', color: 'white' }}>
                  {item.step}
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--duo-text)' }}>{item.text}</span>
                <span className="ml-auto">{item.icon}</span>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/generate')} className="btn-duo btn-duo-green px-8 py-3.5 text-base w-full">
            <Zap className="h-4 w-4 mr-2" />
            Generate Your First Skill Tree
          </button>
        </div>
      </main>
    </div>
  );


  return (
    <div className="min-h-screen" style={{ background: 'var(--duo-bg)' }}>
      <header className="sticky top-0 z-10" style={{ background: 'rgba(19, 31, 36, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1.5px solid var(--duo-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-lg font-extrabold transition-opacity hover:opacity-80" style={{ color: 'var(--duo-green)' }} aria-label="Back to home">
            <ArrowLeft className="h-5 w-5" />
            Your Learning Journey
            <Trophy className="h-5 w-5" style={{ color: 'var(--duo-gold)' }} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
          {[
            { icon: <Zap className="h-7 w-7" style={{ color: 'var(--duo-green)' }} />, label: 'Total XP', value: totalXP.toLocaleString(), color: 'var(--duo-green)' },
            { icon: <Trophy className="h-7 w-7" style={{ color: 'var(--duo-purple)' }} />, label: 'Level', value: overallLevel, color: 'var(--duo-purple)' },
            { icon: <Target className="h-7 w-7" style={{ color: 'var(--duo-blue)' }} />, label: 'Trees Done', value: `${stats.completed}/${stats.started}`, color: 'var(--duo-blue)' },
            { icon: <Flame className="h-7 w-7" style={{ color: 'var(--duo-orange)' }} />, label: 'Streak', value: `${streak.currentStreak}🔥`, color: 'var(--duo-orange)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-6 text-center space-y-2 transition-all duration-300"
              style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = stat.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--duo-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex justify-center">{stat.icon}</div>
              <p className="text-xs font-bold" style={{ color: 'var(--duo-text-muted)' }}>{stat.label}</p>
              <p className="text-3xl font-black" style={{ color: 'var(--duo-text)' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Learning Heatmap */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: 'var(--duo-green)' }} />
              <h2 className="text-lg font-extrabold" style={{ color: 'var(--duo-text)' }}>Learning Activity</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: 'var(--duo-text-muted)' }}>
              Less
              {[0, 2, 4, 6, 8].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{ background: getHeatmapColor(level), border: level === 0 ? '1px solid var(--duo-border)' : 'none' }}
                />
              ))}
              More
            </div>
          </div>
          
          {/* Heatmap grid */}
          <div className="flex gap-[3px] overflow-x-auto pb-2">
            {Array.from({ length: 13 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dataIndex = weekIndex * 7 + dayIndex;
                  const item = heatmapData[dataIndex];
                  if (!item) return <div key={dayIndex} className="w-3 h-3" />;
                  return (
                    <div
                      key={dayIndex}
                      className="w-3 h-3 rounded-sm transition-colors duration-200"
                      style={{
                        background: getHeatmapColor(item.count),
                        border: item.count === 0 ? '1px solid var(--duo-border)' : 'none',
                      }}
                      title={`${item.date}: ${item.count} activities`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Row */}
        {unlockedAchievements.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" style={{ color: 'var(--duo-gold)' }} />
                <h2 className="text-lg font-extrabold" style={{ color: 'var(--duo-text)' }}>Achievements</h2>
              </div>
              <button
                onClick={() => navigate('/achievements')}
                className="text-xs font-extrabold flex items-center gap-1 transition-colors"
                style={{ color: 'var(--duo-text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--duo-green)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--duo-text-muted)'; }}
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {unlockedAchievements.slice(0, 6).map(a => (
                <div
                  key={a.id}
                  className="rounded-xl px-4 py-2 text-sm font-extrabold transition-all duration-200"
                  style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}
                  title={a.description}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--duo-gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--duo-border)'; }}
                >
                  {a.icon} {a.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Tree Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" style={{ color: 'var(--duo-blue)' }} />
            <h2 className="text-lg font-extrabold" style={{ color: 'var(--duo-text)' }}>Your Skill Trees</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((t) => {
              const progress = progressData[t];
              const cachedTree = getCachedSkillTree(t) as SkillTree | null;
              if (!progress || !cachedTree) return null;
              const total = cachedTree.nodes.length;
              const done = progress.completedNodeIds.length;
              const pct = (done / total) * 100;
              const isComplete = progress.completionTimestamp !== null;
              const firstNode = cachedTree.nodes[0];
              const heroImage = firstNode ? getCachedNodeImage(t, firstNode.id) : null;

              return (
                <div
                  key={t}
                  className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isComplete ? 'var(--duo-green)' : 'var(--duo-blue)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--duo-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="relative h-36" style={{ background: 'linear-gradient(135deg, rgba(88,204,2,0.1), rgba(73,192,248,0.1))' }}>
                    {heroImage ? <img src={heroImage} alt={t} className="w-full h-full object-cover" /> : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
                        <BookOpen className="h-12 w-12" />
                      </div>
                    )}
                    {isComplete && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase" style={{ background: 'var(--duo-green)', color: 'white' }}>
                        ✓ Complete
                      </div>
                    )}
                    <button onClick={() => handleDelete(t)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(19,31,36,0.7)', backdropFilter: 'blur(4px)' }} aria-label={`Delete ${t}`}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,75,75,0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(19,31,36,0.7)'; }}
                    >
                      <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--duo-text-muted)' }} />
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <h3 className="text-base font-extrabold line-clamp-2" style={{ color: 'var(--duo-text)' }}>{t}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span style={{ color: 'var(--duo-text-muted)' }}>Progress</span>
                        <span style={{ color: 'var(--duo-text)' }}>{done}/{total} nodes ({Math.round(pct)}%)</span>
                      </div>
                      <div className="progress-duo">
                        <div className="progress-duo-fill" style={{ width: `${pct}%`, background: isComplete ? 'var(--duo-green)' : 'var(--duo-blue)' }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span style={{ color: 'var(--duo-text-muted)' }}>XP Earned</span>
                      <span className="flex items-center gap-1" style={{ color: 'var(--duo-gold)' }}>
                        <Zap className="h-3 w-3" />
                        {progress.currentXP} XP
                      </span>
                    </div>
                    {!isComplete && (
                      <button
                        onClick={() => navigate(`/skill-tree/${encodeURIComponent(t)}`)}
                        className="btn-duo btn-duo-green w-full py-2.5 text-xs"
                      >
                        Continue Learning
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
