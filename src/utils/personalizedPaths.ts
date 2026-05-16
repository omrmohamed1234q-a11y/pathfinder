import { supabase } from '@/lib/supabase';
import { getAllProgress, getCompletedTopics } from './progressStorage';
import { callAIWithFallback } from '@/services/aiService';

export interface PersonalizedCareerPath {
  id: string;
  title: string;
  description: string;
  reason: string; // Why this is recommended
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  trees: {
    topic: string;
    order: number;
    description: string;
  }[];
  matchScore: number; // 0-100, how well it matches user's profile
}

const RECOMMENDATION_SYSTEM_PROMPT = `You are a career path recommendation AI. Analyze the user's learning history and suggest personalized career paths that match their interests and skill level.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "recommendations": [
    {
      "id": "unique-id",
      "title": "Career Path Title",
      "description": "Brief description (1-2 sentences)",
      "reason": "Why this matches their profile (1 sentence)",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedTime": "e.g., 3-6 months",
      "trees": [
        {
          "topic": "Topic Name",
          "order": 1,
          "description": "What they'll learn"
        }
      ],
      "matchScore": 85
    }
  ]
}`;

/**
 * Generate personalized career path recommendations based on user's learning history
 */
export const generatePersonalizedPaths = async (): Promise<PersonalizedCareerPath[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get user's completed topics and progress
    const completedTopics = await getCompletedTopics();
    const allProgress = await getAllProgress();
    
    // If user has no progress, return empty (show default paths)
    if (completedTopics.length === 0) {
      return [];
    }

    // Analyze user's learning patterns
    const topicsList = completedTopics.join(', ');
    const totalXP = Object.values(allProgress).reduce((sum, p) => sum + p.currentXP, 0);
    
    const userPrompt = `User's completed topics: ${topicsList}
Total XP earned: ${totalXP}
Number of topics completed: ${completedTopics.length}

Generate 3 personalized career path recommendations that build on what they've learned.`;

    // Use AI system (legacy - returns empty for now)
    const content = await callAIWithFallback(userPrompt);
    
    // Parse the AI response
    let recommendations: PersonalizedCareerPath[] = [];
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      if (cleanContent) {
        const parsed = JSON.parse(cleanContent);
        recommendations = parsed.recommendations || [];
      }
    } catch (e) {
      console.error('Failed to parse AI recommendations:', e);
      console.error('Raw content:', content);
      return [];
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating personalized paths:', error);
    return [];
  }
};

/**
 * Generate a custom career path based on user's goal
 */
export const generateCustomCareerPath = async (goal: string): Promise<PersonalizedCareerPath | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // We allow guests to generate at least one path (or handled by UI)
    // The Groq service will generate the path.
    const { generateCustomCareerPath: groqGenerateCareerPath } = await import('@/services/groqService');
    const path = await groqGenerateCareerPath(goal);
    
    return path;
  } catch (error) {
    console.error('Error generating custom path:', error);
    return null;
  }
};
