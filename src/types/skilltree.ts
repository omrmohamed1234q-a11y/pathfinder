// Content type definitions
export type NodeContentType = 'lesson' | 'video' | 'interactive' | 'flashcard' | 'project' | 'challenge' | 'podcast';

// Node visual types
export type NodeShape = 'circle' | 'hexagon' | 'star' | 'book' | 'dumbbell' | 'crown';
export type NodeSize = 'small' | 'medium' | 'large' | 'xl';
export type NodeVariant = 'standard' | 'checkpoint' | 'boss' | 'story' | 'practice' | 'legendary';

export interface LessonContent {
  type: 'lesson';
  text: string;
  examples?: string[];
  keyPoints?: string[];
}

export interface VideoContent {
  type: 'video';
  videoUrl: string;
  videoId?: string;
  platform: 'youtube' | 'vimeo' | 'custom';
  duration?: number;
  transcript?: string;
  summary?: string;
}

export interface InteractiveContent {
  type: 'interactive';
  embedUrl: string;
  platform: 'codesandbox' | 'replit' | 'codepen' | 'custom';
  instructions?: string;
  solution?: string;
}

export interface FlashcardContent {
  type: 'flashcard';
  cards: Array<{
    front: string;
    back: string;
    hint?: string;
  }>;
  repetitionData?: {
    lastReviewed?: number;
    nextReview?: number;
    easeFactor?: number;
    interval?: number;
  };
}

export interface ProjectContent {
  type: 'project';
  description: string;
  requirements: string[];
  hints?: string[];
  starterCode?: string;
  solution?: string;
  estimatedTime?: number;
}

export interface ChallengeContent {
  type: 'challenge';
  description: string;
  timeLimit?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  testCases?: Array<{
    input: string;
    expectedOutput: string;
  }>;
  hints?: string[];
}

export interface PodcastContent {
  type: 'podcast';
  audioUrl: string;
  duration: number;
  transcript?: string;
  summary?: string;
}

export type NodeContent = 
  | LessonContent 
  | VideoContent 
  | InteractiveContent 
  | FlashcardContent 
  | ProjectContent 
  | ChallengeContent
  | PodcastContent;

export interface SkillNode {
  id: number;
  title: string;
  description?: string;
  level: number;
  status: 'unlocked' | 'locked' | 'completed';
  xp: number;
  children: number[];
  prerequisites?: number[];
  illustration: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  
  // Visual appearance
  shape?: NodeShape;
  size?: NodeSize;
  variant?: NodeVariant;
  isCheckpoint?: boolean;
  isBoss?: boolean;
  isStory?: boolean;
  isPractice?: boolean;
  isLegendary?: boolean;
  
  // Enhanced content support
  contentType?: NodeContentType;
  content?: NodeContent;
  
  // Adaptive difficulty
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isOptional?: boolean;
  isBonusNode?: boolean;
  prerequisites?: number[];
  
  // Hints and help
  hints?: string[];
  currentHintIndex?: number;
  
  // Progress tracking
  attempts?: number;
  timeSpent?: number;
  lastAttempt?: number;
}

export interface SkillTree {
  topic: string;
  description?: string;
  total_xp?: number;
  nodes: SkillNode[];
  
  // Adaptive difficulty settings
  userSkillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  assessmentCompleted?: boolean;
  assessmentScore?: number;
}
