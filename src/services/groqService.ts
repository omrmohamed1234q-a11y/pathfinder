import Groq from 'groq-sdk';
import type { SkillTree, SkillNode } from '@/types/skilltree';

// API Key Management - Each key for specific purpose
const API_KEYS = {
  SKILL_TREE: import.meta.env.VITE_GROQ_API_KEY_1 || localStorage.getItem('GROQ_API_KEY_1'),
  LESSON: import.meta.env.VITE_GROQ_API_KEY_2 || localStorage.getItem('GROQ_API_KEY_2'),
  QUIZ: import.meta.env.VITE_GROQ_API_KEY_3 || localStorage.getItem('GROQ_API_KEY_3'),
  ASSESSMENT: import.meta.env.VITE_GROQ_API_KEY_4 || localStorage.getItem('GROQ_API_KEY_4'),
};

// Debug: Log API key status (only first 10 chars for security)
console.log('🔑 Groq API Keys Status:', {
  SKILL_TREE: API_KEYS.SKILL_TREE ? `${API_KEYS.SKILL_TREE.substring(0, 10)}...` : '❌ MISSING',
  LESSON: API_KEYS.LESSON ? `${API_KEYS.LESSON.substring(0, 10)}...` : '❌ MISSING',
  QUIZ: API_KEYS.QUIZ ? `${API_KEYS.QUIZ.substring(0, 10)}...` : '❌ MISSING',
  ASSESSMENT: API_KEYS.ASSESSMENT ? `${API_KEYS.ASSESSMENT.substring(0, 10)}...` : '❌ MISSING',
});

// Debug: Log sources
console.log('🔍 API Key Sources:', {
  SKILL_TREE_ENV: import.meta.env.VITE_GROQ_API_KEY_1 ? 'ENV ✅' : 'ENV ❌',
  SKILL_TREE_LS: localStorage.getItem('GROQ_API_KEY_1') ? 'LS ✅' : 'LS ❌',
  LESSON_ENV: import.meta.env.VITE_GROQ_API_KEY_2 ? 'ENV ✅' : 'ENV ❌',
  LESSON_LS: localStorage.getItem('GROQ_API_KEY_2') ? 'LS ✅' : 'LS ❌',
});

// Groq client instances for each purpose
const groqClients = {
  skillTree: API_KEYS.SKILL_TREE ? new Groq({ apiKey: API_KEYS.SKILL_TREE, dangerouslyAllowBrowser: true }) : null,
  lesson: API_KEYS.LESSON ? new Groq({ apiKey: API_KEYS.LESSON, dangerouslyAllowBrowser: true }) : null,
  quiz: API_KEYS.QUIZ ? new Groq({ apiKey: API_KEYS.QUIZ, dangerouslyAllowBrowser: true }) : null,
  assessment: API_KEYS.ASSESSMENT ? new Groq({ apiKey: API_KEYS.ASSESSMENT, dangerouslyAllowBrowser: true }) : null,
};

