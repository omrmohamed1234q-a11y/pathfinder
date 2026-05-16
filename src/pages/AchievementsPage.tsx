import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layouts/Navbar';
import { Footer } from '@/components/layouts/Footer';
import { getAchievements, type Achievement } from '@/utils/progressStorage';
import { Trophy, Lock, Sparkles, Star, Shield, Crown, Gem } from 'lucide-react';

// Rarity tiers for achievements
const getRarity = (achievement: Achievement, index: number): { tier: string; color: string; borderColor: string; bgColor: string; icon: React.ReactNode } => {
  // Assign rarity based on position (first ones are easier = Common, later ones = Legendary)
  if (index < 3) return { tier: 'Common', color: 'var(--duo-text-muted)', borderColor: 'var(--duo-border)', bgColor: 'var(--duo-surface)', icon: <Shield className="h-3.5 w-3.5" /> };
  if (index < 6) return { tier: 'Rare', color: 'var(--duo-blue)', borderColor: 'var(--duo-blue)', bgColor: 'rgba(73, 192, 248, 0.08)', icon: <Star className="h-3.5 w-3.5" /> };
  if (index < 9) return { tier: 'Epic', color: 'var(--duo-purple)', borderColor: 'var(--duo-purple)', bgColor: 'rgba(165, 96, 232, 0.08)', icon: <Gem className="h-3.5 w-3.5" /> };
  return { tier: 'Legendary', color: 'var(--duo-gold)', borderColor: 'var(--duo-gold)', bgColor: 'rgba(255, 200, 0, 0.08)', icon: <Crown className="h-3.5 w-3.5" /> };
};

const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    document.title = 'Pathfinder | Achievements';
    const loadedAchievements = getAchievements();
    setAchievements(loadedAchievements);
  }, []);

  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;
  const totalCount = achievements.length;
  const completionPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.unlockedAt !== null;
    if (filter === 'locked') return a.unlockedAt === null;
    return true;
  });

  const filters = [
    { key: 'all' as const, label: `All (${totalCount})` },
    { key: 'unlocked' as const, label: `Unlocked (${unlockedCount})` },
    { key: 'locked' as const, label: `Locked (${totalCount - unlockedCount})` },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--duo-bg)' }}>
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--duo-gold)', boxShadow: '0 4px 0 var(--duo-gold-dark)' }}
            >
              <Trophy className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black" style={{ color: 'var(--duo-text)' }}>Achievements</h1>
          <p className="text-lg font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
            Unlock badges by completing challenges and milestones
          </p>
        </div>

        {/* Progress Overview */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--duo-text)' }}>{unlockedCount} / {totalCount}</h2>
              <p className="text-sm font-bold" style={{ color: 'var(--duo-text-muted)' }}>Achievements Unlocked</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black gradient-text">{completionPercent}%</div>
              <p className="text-sm font-bold" style={{ color: 'var(--duo-text-muted)' }}>Complete</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-duo">
            <div className="progress-duo-fill" style={{ width: `${completionPercent}%` }} />
          </div>

          {/* Rarity Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--duo-border)' }}>
            {[
              { tier: 'Common', color: 'var(--duo-text-muted)', icon: <Shield className="h-3 w-3" /> },
              { tier: 'Rare', color: 'var(--duo-blue)', icon: <Star className="h-3 w-3" /> },
              { tier: 'Epic', color: 'var(--duo-purple)', icon: <Gem className="h-3 w-3" /> },
              { tier: 'Legendary', color: 'var(--duo-gold)', icon: <Crown className="h-3 w-3" /> },
            ].map((r) => (
              <div key={r.tier} className="flex items-center gap-1.5 text-[11px] font-extrabold" style={{ color: r.color }}>
                {r.icon} {r.tier}
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-200"
              style={{
                background: filter === f.key ? 'var(--duo-green)' : 'var(--duo-surface)',
                color: filter === f.key ? 'white' : 'var(--duo-text-muted)',
                border: `1.5px solid ${filter === f.key ? 'var(--duo-green)' : 'var(--duo-border)'}`,
                boxShadow: filter === f.key ? '0 3px 0 var(--duo-green-dark)' : 'none',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filteredAchievements.map((achievement, index) => {
            const isUnlocked = achievement.unlockedAt !== null;
            const rarity = getRarity(achievement, index);
            return (
              <div
                key={achievement.id}
                className={`rounded-2xl p-6 transition-all duration-300 ${
                  isUnlocked ? 'hover:scale-[1.02]' : 'opacity-60 hover:opacity-80'
                }`}
                style={{
                  background: isUnlocked ? rarity.bgColor : 'var(--duo-surface)',
                  border: `2px solid ${isUnlocked ? rarity.borderColor : 'var(--duo-border)'}`,
                  boxShadow: isUnlocked ? `0 4px 0 rgba(0,0,0,0.2)` : 'none',
                }}
              >
                {/* Top row: Icon + Rarity */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: isUnlocked
                        ? `linear-gradient(135deg, ${rarity.borderColor}30, ${rarity.borderColor}10)`
                        : 'var(--duo-bg)',
                      border: `1.5px solid ${isUnlocked ? rarity.borderColor : 'var(--duo-border)'}`,
                    }}
                  >
                    {isUnlocked ? achievement.icon : <Lock className="h-6 w-6" style={{ color: 'var(--duo-text-muted)' }} />}
                  </div>
                  {isUnlocked && (
                    <div
                      className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md"
                      style={{ color: rarity.color, background: `${rarity.borderColor}15` }}
                    >
                      {rarity.icon}
                      {rarity.tier}
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-extrabold mb-1.5" style={{ color: isUnlocked ? 'var(--duo-text)' : 'var(--duo-text-muted)' }}>
                  {isUnlocked ? achievement.title : '???'}
                </h3>
                <p className="text-xs font-semibold mb-4 leading-relaxed" style={{ color: 'var(--duo-text-muted)' }}>
                  {isUnlocked ? achievement.description : 'Complete challenges to unlock this achievement'}
                </p>

                {/* Unlock Date */}
                {isUnlocked && achievement.unlockedAt && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: rarity.color }}>
                    <Sparkles className="h-3 w-3" />
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--duo-text-muted)' }} />
            <h3 className="text-xl font-extrabold mb-2" style={{ color: 'var(--duo-text)' }}>No achievements here yet</h3>
            <p style={{ color: 'var(--duo-text-muted)' }}>
              {filter === 'unlocked' 
                ? 'Start learning to unlock your first achievement!' 
                : 'All achievements unlocked! Amazing work! 🎉'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AchievementsPage;
