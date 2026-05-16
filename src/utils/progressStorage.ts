import { supabase } from '@/lib/supabase';

export interface TopicProgress {
  topic: string;
  completedNodeIds: number[];
  currentXP: number;
  currentLevel: number;
  startTimestamp: number | null;
  completionTimestamp: number | null;
  perfectQuizzes?: number;
  totalQuizAttempts?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
}

// Helper to get user-scoped storage keys (for localStorage items like cache, achievements, streak)
const getUserId = (): string => {
  const userId = localStorage.getItem('pathfinder_current_user_id');
  return userId || 'anonymous';
};

const getStorageKey = (baseKey: string, userId?: string): string => {
  const effectiveUserId = userId || getUserId();
  return `${baseKey}_${effectiveUserId}`;
};

const CONTENT_CACHE_KEY_BASE = 'pathfinder_content_cache';
const ACHIEVEMENTS_KEY_BASE = 'pathfinder_achievements';
const STREAK_KEY_BASE = 'pathfinder_streak';
const SOUND_KEY = 'pathfinder_sound_enabled';

// ─── Progress Data (Supabase) ───────────────────────────────────────────

export const getAllProgress = async (): Promise<Record<string, TopicProgress>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    const progressMap: Record<string, TopicProgress> = {};
    data?.forEach((row) => {
      progressMap[row.topic] = {
        topic: row.topic,
        completedNodeIds: row.completed_node_ids || [],
        currentXP: row.current_xp || 0,
        currentLevel: row.current_level || 1,
        startTimestamp: row.start_timestamp,
        completionTimestamp: row.completion_timestamp,
        perfectQuizzes: 0,
        totalQuizAttempts: 0,
      };
    });

    return progressMap;
  } catch (error) {
    console.error('Failed to load progress from Supabase:', error);
    return {};
  }
};

