import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gtjlzwqgbdiphbcabdrc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amx6d3FnYmRpcGhiY2FiZHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDM2ODgsImV4cCI6MjA5MjA3OTY4OH0.j2qc7oxfYTEwzGlpJYw7alrQiLtxN7qplj25MTz0Ryw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types for database tables
export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  learning_goals: string | null;
  created_at: string;
  updated_at: string;
  total_xp: number;
  overall_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  is_premium: boolean;
}

export interface UserProgress {
  id: string;
  user_id: string;
  skill_tree_id: string | null;
  topic: string;
  completed_node_ids: number[];
  current_xp: number;
  current_level: number;
  start_timestamp: number;
  completion_timestamp: number | null;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface SkillTreeRecord {
  id: string;
  topic: string;
  created_by: string | null;
  tree_data: any;
  is_public: boolean;
  is_featured: boolean;
  views_count: number;
  clones_count: number;
  rating_sum: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_xp?: number;
  xp_earned?: number;
  nodes_completed?: number;
  overall_level: number;
  current_streak: number;
  rank: number;
}

export interface StudyRoom {
  id: string;
  name: string;
  room_code: string;
  host_id: string;
  skill_tree_id: string | null;
  topic: string;
  mode: 'coop' | 'battle' | 'study';
  max_players: number;
  is_active: boolean;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  score: number;
  is_ready: boolean;
}
