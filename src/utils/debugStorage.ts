/**
 * Debug utility to help diagnose data isolation issues
 */

export const debugStorageState = (): void => {
  console.group('🔍 Storage Debug Info');
  
  // Check current user ID
  const currentUserId = localStorage.getItem('pathfinder_current_user_id');
  console.log('Current User ID:', currentUserId || 'NOT SET (will use anonymous)');
  
  // List all pathfinder keys in localStorage
  console.group('All Pathfinder Keys in localStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('pathfinder_')) {
      const value = localStorage.getItem(key);
      const preview = value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : 'null';
      console.log(`  ${key}:`, preview);
    }
  }
  console.groupEnd();
  
  // Check specific keys
  console.group('User-Scoped Keys:');
  if (currentUserId) {
    const progressKey = `pathfinder_progress_${currentUserId}`;
    const achievementsKey = `pathfinder_achievements_${currentUserId}`;
    const streakKey = `pathfinder_streak_${currentUserId}`;
    const cacheKey = `pathfinder_content_cache_${currentUserId}`;
    
    console.log(`Progress (${progressKey}):`, localStorage.getItem(progressKey) ? 'EXISTS' : 'NOT FOUND');
    console.log(`Achievements (${achievementsKey}):`, localStorage.getItem(achievementsKey) ? 'EXISTS' : 'NOT FOUND');
    console.log(`Streak (${streakKey}):`, localStorage.getItem(streakKey) ? 'EXISTS' : 'NOT FOUND');
    console.log(`Cache (${cacheKey}):`, localStorage.getItem(cacheKey) ? 'EXISTS' : 'NOT FOUND');
  } else {
    console.log('No user ID set - will use anonymous scope');
  }
  console.groupEnd();
  
  // Check anonymous keys
  console.group('Anonymous Keys:');
  const anonProgressKey = 'pathfinder_progress_anonymous';
  const anonAchievementsKey = 'pathfinder_achievements_anonymous';
  const anonStreakKey = 'pathfinder_streak_anonymous';
  const anonCacheKey = 'pathfinder_content_cache_anonymous';
  
  console.log(`Progress (${anonProgressKey}):`, localStorage.getItem(anonProgressKey) ? 'EXISTS' : 'NOT FOUND');
  console.log(`Achievements (${anonAchievementsKey}):`, localStorage.getItem(anonAchievementsKey) ? 'EXISTS' : 'NOT FOUND');
  console.log(`Streak (${anonStreakKey}):`, localStorage.getItem(anonStreakKey) ? 'EXISTS' : 'NOT FOUND');
  console.log(`Cache (${anonCacheKey}):`, localStorage.getItem(anonCacheKey) ? 'EXISTS' : 'NOT FOUND');
  console.groupEnd();
  
  console.groupEnd();
};

// Make it available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).debugStorage = debugStorageState;
}
