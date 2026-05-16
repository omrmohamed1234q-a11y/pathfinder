import { supabase } from '@/lib/supabase';
import type { SkillNode, SkillTree } from '@/types/skilltree';
import { assignNodeVariants } from '@/utils/nodeVariants';

// Re-export for backward compatibility
export type { SkillNode, SkillTree };

// Also re-export shape/variant types  
export type { NodeShape, NodeSize, NodeVariant } from '@/types/skilltree';

export interface LessonContent {
  introduction: string;
  core_content: string;
  code_example: string;
  key_takeaway: string;
  fun_fact: string;
}

// Legacy type alias for backward compatibility
export type GeneratedLesson = LessonContent;

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

// Legacy type alias for backward compatibility
export type GeneratedQuiz = Quiz;

// Legacy type for backward compatibility with SkillAssessmentModal
export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate a complete skill tree from a topic
 */
export async function generateSkillTree(topic: string, nodeCount: number = 0): Promise<{ tree_id: string; skill_tree: SkillTree }> {
  // Try Groq first (primary LLM with 4 keys), then fall back to Gemini, then to demo
  let skillTree: SkillTree;
  let errorMessages: string[] = [];
  
  console.log(`🌳 [SKILL TREE] Starting generation for topic: "${topic}" (nodeCount: ${nodeCount || 'auto'})`);
  
  try {
    // Try Groq first (LLaMA 3.1 8B - best quality)
    console.log('🚀 [SKILL TREE] Attempting to generate with Groq...');
    const { generateSkillTree: groqGenerateTree } = await import('./groqService');
    skillTree = await groqGenerateTree(topic, nodeCount);
    console.log('✅ [SKILL TREE] Successfully generated with Groq (LLaMA)');
    console.log(`📊 [SKILL TREE] Generated ${skillTree.nodes.length} nodes:`, skillTree.nodes.map(n => n.title).join(', '));
  } catch (groqError) {
    console.error('❌ [SKILL TREE] Groq failed:', groqError);
    console.error('🔍 [SKILL TREE] Groq error details:', {
      message: groqError instanceof Error ? groqError.message : 'Unknown error',
      stack: groqError instanceof Error ? groqError.stack : undefined,
    });
    errorMessages.push(`Groq: ${groqError instanceof Error ? groqError.message : 'Unknown error'}`);
    
    try {
      // Fall back to Gemini
      console.log('🚀 [SKILL TREE] Attempting to generate with Gemini (fallback)...');
      const { generateSkillTree: geminiGenerateTree } = await import('./geminiService');
      skillTree = await geminiGenerateTree(topic);
      console.log('✅ [SKILL TREE] Successfully generated with Gemini (fallback)');
    } catch (geminiError) {
      console.error('❌ [SKILL TREE] Gemini failed:', geminiError);
      errorMessages.push(`Gemini: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
      
      // Final fallback: use demo skill tree
      console.warn('⚠️ [SKILL TREE] All AI services failed. Using demo skill tree for:', topic);
      console.warn('📋 [SKILL TREE] Error summary:', errorMessages.join(' | '));
      const { createDemoSkillTree } = await import('./demoSkillTree');
      skillTree = createDemoSkillTree(topic);
      console.log('⚠️ [SKILL TREE] Using demo data with generic nodes');
    }
  }
  
  // Apply visual variants (shapes, sizes, boss/checkpoint/legendary markers)
  skillTree.nodes = assignNodeVariants(skillTree.nodes);
  console.log(`🎨 [SKILL TREE] Applied node variants`);
  
  // Generate a unique tree ID
  const tree_id = `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Save to localStorage for persistence
  const existingTrees = JSON.parse(localStorage.getItem('skill_trees') || '{}');
  existingTrees[tree_id] = {
    topic,
    skill_tree: skillTree,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem('skill_trees', JSON.stringify(existingTrees));
  
  console.log(`💾 [SKILL TREE] Saved to localStorage with ID: ${tree_id}`);
  
  return { tree_id, skill_tree: skillTree };
}

/**
 * Generate lesson content for a specific node
 */
export async function generateLesson(
  treeId: string,
  nodeId: number,
  nodeTitle: string,
  nodeDescription: string,
  topic: string
): Promise<{ lesson_id: string; content: LessonContent }>;

/**
 * Legacy overload for backward compatibility
 * @deprecated Use generateLesson(treeId, nodeId, nodeTitle, nodeDescription, topic) instead
 */
export async function generateLesson(
  nodeTitle: string,
  topic: string
): Promise<{ lesson_id: string; content: LessonContent }>;

export async function generateLesson(
  arg1: string,
  arg2: string | number,
  arg3?: string,
  arg4?: string,
  arg5?: string
): Promise<{ lesson_id: string; content: LessonContent }> {
  // Legacy call: generateLesson(nodeTitle, topic)
  if (typeof arg2 === 'string' && arg3 === undefined) {
    const nodeTitle = arg1;
    const topic = arg2;
    
    try {
      // Try Groq first
      console.log(`📚 Generating lesson for: "${nodeTitle}" in "${topic}"`);
      const { generateLesson: groqGenerateLesson } = await import('./groqService');
      const result = await groqGenerateLesson(nodeTitle, topic);
      
      // Use Gemini to enhance the lesson with relevant links and YouTube videos
      let enhancedContent = result.lesson;
      try {
        console.log(`🔗 Enhancing lesson with Gemini links for: "${nodeTitle}"`);
        const { addLinksToLesson } = await import('./geminiService');
        enhancedContent = await addLinksToLesson(nodeTitle, topic, result.lesson);
      } catch (geminiError) {
        console.warn(`⚠️ Failed to enhance lesson with Gemini, using base Groq lesson:`, geminiError);
      }

      console.log('✅ Lesson generated successfully');
      return {
        lesson_id: `lesson_${Date.now()}`,
        content: {
          introduction: enhancedContent.introduction,
          core_content: enhancedContent.core_content,
          code_example: enhancedContent.code_example || null,
          key_takeaway: enhancedContent.key_takeaway,
          fun_fact: enhancedContent.fun_fact,
        },
      };
    } catch (error: any) {
      console.error('❌ Failed to generate lesson with Groq:', {
        error: error.message,
        nodeTitle,
        topic,
        stack: error.stack,
      });
      
      // NO SILENT FALLBACK — rethrow so the UI shows the error and user can retry
      console.error('❌ All lesson generation failed — NOT returning mock data');
      throw new Error(`Failed to generate lesson for "${nodeTitle}": ${error.message}. Please retry.`);
    }
  }

  // New call: generateLesson(treeId, nodeId, nodeTitle, nodeDescription, topic)
  const treeId = arg1;
  const nodeId = arg2 as number;
  const nodeTitle = arg3 as string;
  const nodeDescription = arg4 as string;
  const topic = arg5 as string;

  const { data, error } = await supabase.functions.invoke('generate-lesson', {
    body: {
      tree_id: treeId,
      node_id: nodeId,
      node_title: nodeTitle,
      node_description: nodeDescription,
      topic,
    },
  });

  if (error) {
    console.error('Error generating lesson:', error);
    throw new Error(error.message || 'Failed to generate lesson');
  }

  return data;
}

/**
 * Generate quiz for a specific node
 */
export async function generateQuiz(
  treeId: string,
  nodeId: number,
  nodeTitle: string,
  lessonContent?: string
): Promise<{ quiz_id: string; quiz: Quiz }>;

/**
 * Legacy overload for backward compatibility
 * @deprecated Use generateQuiz(treeId, nodeId, nodeTitle, lessonContent) instead
 */
export async function generateQuiz(
  nodeTitle: string,
  topic: string
): Promise<{ quiz_id: string; quiz: Quiz }>;

export async function generateQuiz(
  arg1: string,
  arg2: string | number,
  arg3?: string | number,
  arg4?: string | number | 'easy' | 'medium' | 'hard',
  arg5?: 'easy' | 'medium' | 'hard' | 'multiple_choice' | 'true_false' | 'mixed',
  arg6?: 'multiple_choice' | 'true_false' | 'mixed'
): Promise<{ quiz_id: string; quiz: Quiz }> {
  // Legacy call: generateQuiz(nodeTitle, topic, numQuestions?, difficulty?, format?)
  if (typeof arg2 === 'string' && !arg3?.toString().includes?.('_')) {
    const nodeTitle = arg1;
    const topic = arg2;
    
    // arg3 = numQuestions (number), arg4 = difficulty (string), arg5 = format (string)
    const numQuestions = typeof arg3 === 'number' ? arg3 : 5;
    const difficulty: 'easy' | 'medium' | 'hard' = 
      (arg4 === 'easy' || arg4 === 'medium' || arg4 === 'hard') ? arg4 :
      (arg5 === 'easy' || arg5 === 'medium' || arg5 === 'hard') ? arg5 : 'hard';
    const format: 'multiple_choice' | 'true_false' | 'mixed' = 
      (arg5 === 'multiple_choice' || arg5 === 'true_false' || arg5 === 'mixed') ? arg5 :
      (arg6 === 'multiple_choice' || arg6 === 'true_false' || arg6 === 'mixed') ? arg6 : 'multiple_choice';
    
    try {
      console.log(`🎯 [AI SERVICE] Generating quiz: "${nodeTitle}" in "${topic}", ${numQuestions} questions, ${difficulty} difficulty, ${format} format`);
      const { generateQuiz: groqGenerateQuiz } = await import('./groqService');
      const result = await groqGenerateQuiz(nodeTitle, topic, numQuestions, difficulty, format);
      
      // Transform Groq response to Quiz format
      const rawQuestions = result.quiz?.questions || [];
      const questions = rawQuestions.map((q: any) => {
        // Handle both {id, text, correct} objects and plain string arrays
        if (q.options?.length > 0 && typeof q.options[0] === 'object' && q.options[0].text) {
          return {
            question: q.question,
            options: q.options.map((o: any) => o.text),
            correct_answer: q.correct_answer ?? q.options.findIndex((o: any) => o.correct),
            explanation: q.explanation || '',
          };
        }
        return {
          question: q.question,
          options: q.options || [],
          correct_answer: q.correct_answer ?? 0,
          explanation: q.explanation || '',
        };
      });
      
      console.log(`✅ [AI SERVICE] Successfully generated ${questions.length} quiz questions`);
      
      return {
        quiz_id: `quiz_${Date.now()}`,
        quiz: { questions },
      };
    } catch (error) {
      console.error('❌ [AI SERVICE] Failed to generate quiz with Groq:', error);
      
      // Fallback: generate meaningful practice questions matching requested count
      const qTemplates = [
        { q: `Which of the following best describes the purpose of ${nodeTitle}?`, o: ['It provides foundational understanding for learners', 'It is only used in advanced scenarios', 'It has no practical applications', 'It replaces all other concepts'], c: 0, e: `${nodeTitle} provides foundational understanding in ${topic}.` },
        { q: `What is a key benefit of understanding ${nodeTitle} in ${topic}?`, o: ['It simplifies complex problems', 'It makes code run faster', 'It eliminates the need for testing', 'It replaces documentation'], c: 0, e: `Understanding ${nodeTitle} helps simplify complex problems.` },
        { q: `When working with ${nodeTitle}, which practice is most recommended?`, o: ['Start with small examples and build up', 'Skip the basics entirely', 'Memorize everything without practice', 'Avoid using it in real projects'], c: 0, e: `Starting small is the best approach for ${nodeTitle}.` },
        { q: `How does ${nodeTitle} relate to other concepts in ${topic}?`, o: ['It serves as a building block for advanced topics', 'It is completely independent', 'It contradicts other core concepts', 'It is only for beginners'], c: 0, e: `${nodeTitle} is a building block for advanced topics in ${topic}.` },
        { q: `What is the most common mistake when learning ${nodeTitle}?`, o: ['Not practicing enough with real examples', 'Spending too much time on it', 'Learning it too early', 'Reading too much documentation'], c: 0, e: `Hands-on practice is essential for mastering ${nodeTitle}.` },
        { q: `Which scenario best demonstrates ${nodeTitle} in action?`, o: ['Solving a real-world problem step by step', 'Reading a textbook chapter', 'Watching a video without practicing', 'Skipping to the next topic'], c: 0, e: `Real-world problem solving is the best demonstration of ${nodeTitle}.` },
        { q: `What prerequisite knowledge is most helpful before learning ${nodeTitle}?`, o: ['Basic understanding of core concepts in ${topic}', 'Advanced mathematics', 'No prerequisites needed', 'Expertise in a different field'], c: 0, e: `Basic understanding of ${topic} fundamentals helps with ${nodeTitle}.` },
        { q: `How should you evaluate your understanding of ${nodeTitle}?`, o: ['By applying it to solve new problems independently', 'By memorizing definitions', 'By reading more theory', 'By watching others solve problems'], c: 0, e: `Independent problem solving is the best way to evaluate understanding.` },
        { q: `What distinguishes an expert in ${nodeTitle} from a beginner?`, o: ['Ability to apply concepts in novel situations', 'Speed of memorization', 'Number of books read', 'Years of experience alone'], c: 0, e: `Experts can apply ${nodeTitle} concepts in novel situations.` },
        { q: `Which learning strategy is most effective for ${nodeTitle}?`, o: ['Active recall and spaced repetition', 'Passive reading only', 'Cramming before a test', 'Skipping practice exercises'], c: 0, e: `Active recall and spaced repetition are proven effective strategies.` },
        { q: `What role does ${nodeTitle} play in professional ${topic} work?`, o: ['It is a fundamental skill used daily', 'It is rarely used in practice', 'It is only theoretical', 'It has been replaced by newer methods'], c: 0, e: `${nodeTitle} is a fundamental skill in professional ${topic} work.` },
        { q: `How can you deepen your understanding of ${nodeTitle}?`, o: ['Build projects that use the concept', 'Only read documentation', 'Avoid challenging problems', 'Focus on unrelated topics'], c: 0, e: `Building projects is the best way to deepen understanding of ${nodeTitle}.` },
        { q: `What is a common misconception about ${nodeTitle}?`, o: ['That it is too simple to be important', 'That it is the hardest concept', 'That it requires special tools', 'That it cannot be learned online'], c: 0, e: `Many underestimate the importance and depth of ${nodeTitle}.` },
        { q: `When should you revisit ${nodeTitle} in your learning journey?`, o: ['Whenever you encounter related advanced topics', 'Never, once learned it is done', 'Only during exams', 'Only when explicitly told to'], c: 0, e: `Revisiting ${nodeTitle} when encountering advanced topics reinforces understanding.` },
        { q: `What type of feedback is most valuable when practicing ${nodeTitle}?`, o: ['Immediate feedback on mistakes with explanations', 'No feedback at all', 'Feedback only after completing everything', 'Only positive feedback'], c: 0, e: `Immediate feedback with explanations accelerates learning of ${nodeTitle}.` },
        { q: `How does mastering ${nodeTitle} benefit your career in ${topic}?`, o: ['It opens doors to advanced roles and projects', 'It has no career impact', 'It only matters for entry-level work', 'It is not recognized by employers'], c: 0, e: `Mastering ${nodeTitle} opens doors to advanced roles in ${topic}.` },
        { q: `What tool or resource is most helpful for learning ${nodeTitle}?`, o: ['Interactive exercises with real examples', 'Lengthy textbooks only', 'Social media posts', 'Random internet searches'], c: 0, e: `Interactive exercises with real examples are most helpful for ${nodeTitle}.` },
        { q: `How do you know when you have truly mastered ${nodeTitle}?`, o: ['You can teach it to someone else clearly', 'You can recite the definition', 'You have read about it multiple times', 'You have a certificate'], c: 0, e: `Being able to teach ${nodeTitle} clearly indicates true mastery.` },
        { q: `What is the relationship between ${nodeTitle} and problem-solving?`, o: ['It provides frameworks for structured problem-solving', 'They are unrelated', 'It makes problems harder', 'It only applies to simple problems'], c: 0, e: `${nodeTitle} provides frameworks for structured problem-solving in ${topic}.` },
        { q: `Why is consistent practice important for ${nodeTitle}?`, o: ['It builds long-term retention and intuition', 'It is not important at all', 'Only intensive cramming works', 'Practice is only for beginners'], c: 0, e: `Consistent practice builds long-term retention and intuition for ${nodeTitle}.` },
      ];

      const fallbackQuestions = Array.from({ length: numQuestions }, (_, i) => {
        const t = qTemplates[i % qTemplates.length];
        return { question: t.q, options: t.o, correct_answer: t.c, explanation: t.e };
      });

      return {
        quiz_id: 'fallback-quiz',
        quiz: { questions: fallbackQuestions },
      };
    }
  }

  // New call: generateQuiz(treeId, nodeId, nodeTitle, lessonContent)
  const treeId = arg1;
  const nodeId = arg2 as number;
  const nodeTitle = arg3 as string;
  const lessonContent = arg4;

  const { data, error } = await supabase.functions.invoke('generate-quiz', {
    body: {
      tree_id: treeId,
      node_id: nodeId,
      node_title: nodeTitle,
      lesson_content: lessonContent,
    },
  });

  if (error) {
    console.error('Error generating quiz:', error);
    throw new Error(error.message || 'Failed to generate quiz');
  }

  return data;
}

/**
 * Chat with AI tutor (streaming response)
 */
export async function chatWithTutor(
  message: string,
  history: ChatMessage[] = [],
  context?: string
): Promise<ReadableStream> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/ai-tutor-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        message,
        history,
        context,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to chat with tutor');
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  return response.body;
}

/**
 * Parse SSE stream from AI tutor
 */
export async function parseSSEStream(
  stream: ReadableStream,
  onChunk: (text: string) => void
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              const text = data.candidates[0].content.parts[0].text;
              fullText += text;
              onChunk(text);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}

/**
 * Get all skill trees for current user
 */
export async function getUserSkillTrees(): Promise<any[]> {
  const { data, error } = await supabase
    .from('skill_trees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching skill trees:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a specific skill tree by ID
 */
export async function getSkillTree(treeId: string): Promise<any> {
  const { data, error } = await supabase
    .from('skill_trees')
    .select('*')
    .eq('id', treeId)
    .single();

  if (error) {
    console.error('Error fetching skill tree:', error);
    throw error;
  }

  return data;
}

/**
 * Get lesson for a specific node
 */
export async function getLesson(treeId: string, nodeId: number): Promise<LessonContent | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('content_json')
    .eq('tree_id', treeId)
    .eq('node_id', nodeId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }

  return data?.content_json || null;
}

/**
 * Get quiz for a specific node
 */
export async function getQuiz(treeId: string, nodeId: number): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('questions_json')
    .eq('tree_id', treeId)
    .eq('node_id', nodeId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching quiz:', error);
    return null;
  }

  return data?.questions_json || null;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateSkillTree instead
 */
export async function callAIWithFallback(prompt: string): Promise<string> {
  console.warn('callAIWithFallback is deprecated. Use generateSkillTree instead.');
  return '';
}

/**
 * Generate assessment survey to understand learner's background
 * This is NOT a quiz - there are no right/wrong answers
 */
export async function generateAssessment(topic: string, content: string): Promise<{ questions: AssessmentQuestion[] }> {
  console.log(`📝 [AI SERVICE] Generating assessment survey for: "${topic}"`);
  
  try {
    // Use Groq to generate survey questions
    const { generateAssessment: groqGenerateAssessment } = await import('./groqService');
    const result = await groqGenerateAssessment(topic, '');
    
    console.log('✅ [AI SERVICE] Assessment survey generated successfully');
    
    // Transform Groq response to AssessmentQuestion format
    // Note: correctAnswer is set to 0 as placeholder - these are survey questions, not quiz questions
    return {
      questions: result.questions.map((q: any) => ({
        question: q.question,
        options: Array.isArray(q.options) ? q.options : q.options.map((opt: any) => opt.text || opt),
        correctAnswer: 0, // Placeholder - not used for survey questions
        difficulty: 'beginner' as const,
      })),
    };
  } catch (error: any) {
    console.error('❌ [AI SERVICE] Failed to generate assessment:', {
      error: error.message,
      topic,
    });
    
    // Fallback to default survey questions
    console.warn('⚠️ [AI SERVICE] Using fallback survey questions');
    return {
      questions: [
        {
          question: `What is your familiarity with ${topic}?`,
          options: [
            'Complete beginner - I\'ve never studied this before',
            'Some knowledge - I know the basics',
            'Intermediate - I have practical experience',
            'Advanced - I\'m proficient and can teach others',
          ],
          correctAnswer: 0,
          difficulty: 'beginner',
        },
        {
          question: `What is your primary learning goal for ${topic}?`,
          options: [
            'Build a strong foundation from scratch',
            'Fill knowledge gaps and strengthen understanding',
            'Master advanced concepts and techniques',
            'Prepare for certification or professional use',
          ],
          correctAnswer: 0,
          difficulty: 'beginner',
        },
        {
          question: `How much time can you dedicate to learning ${topic}?`,
          options: [
            '15-30 minutes per day',
            '30-60 minutes per day',
            '1-2 hours per day',
            '2+ hours per day',
          ],
          correctAnswer: 0,
          difficulty: 'beginner',
        },
      ],
    };
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated No longer needed with new architecture
 */
export function resetClient(): void {
  console.warn('resetClient is deprecated and no longer needed.');
}