// Model to use (LLaMA 3.1 8B - 70B was decommissioned by Groq)
const MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `You are Pathfinder AI — an expert curriculum designer. Create comprehensive, engaging learning paths.

When generating skill trees, respond with ONLY valid JSON (no markdown, no explanation):

{
  "topic": "[topic name]",
  "description": "One-sentence description of this learning path",
  "total_xp": [sum of all node XP],
  "nodes": [
    {
      "id": 1,
      "title": "Node Title (2-4 words)",
      "level": 1,
      "xp": 100,
      "children": [2, 3],
      "illustration_prompt": "Digital art, fantasy RPG style — [vivid scene]",
      "lesson_preview": "What this node teaches"
    }
  ]
}

TREE STRUCTURE RULES:
1. Generate 12-18 nodes total across 5-6 levels
2. Level 1 (Foundation): 1 root node, XP=100 — absolute basics
3. Level 2 (Core): 2-3 nodes, XP=150 each — fundamental pillars 
4. Level 3 (Building): 3-4 nodes, XP=200 each — deeper concepts, branching paths
5. Level 4 (Applied): 3-4 nodes, XP=250 each — practical application, projects
6. Level 5 (Advanced): 2-3 nodes, XP=300 each — advanced techniques
7. Level 6 (Mastery): 1 capstone node, XP=500 — mastery project

BRANCHING RULES:
- Level 1 root connects to ALL level 2 nodes
- Level 2 nodes each connect to 1-2 level 3 nodes
- Level 3 nodes connect to 1-2 level 4 nodes
- Level 4+ nodes can share children (convergent paths)
- The capstone node should require multiple level 5 prerequisites
- NO orphan nodes — every node must be reachable from root

NODE NAMING RULES (CRITICAL):
- NEVER use generic names like "Introduction", "Getting Started", "Core Concepts", "Fundamentals", "Advanced Topics", "Mastery", "Capstone"
- ALWAYS use domain-specific terminology for the EXACT topic being taught
- Examples for "Python": "Variables & Types", "List Comprehensions", "Decorators", "Async Patterns", "Unit Testing"
- Examples for "Guitar": "Open Chords", "Barre Technique", "Pentatonic Scales", "Fingerpicking", "Song Composition"
- Examples for "Machine Learning": "Linear Regression", "Gradient Descent", "Neural Networks", "Backpropagation", "Hyperparameter Tuning"
- Each title max 4 words
- illustration_prompt must be unique and vivid per node
- lesson_preview should be specific and actionable`;




// Helper function to call Groq API
async function callGroq(client: Groq | null, prompt: string, systemPrompt: string = SYSTEM_PROMPT, maxTokens: number = 4096): Promise<string> {
  if (!client) {
    console.error('❌ Groq client is null - API key not configured');
    throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY_* to your .env file');
  }

  try {
    console.log('🚀 Calling Groq API with model:', MODEL, 'maxTokens:', maxTokens);
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq API response received:', response.substring(0, 100) + '...');
    return response;
  } catch (error: any) {
    console.error('❌ Groq API call failed:', {
      error: error.message,
      status: error.status,
      type: error.error?.type,
      code: error.error?.code,
    });
    throw error;
  }
}