export const getTopicProgress = async (topic: string): Promise<TopicProgress | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // For guest users, load from localStorage
    if (!user) {
      const key = `progress_${topic}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    }

    // For authenticated users, load from Supabase
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('topic', topic)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      topic: data.topic,
      completedNodeIds: data.completed_node_ids || [],
      currentXP: data.current_xp || 0,
      currentLevel: data.current_level || 1,
      startTimestamp: data.start_timestamp,
      completionTimestamp: data.completion_timestamp,
      perfectQuizzes: 0,
      totalQuizAttempts: 0,
    };
  } catch (error) {
    console.error('Failed to load topic progress:', error);
    return null;
  }
};

export const saveTopicProgress = async (progress: TopicProgress): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // For guest users, save to localStorage only
    if (!user) {
      const key = `progress_${progress.topic}`;
      localStorage.setItem(key, JSON.stringify(progress));
      return;
    }

    // For authenticated users, save to Supabase
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        topic: progress.topic,
        completed_node_ids: progress.completedNodeIds,
        current_xp: progress.currentXP,
        current_level: progress.currentLevel,
        start_timestamp: progress.startTimestamp || Date.now(),
        completion_timestamp: progress.completionTimestamp,
        last_activity: new Date().toISOString(),
      }, {
        onConflict: 'user_id,topic'
      });

    if (error) throw error;
    
    // Also update streak and check achievements
    updateStreak();
    checkAchievements();
  } catch (error) {
    console.error('Failed to save progress to Supabase:', error);
    throw error;
  }
};

export const initializeTopicProgress = (topic: string): TopicProgress => {
  return {
    topic,
    completedNodeIds: [],
    currentXP: 0,
    currentLevel: 1,
    startTimestamp: null,
    completionTimestamp: null,
    perfectQuizzes: 0,
    totalQuizAttempts: 0,
  };
};

// Calculate level based on completed nodes — scales for any tree size
export const calculateLevel = (completedNodesCount: number, totalNodes: number = 20): number => {
  if (totalNodes <= 0) return 1;
  const progress = completedNodesCount / totalNodes;
  if (progress >= 1) return 10;
  if (progress >= 0.85) return 9;
  if (progress >= 0.7) return 8;
  if (progress >= 0.55) return 7;
  if (progress >= 0.42) return 6;
  if (progress >= 0.3) return 5;
  if (progress >= 0.2) return 4;
  if (progress >= 0.12) return 3;
  if (progress >= 0.05) return 2;
  return 1;
};

// Format time duration
export const formatTimeDuration = (startTimestamp: number, endTimestamp: number): string => {
  const durationMs = endTimestamp - startTimestamp;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

// Content caching functions
interface ContentCache {
  version?: number;
  [key: string]: unknown;
}

// Cache version - increment this to invalidate all old cached content
const CACHE_VERSION = 2; // v2: Real AI-generated content (not mock data)

const getContentCache = (): ContentCache => {
  try {
    const data = localStorage.getItem(getStorageKey(CONTENT_CACHE_KEY_BASE));
    const cache: ContentCache = data ? JSON.parse(data) : {};
    
    // Check cache version - if old version, clear it
    if (!cache.version || cache.version < CACHE_VERSION) {
      console.log(`🗑️ Clearing old cache (v${cache.version || 0} → v${CACHE_VERSION})`);
      return { version: CACHE_VERSION };
    }
    
    return cache;
  } catch (error) {
    console.error('Failed to load content cache:', error);
    return { version: CACHE_VERSION };
  }
};

const saveContentCache = (cache: ContentCache): void => {
  try {
    // Always save with current version
    cache.version = CACHE_VERSION;
    localStorage.setItem(getStorageKey(CONTENT_CACHE_KEY_BASE), JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save content cache:', error);
  }
};

// Cache skill tree
export const cacheSkillTree = (topic: string, tree: unknown): void => {
  const cache = getContentCache();
  cache[`${topic}_tree`] = tree;
  saveContentCache(cache);
};

// Get cached skill tree
export const getCachedSkillTree = (topic: string): unknown | null => {
  const cache = getContentCache();
  return cache[`${topic}_tree`] || null;
};

// Cache lesson content
export const cacheLesson = (topic: string, nodeId: number, lesson: unknown): void => {
  const cache = getContentCache();
  cache[`${topic}_${nodeId}_lesson`] = lesson;
  saveContentCache(cache);
};

// Get cached lesson
export const getCachedLesson = (topic: string, nodeId: number): unknown | null => {
  const cache = getContentCache();
  return cache[`${topic}_${nodeId}_lesson`] || null;
};

// Cache quiz content
export const cacheQuiz = (topic: string, nodeId: number, quiz: unknown): void => {
  const cache = getContentCache();
  cache[`${topic}_${nodeId}_quiz`] = quiz;
  saveContentCache(cache);
};

// Get cached quiz
export const getCachedQuiz = (topic: string, nodeId: number): unknown | null => {
  const cache = getContentCache();
  return cache[`${topic}_${nodeId}_quiz`] || null;
};

// Cache node image URL
export const cacheNodeImage = (topic: string, nodeId: number, imageUrl: string): void => {
  const cache = getContentCache();
  cache[`${topic}_${nodeId}_image`] = imageUrl;
  saveContentCache(cache);
};

// Get cached node image URL
export const getCachedNodeImage = (topic: string, nodeId: number): string | null => {
  const cache = getContentCache();
  return (cache[`${topic}_${nodeId}_image`] as string) || null;
};

// Clear all cached content (useful for debugging or forcing refresh)
export const clearContentCache = (): void => {
  try {
    localStorage.removeItem(getStorageKey(CONTENT_CACHE_KEY_BASE));
    console.log('🗑️ Content cache cleared');
  } catch (error) {
    console.error('Failed to clear content cache:', error);
  }
};

// ─── Fixed: Topic Listing (was broken — looked for wrong keys) ───

export const getAllTopics = async (): Promise<string[]> => {
  const allProgress = await getAllProgress();
  return Object.keys(allProgress);
};

export const getCompletedTopics = async (): Promise<string[]> => {
  const allProgress = await getAllProgress();
  return Object.keys(allProgress).filter(topic => {
    const progress = allProgress[topic];
    return progress && progress.completionTimestamp !== null;
  });
};

export const getTotalXP = async (): Promise<number> => {
  const allProgress = await getAllProgress();
  return Object.values(allProgress).reduce((total, progress) => {
    return total + (progress?.currentXP || 0);
  }, 0);
};

export const getOverallLevel = (totalXP: number): number => {
  if (totalXP < 500) return 1;
  if (totalXP < 1500) return 2;
  if (totalXP < 3000) return 3;
  if (totalXP < 5000) return 4;
  if (totalXP < 8000) return 5;
  return 6;
};

export const getCompletionStats = async (): Promise<{ started: number; completed: number }> => {
  const allProgress = await getAllProgress();
  let started = 0;
  let completed = 0;

  Object.values(allProgress).forEach((progress) => {
    if (progress) {
      started++;
      if (progress.completionTimestamp) {
        completed++;
      }
    }
  });

  return { started, completed };
};

export const deleteTopicProgress = async (topic: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // For guest users, delete from localStorage only
    if (!user) {
      const key = `progress_${topic}`;
      localStorage.removeItem(key);
      return;
    }

    // For authenticated users, delete from Supabase
    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('topic', topic);

    if (error) throw error;
    
    // Also clear cached content for this topic
    const cache = getContentCache();
    const keysToDelete = Object.keys(cache).filter((key) => key.startsWith(`${topic}_`));
    keysToDelete.forEach((key) => delete cache[key]);
    saveContentCache(cache);
  } catch (error) {
    console.error('Failed to delete progress from Supabase:', error);
    throw error;
  }
};

// ─── Streak System ───────────────────────────────────────────

interface StreakData {
  currentStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  longestStreak: number;
}

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterday = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const getStreakData = (): StreakData => {
  try {
    const data = localStorage.getItem(getStorageKey(STREAK_KEY_BASE));
    if (data) {
      const streak: StreakData = JSON.parse(data);
      // Reset streak if last active was more than 1 day ago
      const today = getToday();
      const yesterday = getYesterday();
      if (streak.lastActiveDate !== today && streak.lastActiveDate !== yesterday) {
        return { currentStreak: 0, lastActiveDate: '', longestStreak: streak.longestStreak };
      }
      return streak;
    }
  } catch (error) {
    console.error('Failed to load streak:', error);
  }
  return { currentStreak: 0, lastActiveDate: '', longestStreak: 0 };
};

const updateStreak = (): void => {
  try {
    const streak = getStreakData();
    const today = getToday();
    
    if (streak.lastActiveDate === today) return; // Already counted today
    
    if (streak.lastActiveDate === getYesterday()) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }
    
    streak.lastActiveDate = today;
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    
    localStorage.setItem(getStorageKey(STREAK_KEY_BASE), JSON.stringify(streak));
  } catch (error) {
    console.error('Failed to update streak:', error);
  }
};

// ─── Achievement System ──────────────────────────────────────

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_steps', title: 'First Steps', description: 'Complete your first node', icon: '🌱', unlockedAt: null },
  { id: 'tree_complete', title: 'Tree Master', description: 'Complete an entire skill tree', icon: '🌳', unlockedAt: null },
  { id: 'speed_learner', title: 'Speed Learner', description: 'Complete a tree in under 5 minutes', icon: '⚡', unlockedAt: null },
  { id: 'on_fire', title: 'On Fire', description: '3-day learning streak', icon: '🔥', unlockedAt: null },
  { id: 'knowledge_seeker', title: 'Knowledge Seeker', description: 'Start 3 different skill trees', icon: '🧠', unlockedAt: null },
  { id: 'xp_hunter', title: 'XP Hunter', description: 'Earn 1000 total XP', icon: '💎', unlockedAt: null },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Pass 5 quizzes on the first try', icon: '💯', unlockedAt: null },
  { id: 'unstoppable', title: 'Unstoppable', description: '7-day learning streak', icon: '🚀', unlockedAt: null },
];

export const getAchievements = (): Achievement[] => {
  try {
    const data = localStorage.getItem(getStorageKey(ACHIEVEMENTS_KEY_BASE));
    if (data) return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load achievements:', error);
  }
  return [...DEFAULT_ACHIEVEMENTS];
};

const saveAchievements = (achievements: Achievement[]): void => {
  localStorage.setItem(getStorageKey(ACHIEVEMENTS_KEY_BASE), JSON.stringify(achievements));
};

export const unlockAchievement = (id: string): Achievement | null => {
  const achievements = getAchievements();
  const achievement = achievements.find(a => a.id === id);
  if (achievement && !achievement.unlockedAt) {
    achievement.unlockedAt = Date.now();
    saveAchievements(achievements);
    return achievement;
  }
  return null;
};

const checkAchievements = async (): Promise<void> => {
  try {
    const allProgressData = await getAllProgress();
    const topics = Object.values(allProgressData);
    const totalXP = topics.reduce((sum, t) => sum + (t.currentXP || 0), 0);
    const totalCompleted = topics.filter(t => t.completionTimestamp).length;
    const totalNodes = topics.reduce((sum, t) => sum + t.completedNodeIds.length, 0);
    const streak = getStreakData();
    const perfectQuizzes = topics.reduce((sum, t) => sum + (t.perfectQuizzes || 0), 0);

    if (totalNodes >= 1) unlockAchievement('first_steps');
    if (totalCompleted >= 1) unlockAchievement('tree_complete');
    if (topics.length >= 3) unlockAchievement('knowledge_seeker');
    if (totalXP >= 1000) unlockAchievement('xp_hunter');
    if (streak.currentStreak >= 3) unlockAchievement('on_fire');
    if (streak.currentStreak >= 7) unlockAchievement('unstoppable');
    if (perfectQuizzes >= 5) unlockAchievement('perfectionist');

    // Speed learner check
    topics.forEach(t => {
      if (t.startTimestamp && t.completionTimestamp) {
        const duration = t.completionTimestamp - t.startTimestamp;
        if (duration < 5 * 60 * 1000) unlockAchievement('speed_learner');
      }
    });
  } catch (error) {
    console.error('Failed to check achievements:', error);
  }
};

// ─── Sound Settings ──────────────────────────────────────────

export const isSoundEnabled = (): boolean => {
  const val = localStorage.getItem(SOUND_KEY);
  return val !== 'false'; // Default to true
};

export const setSoundEnabled = (enabled: boolean): void => {
  localStorage.setItem(SOUND_KEY, String(enabled));
};

// ─── Data Cleanup Helper ───────────────────────────────────

/**
 * Clears old localStorage data (no longer needed with Supabase)
 */
export const clearOldLocalStorageData = (): void => {
  try {
    // Remove ALL old progress keys (non-scoped and user-scoped)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('pathfinder_progress') || 
          key?.startsWith('pathfinder_migrated')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('[ProgressStorage] Cleared old localStorage progress data');
  } catch (error) {
    console.error('Failed to clear old data:', error);
  }
};

