import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Zap, Flame, Crown, Medal, Award } from 'lucide-react';
import { supabase, type LeaderboardEntry } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'global' | 'friends'>('global');
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'all_time'>('all_time');

  useEffect(() => {
    document.title = 'Pathfinder | Leaderboard';
    loadLeaderboard();
  }, [view, timePeriod, user]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      if (view === 'global') {
        if (timePeriod === 'daily') {
          const { data, error } = await supabase.rpc('get_daily_leaderboard', {
            target_date: new Date().toISOString().split('T')[0],
            limit_count: 100,
          });
          if (error) throw error;
          setLeaderboard(data || []);
        } else if (timePeriod === 'weekly') {
          const { data, error } = await supabase.rpc('get_weekly_leaderboard', {
            limit_count: 100,
          });
          if (error) throw error;
          setLeaderboard(data || []);
        } else {
          const { data, error } = await supabase.rpc('get_global_leaderboard', {
            time_period: 'all_time',
            limit_count: 100,
          });
          if (error) throw error;
          setLeaderboard(data || []);
        }
      } else if (view === 'friends' && user) {
        const { data, error } = await supabase.rpc('get_friend_leaderboard', {
          user_uuid: user.id,
          limit_count: 50,
        });

        if (error) throw error;
        setLeaderboard(data || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6" style={{ color: 'var(--duo-gold)' }} />;
    if (rank === 2) return <Medal className="h-6 w-6" style={{ color: '#C0C0C0' }} />;
    if (rank === 3) return <Award className="h-6 w-6" style={{ color: 'var(--duo-orange)' }} />;
    return null;
  };

  const getRankBorder = (rank: number) => {
    if (rank === 1) return 'var(--duo-gold)';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return 'var(--duo-orange)';
    return 'var(--duo-border)';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--duo-bg)' }}>
        <div className="text-center space-y-6 max-w-md">
          <div className="text-8xl flex justify-center text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
          <h2 className="text-3xl font-extrabold gradient-text">Sign In Required</h2>
          <p className="text-lg font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
            Create an account to compete on the leaderboard and track your progress!
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-duo btn-duo-green px-8 py-3 text-base"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--duo-bg)' }}>
      <header
        className="sticky top-0 z-10"
        style={{
          background: 'rgba(19, 31, 36, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1.5px solid var(--duo-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-lg font-extrabold transition-opacity hover:opacity-80"
            style={{ color: 'var(--duo-green)' }}
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
            Leaderboard
            <Trophy className="h-5 w-5" style={{ color: 'var(--duo-gold)' }} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* View Toggle */}
        <div className="flex gap-3 justify-center flex-wrap">
          {[
            { key: 'global' as const, label: '🌍 Global' },
            { key: 'friends' as const, label: '👥 Friends' },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="px-6 py-3 rounded-xl font-extrabold transition-all duration-200 text-sm"
              style={{
                background: view === v.key ? 'var(--duo-green)' : 'var(--duo-surface)',
                color: view === v.key ? 'white' : 'var(--duo-text-muted)',
                border: `1.5px solid ${view === v.key ? 'var(--duo-green)' : 'var(--duo-border)'}`,
                boxShadow: view === v.key ? '0 3px 0 var(--duo-green-dark)' : 'none',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Time Period Toggle (only for global) */}
        {view === 'global' && (
          <div className="flex gap-2 justify-center flex-wrap">
            {[
              { key: 'daily' as const, label: '📅 Today' },
              { key: 'weekly' as const, label: '📊 This Week' },
              { key: 'all_time' as const, label: '🏆 All Time' },
            ].map((tp) => (
              <button
                key={tp.key}
                onClick={() => setTimePeriod(tp.key)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200"
                style={{
                  background: timePeriod === tp.key ? 'rgba(88, 204, 2, 0.1)' : 'var(--duo-surface)',
                  color: timePeriod === tp.key ? 'var(--duo-green)' : 'var(--duo-text-muted)',
                  border: `1.5px solid ${timePeriod === tp.key ? 'var(--duo-green)' : 'var(--duo-border)'}`,
                }}
              >
                {tp.label}
              </button>
            ))}
          </div>
        )}

        {/* Current User Stats */}
        {profile && (
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'var(--duo-surface)',
              border: '2px solid var(--duo-green)',
              boxShadow: '0 0 20px rgba(88, 204, 2, 0.1)',
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg, var(--duo-green), var(--duo-blue))' }}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username || 'You'} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div>
                  <p className="text-xl font-extrabold" style={{ color: 'var(--duo-text)' }}>{profile.username || 'You'}</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--duo-text-muted)' }}>Your Stats</p>
                </div>
              </div>
              <div className="flex gap-6">
                {[
                  { value: profile.total_xp, label: 'XP', icon: <Zap className="h-3 w-3" />, color: 'var(--duo-green)' },
                  { value: profile.overall_level, label: 'Level', icon: <Trophy className="h-3 w-3" />, color: 'var(--duo-purple)' },
                  { value: profile.current_streak, label: 'Streak', icon: <Flame className="h-3 w-3" />, color: 'var(--duo-orange)' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] font-bold flex items-center gap-1 justify-center" style={{ color: 'var(--duo-text-muted)' }}>
                      {stat.icon} {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div
                className="inline-block w-12 h-12 border-4 rounded-full animate-spin"
                style={{ borderColor: 'var(--duo-border)', borderTopColor: 'var(--duo-green)' }}
              />
              <p className="mt-4 font-semibold" style={{ color: 'var(--duo-text-muted)' }}>Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}>
              <div className="text-6xl mb-4 flex justify-center text-yellow-500"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg></div>
              <p className="text-xl font-extrabold" style={{ color: 'var(--duo-text)' }}>No rankings yet</p>
              <p className="mt-2 font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                {view === 'friends' ? 'Add friends to see their rankings!' : 'Be the first to earn XP!'}
              </p>
            </div>
          ) : (
            leaderboard.map((entry) => {
              const isCurrentUser = entry.user_id === user?.id;
              const rankIcon = getRankIcon(entry.rank);
              const borderColor = getRankBorder(entry.rank);

              return (
                <div
                  key={entry.user_id}
                  className="rounded-xl p-4 transition-all duration-200"
                  style={{
                    background: isCurrentUser ? 'rgba(88, 204, 2, 0.05)' : 'var(--duo-surface)',
                    border: `1.5px solid ${isCurrentUser ? 'var(--duo-green)' : borderColor}`,
                    boxShadow: entry.rank <= 3 ? '0 4px 0 rgba(0,0,0,0.2)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center font-black text-lg" style={{ color: borderColor }}>
                        {rankIcon || `#${entry.rank}`}
                      </div>
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-lg"
                        style={{ background: 'linear-gradient(135deg, var(--duo-purple), var(--duo-green))' }}
                      >
                        {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt={entry.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div>
                        <p className="font-extrabold flex items-center gap-2" style={{ color: 'var(--duo-text)' }}>
                          {entry.username}
                          {isCurrentUser && (
                            <span
                              className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg"
                              style={{ background: 'rgba(88, 204, 2, 0.1)', color: 'var(--duo-green)' }}
                            >
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: 'var(--duo-text-muted)' }}>{entry.display_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-5 text-right">
                      <div>
                        <p className="text-base font-black" style={{ color: 'var(--duo-green)' }}>{entry.total_xp}</p>
                        <p className="text-[10px] font-bold" style={{ color: 'var(--duo-text-muted)' }}>XP</p>
                      </div>
                      <div>
                        <p className="text-base font-black" style={{ color: 'var(--duo-purple)' }}>{entry.overall_level}</p>
                        <p className="text-[10px] font-bold" style={{ color: 'var(--duo-text-muted)' }}>Level</p>
                      </div>
                      <div>
                        <p className="text-base font-black" style={{ color: 'var(--duo-orange)' }}>{entry.current_streak}🔥</p>
                        <p className="text-[10px] font-bold" style={{ color: 'var(--duo-text-muted)' }}>Streak</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