// Smart key rotation: tries primary client, then rotates through ALL other keys on rate limit
async function callGroqWithFallback(primaryClient: Groq | null, prompt: string, systemPrompt: string, maxTokens: number = 4096): Promise<string> {
  const allClients = [
    { name: 'primary', client: primaryClient },
    { name: 'skillTree', client: groqClients.skillTree },
    { name: 'lesson', client: groqClients.lesson },
    { name: 'quiz', client: groqClients.quiz },
    { name: 'assessment', client: groqClients.assessment },
  ];
  
  // Deduplicate — don't retry the same client twice
  const seen = new Set<string>();
  const uniqueClients = allClients.filter(c => {
    if (!c.client) return false;
    const key = (c.client as any)._options?.apiKey || c.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  let lastError: any;
  for (const { name, client } of uniqueClients) {
    try {
      console.log(`🔑 Trying Groq key: ${name}`);
      return await callGroq(client, prompt, systemPrompt, maxTokens);
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error.status === 413 || error.status === 429 || error.error?.code === 'rate_limit_exceeded';
      if (isRateLimit) {
        console.warn(`⚠️ Rate limit on key '${name}', trying next key...`);
        continue;
      }
      // Non-rate-limit error — don't retry
      throw error;
    }
  }
  
  throw lastError || new Error('All Groq API keys exhausted');
}

// Generate skill tree using Key 1
export const generateSkillTree = async (topic: string, nodeCount: number = 0): Promise<SkillTree> => {
  // nodeCount=0 means "auto" — let AI decide
  const countInstruction = nodeCount > 0
    ? `Generate EXACTLY ${nodeCount} nodes total.`
    : `Generate 8-12 nodes total (choose based on topic complexity).`;


  const prompt = `Topic: "${topic}"

${countInstruction}

IMPORTANT:
- Use 5-6 levels with branching paths
- Make ALL node titles SPECIFIC to "${topic}" — use real domain terminology, concepts, and subtopics
- DO NOT use generic names like "Introduction", "Getting Started", "Core Concepts", "Fundamentals", "Mastery"
- INSTEAD use topic-specific names. E.g. for "Python": "Variables & Types", "List Comprehensions", "Decorators", "Async/Await"
- Level 1: 1 root node. Level 2: 2-3 nodes. Level 3: 3-4 nodes. Level 4: 3-4 nodes. Level 5: 2-3 nodes. Level 6: 1 capstone.
- Every node must be reachable from root via children arrays
- Each node title: 2-4 words, unique and descriptive

Generate the skill tree JSON now:`;

  try {
    console.log(`🌳 Generating skill tree for: "${topic}"`);
    const responseText = await callGroqWithFallback(groqClients.skillTree, prompt, SYSTEM_PROMPT, 8192);
    
    // Parse JSON response
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    console.log('📄 Parsing JSON response...');
    const parsed = JSON.parse(jsonText);
    
    // Transform to SkillTree format
    const skillTree: SkillTree = {
      topic: parsed.topic,
      description: parsed.description,
      total_xp: parsed.total_xp,
      nodes: parsed.nodes.map((node: any) => ({
        id: node.id,
        title: node.title,
        description: node.lesson_preview,
        level: node.level,
        xp: node.xp,
        children: node.children || [],
        status: node.id === 1 ? 'unlocked' : 'locked',
        prerequisites: [],
        illustration: node.illustration_prompt,
        shape: 'circle',
        size: 'medium',
        variant: 'standard',
      })),
    };
    
    // Calculate prerequisites based on children
    skillTree.nodes.forEach((node) => {
      node.children.forEach((childId) => {
        const childNode = skillTree.nodes.find((n) => n.id === childId);
        if (childNode) {
          childNode.prerequisites.push(node.id);
        }
      });
    });
    
    console.log(`✅ Skill tree generated successfully with ${skillTree.nodes.length} nodes`);
    return skillTree;
  } catch (error: any) {
    console.error('❌ Error generating skill tree with Groq:', {
      error: error.message,
      topic,
    });
    throw new Error(`Failed to generate skill tree: ${error.message}`);
  }
};

// Generate lesson using Key 2 (with fallback rotation)
export const generateLesson = async (nodeTitle: string, topic: string): Promise<any> => {
  console.log(`📚 [LESSON] Generating for: "${nodeTitle}" in "${topic}"`);
  
  const lessonSystemPrompt = `You are an expert educator. Generate real, substantive educational content.
CRITICAL JSON RULES:
- Respond with ONLY valid JSON, no markdown, no code blocks.
- Escape ALL double quotes inside string values with backslash.
- Escape ALL newlines inside strings as \\n.
- Do NOT use actual line breaks inside JSON string values.
- For code_example, put code on a SINGLE LINE using \\n for newlines.
- Keep the total response under 2000 characters to avoid truncation.`;
  
  const prompt = `Create a concise lesson for "${nodeTitle}" (topic: ${topic}).

Return this exact JSON structure:
{
  "node_title": "${nodeTitle}",
  "lesson": {
    "introduction": "2-3 sentences about what ${nodeTitle} is and why it matters",
    "core_content": "150-200 words of teaching with practical examples. Keep it concise.",
    "code_example": "A short code snippet if relevant (use \\n for newlines), or null if not a coding topic",
    "key_takeaway": "One specific actionable insight",
    "fun_fact": "A real surprising fact about this topic"
  }
}

IMPORTANT: Keep your response SHORT to avoid JSON truncation. Use \\n inside strings instead of real newlines. Escape all quotes.`;

  try {
    const responseText = await callGroqWithFallback(groqClients.lesson, prompt, lessonSystemPrompt, 2048);
    console.log(`📚 [LESSON] Raw response length: ${responseText.length}`);
    
    let jsonText = responseText.trim();
    
    // Strip markdown code fences
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    // --- JSON Repair Pipeline ---
    
    // 1. Replace real newlines/tabs inside the JSON string with spaces
    //    (but preserve escaped \\n sequences)
    jsonText = jsonText
      .replace(/\r\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ');
    
    // 2. Remove other control characters
    jsonText = jsonText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // 3. Fix truncated JSON — try to close any open braces/brackets
    const openBraces = (jsonText.match(/{/g) || []).length;
    const closeBraces = (jsonText.match(/}/g) || []).length;
    const openBrackets = (jsonText.match(/\[/g) || []).length;
    const closeBrackets = (jsonText.match(/\]/g) || []).length;
    
    // Remove trailing comma before we close
    jsonText = jsonText.replace(/,\s*$/, '');
    
    // If we have a trailing incomplete string value, close it
    // Check if last non-whitespace char suggests truncation
    const trimmed = jsonText.trimEnd();
    const lastChar = trimmed[trimmed.length - 1];
    if (lastChar !== '}' && lastChar !== ']' && lastChar !== '"' && lastChar !== 'l' /* null */) {
      // Likely truncated mid-string — close the string
      jsonText = jsonText + '"';
    }
    
    // Close missing brackets/braces
    for (let i = 0; i < openBrackets - closeBrackets; i++) jsonText += ']';
    for (let i = 0; i < openBraces - closeBraces; i++) jsonText += '}';
    
    // 4. Fix trailing commas before } or ]
    jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');
    
    console.log(`📚 [LESSON] Parsing repaired JSON...`);
    
    let result: any;
    try {
      result = JSON.parse(jsonText);
    } catch (firstError) {
      console.warn(`⚠️ [LESSON] First parse failed, attempting deeper repair...`);
      
      // Aggressive repair: try to extract just the lesson object
      const lessonMatch = jsonText.match(/"lesson"\s*:\s*({[\s\S]*})\s*}/);
      if (lessonMatch) {
        try {
          const lessonObj = JSON.parse(lessonMatch[1]);
          result = { node_title: nodeTitle, lesson: lessonObj };
        } catch {
          // Final fallback: use regex to extract individual fields
          console.warn(`⚠️ [LESSON] Deep repair failed, extracting fields manually...`);
          result = {
            node_title: nodeTitle,
            lesson: extractLessonFields(jsonText, nodeTitle, topic)
          };
        }
      } else {
        result = {
          node_title: nodeTitle,
          lesson: extractLessonFields(jsonText, nodeTitle, topic)
        };
      }
    }
    
    console.log(`✅ [LESSON] Generated for: "${nodeTitle}"`);
    return result;
  } catch (error: any) {
    console.error(`❌ [LESSON] Error generating lesson for "${nodeTitle}":`, error.message);
    
    // Return a real fallback lesson instead of crashing
    return {
      node_title: nodeTitle,
      lesson: {
        introduction: `${nodeTitle} is a key concept in ${topic}. Understanding it deeply will strengthen your overall knowledge and help you build more sophisticated projects.`,
        core_content: `${nodeTitle} is an essential building block in ${topic}. It involves understanding the fundamental principles and applying them in practical scenarios. As you progress, you'll discover how ${nodeTitle} connects to other concepts in this field, enabling you to solve increasingly complex problems. Practice is key — try to apply what you learn in small projects to reinforce your understanding.`,
        code_example: null,
        key_takeaway: `Mastering ${nodeTitle} is crucial for advancing in ${topic}. Focus on understanding the underlying principles rather than memorizing syntax.`,
        fun_fact: `Many industry experts consider ${nodeTitle} to be one of the most important foundations in ${topic}.`
      }
    };
  }
};

// Helper: extract lesson fields from broken JSON using regex
function extractLessonFields(text: string, nodeTitle: string, topic: string) {
  const extract = (key: string): string | null => {
    const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
    const match = text.match(regex);
    return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : null;
  };
  
  return {
    introduction: extract('introduction') || `${nodeTitle} is a fundamental concept in ${topic} that every learner should understand.`,
    core_content: extract('core_content') || `${nodeTitle} covers essential principles within ${topic}. Understanding these concepts will help you build a strong foundation for more advanced topics.`,
    code_example: extract('code_example') || null,
    key_takeaway: extract('key_takeaway') || `Focus on understanding and practicing ${nodeTitle} to solidify your knowledge.`,
    fun_fact: extract('fun_fact') || `${nodeTitle} is widely considered a cornerstone concept in ${topic}.`
  };
}

// Generate quiz using Key 3 - supports multiple questions
export const generateQuiz = async (
  nodeTitle: string, 
  topic: string, 
  numQuestions: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  format: 'multiple_choice' | 'true_false' | 'mixed' = 'multiple_choice'
): Promise<any> => {
  console.log(`❓ [QUIZ] Generating ${numQuestions} ${difficulty} ${format} questions for: "${nodeTitle}" in "${topic}"`);
  
  const difficultyInstructions = {
    easy: 'Questions should test recall and basic understanding. Make options clearly distinguishable.',
    medium: 'Questions should require applying knowledge. Include real-world scenarios. Wrong answers should be plausible.',
    hard: 'Questions MUST be expert-level. Test deep understanding, edge cases, and nuanced scenarios. ALL wrong options must be highly plausible.',
  };
  
  const formatInstructions = {
    multiple_choice: 'All questions must have exactly 4 options (A, B, C, D) with exactly one correct answer.',
    true_false: 'All questions should be True/False format with 2 options.',
    mixed: 'Mix of multiple choice (4 options) and true/false (2 options) questions.',
  };

  // For large counts, generate in batches
  const batchSize = Math.min(numQuestions, 10);
  const allQuestions: any[] = [];
  let batchesNeeded = Math.ceil(numQuestions / batchSize);

  for (let batch = 0; batch < batchesNeeded && allQuestions.length < numQuestions; batch++) {
    const remaining = numQuestions - allQuestions.length;
    const count = Math.min(batchSize, remaining);
    
    const quizSystemPrompt = `You are a quiz generator specialized in "${nodeTitle}".
RULES:
- Generate EXACTLY ${count} questions.
- Every single question MUST be directly and specifically about "${nodeTitle}". 
- Do NOT generate generic or off-topic questions.
- Do NOT generate questions about unrelated subjects.
- Each question must test real knowledge of "${nodeTitle}".
- Respond with ONLY valid JSON, no markdown, no code blocks.
- Escape all special characters in strings.
- Keep the response concise to avoid truncation.`;
  
    const prompt = `Generate exactly ${count} ${difficulty} quiz questions specifically about "${nodeTitle}"${topic !== nodeTitle ? ` (within the field of ${topic})` : ''}.

${difficultyInstructions[difficulty]}
${formatInstructions[format]}

Return JSON in this exact format:
{"node_title":"${nodeTitle}","quiz":{"questions":[{"question":"A specific question about ${nodeTitle}","options":[{"id":"A","text":"Option A","correct":false},{"id":"B","text":"Option B","correct":true},{"id":"C","text":"Option C","correct":false},{"id":"D","text":"Option D","correct":false}],"explanation":"Why B is correct"}]}}

CRITICAL: ALL ${count} questions must be specifically about "${nodeTitle}". Do not include filler or generic questions.`;

    // Higher token limit for more questions
    const maxTokens = Math.min(count * 600 + 500, 8192);

    try {
      console.log(`❓ [QUIZ] Batch ${batch + 1}: generating ${count} questions (maxTokens: ${maxTokens})...`);
      const responseText = await callGroqWithFallback(groqClients.quiz, prompt, quizSystemPrompt, maxTokens);
      let jsonText = responseText.trim();
      
      // Strip markdown fences
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      // Replace real newlines/tabs
      jsonText = jsonText.replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ');
      
      // Remove control characters
      jsonText = jsonText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      
      // Fix truncated JSON
      const openBraces = (jsonText.match(/{/g) || []).length;
      const closeBraces = (jsonText.match(/}/g) || []).length;
      const openBrackets = (jsonText.match(/\[/g) || []).length;
      const closeBrackets = (jsonText.match(/\]/g) || []).length;
      
      jsonText = jsonText.replace(/,\s*$/, '');
      
      // Close truncated strings
      const lastChar = jsonText.trimEnd().slice(-1);
      if (lastChar !== '}' && lastChar !== ']' && lastChar !== '"' && lastChar !== 'l' && lastChar !== 'e') {
        jsonText += '"';
      }
      
      for (let i = 0; i < openBrackets - closeBrackets; i++) jsonText += ']';
      for (let i = 0; i < openBraces - closeBraces; i++) jsonText += '}';
      jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');
      
      const result = JSON.parse(jsonText);
      const questions = result.quiz?.questions || result.questions || [];
      
      // Filter out any incomplete questions (from truncation)
      const validQuestions = questions.filter((q: any) => 
        q.question && 
        q.options && 
        q.options.length >= 2 &&
        q.explanation
      );
      
      allQuestions.push(...validQuestions);
      console.log(`✅ [QUIZ] Batch ${batch + 1}: got ${validQuestions.length} valid questions (total: ${allQuestions.length}/${numQuestions})`);
      
    } catch (error: any) {
      console.error(`❌ [QUIZ] Batch ${batch + 1} error:`, error.message);
      // If first batch fails, throw. If subsequent, we have some questions already.
      if (allQuestions.length === 0) throw error;
      break;
    }
  }

  // If we still have fewer than requested, log but don't fail
  if (allQuestions.length < numQuestions) {
    console.warn(`⚠️ [QUIZ] Generated ${allQuestions.length}/${numQuestions} questions. Returning what we have.`);
  }

  // Trim to requested count
  const finalQuestions = allQuestions.slice(0, numQuestions);
  
  console.log(`✅ [QUIZ] Final: ${finalQuestions.length} questions for "${nodeTitle}"`);
  return {
    node_title: nodeTitle,
    quiz: { questions: finalQuestions }
  };
};

// Generate assessment using Key 4
export const generateAssessment = async (topic: string, skillLevel: string = 'beginner'): Promise<any> => {
  const prompt = `Generate a skill assessment survey for "${topic}" to understand the learner's background.

Create 3 survey questions to personalize the learning experience. These are NOT quiz questions - there are no right or wrong answers.

Respond with ONLY valid JSON:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "What is your familiarity with ${topic}?",
      "options": [
        "Complete beginner - I've never studied this before",
        "Some knowledge - I know the basics",
        "Intermediate - I have practical experience",
        "Advanced - I'm proficient and can teach others"
      ],
      "category": "familiarity"
    },
    {
      "id": 2,
      "question": "What is your primary learning goal for ${topic}?",
      "options": [
        "Build a strong foundation from scratch",
        "Fill knowledge gaps and strengthen understanding",
        "Master advanced concepts and techniques",
        "Prepare for certification or professional use"
      ],
      "category": "goals"
    },
    {
      "id": 3,
      "question": "How much time can you dedicate to learning ${topic}?",
      "options": [
        "15-30 minutes per day",
        "30-60 minutes per day",
        "1-2 hours per day",
        "2+ hours per day"
      ],
      "category": "time"
    }
  ]
}

IMPORTANT: These are survey questions to understand the learner, NOT quiz questions. Do not include "correct" answers.`;

  try {
    console.log(`📋 [ASSESSMENT] Generating survey for: "${topic}"`);
    const responseText = await callGroqWithFallback(groqClients.assessment, prompt, assessmentSystemPrompt, 2048);
    let jsonText = responseText.trim();
    
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const result = JSON.parse(jsonText);
    console.log(`✅ [ASSESSMENT] Generated ${result.questions?.length || 0} survey questions`);
    return result;
  } catch (error) {
    console.error('❌ [ASSESSMENT] Error generating assessment with Groq:', error);
    
    // Fallback to default survey questions
    return {
      topic,
      questions: [
        {
          id: 1,
          question: `What is your familiarity with ${topic}?`,
          options: [
            "Complete beginner - I've never studied this before",
            "Some knowledge - I know the basics",
            "Intermediate - I have practical experience",
            "Advanced - I'm proficient and can teach others"
          ],
          category: "familiarity"
        },
        {
          id: 2,
          question: `What is your primary learning goal for ${topic}?`,
          options: [
            "Build a strong foundation from scratch",
            "Fill knowledge gaps and strengthen understanding",
            "Master advanced concepts and techniques",
            "Prepare for certification or professional use"
          ],
          category: "goals"
        },
        {
          id: 3,
          question: `How much time can you dedicate to learning ${topic}?`,
          options: [
            "15-30 minutes per day",
            "30-60 minutes per day",
            "1-2 hours per day",
            "2+ hours per day"
          ],
          category: "time"
        }
      ]
    };
  }
};

// Generate custom career path using Key 1 (or fallback)
export const generateCustomCareerPath = async (goal: string): Promise<any> => {
  console.log(`🗺️ [CAREER PATH] Generating custom career path for goal: "${goal}"`);
  
  const systemPrompt = `You are an expert career path designer. Create a personalized learning path curriculum based on the user's goal.
  
Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "id": "custom-path",
  "title": "Career Path Title",
  "description": "Brief description (1-2 sentences)",
  "reason": "Why this path will help achieve their goal",
  "difficulty": "beginner",
  "estimatedMonths": 4,
  "trees": [
    {
      "topic": "First Skill Tree Topic",
      "order": 1,
      "description": "What they'll learn",
      "estimatedHours": 20,
      "isOptional": false
    },
    {
      "topic": "Second Skill Tree Topic",
      "order": 2,
      "description": "What they'll learn",
      "estimatedHours": 30,
      "isOptional": false
    }
  ],
  "matchScore": 95,
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "outcomes": ["Outcome 1", "Outcome 2"]
}`;

  const prompt = `User's goal: ${goal}
Create a highly structured, professional, and personalized career path with 3-5 distinct skill trees that will guide them from beginning to mastery for this goal.
Ensure the "trees" array has topics that can individually be generated as separate skill trees. Provide realistic estimatedMonths, estimatedHours, skills, and outcomes.`;

  try {
    const responseText = await callGroqWithFallback(groqClients.skillTree, prompt, systemPrompt, 4000);
    let jsonText = responseText.trim();
    
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    // Sanitize
    jsonText = jsonText.replace(/[\x00-\x1F\x7F]/g, (ch) => {
      if (ch === '\n' || ch === '\r' || ch === '\t') return ' ';
      return '';
    });
    
    const result = JSON.parse(jsonText);
    result.id = `custom-path-${Date.now()}`;
    result.icon = 'Brain';
    
    console.log(`✅ [CAREER PATH] Successfully generated path: ${result.title} with ${result.trees?.length || 0} trees`);
    return result;
  } catch (error: any) {
    console.error(`❌ [CAREER PATH] Error generating custom career path for "${goal}":`, error.message);
    throw error;
  }
};

// Check if Groq is configured
export const isGroqConfigured = (): boolean => {
  return !!(API_KEYS.SKILL_TREE || API_KEYS.LESSON || API_KEYS.QUIZ || API_KEYS.ASSESSMENT);
};

// Get configuration status
export const getGroqStatus = () => {
  return {
    skillTree: !!API_KEYS.SKILL_TREE,
    lesson: !!API_KEYS.LESSON,
    quiz: !!API_KEYS.QUIZ,
    assessment: !!API_KEYS.ASSESSMENT,
  };
};
