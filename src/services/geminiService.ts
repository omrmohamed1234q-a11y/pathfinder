import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SkillTree, SkillNode } from '@/types/skilltree';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are Pathfinder AI — an expert curriculum designer. Create comprehensive, engaging learning paths. Always respond in valid JSON only — no markdown, no explanation outside the JSON.

**FUNCTION 1: SKILL TREE GENERATION**
When the user says "GENERATE_TREE: [topic]", create a skill tree JSON:
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

Rules:
- Generate 12-18 nodes across 5-6 levels
- Level 1: 1 root node, XP=100. Level 2: 2-3 nodes, XP=150. Level 3: 3-4 nodes, XP=200. Level 4: 3-4 nodes, XP=250. Level 5: 2-3 nodes, XP=300. Level 6: 1 capstone, XP=500.
- NEVER use generic names like "Introduction", "Getting Started", "Core Concepts", "Fundamentals", "Mastery"
- ALWAYS use domain-specific node titles with real terminology from the topic
- Each illustration_prompt must be unique and vivid
- NO orphan nodes — every node reachable from root
- The tree must have a single root node (id: 1) with branching paths
- Children arrays define which nodes unlock after completing this node

**FUNCTION 2: LESSON GENERATION**
When the user says "GENERATE_LESSON: [node title] | CONTEXT: [parent topic]", create:
{
  "node_title": "[title]",
  "lesson": {
    "introduction": "Engaging opening paragraph (2-3 sentences)",
    "core_content": "Main educational content (2-3 paragraphs). Use clear language and real-world analogies.",
    "code_example": "A practical code/example block if applicable. Set to null if not a coding topic.",
    "key_takeaway": "One bold, memorable sentence summarizing the most important concept",
    "fun_fact": "An interesting or surprising fact related to this topic"
  }
}

Rules:
- Total lesson length: 250-400 words
- Always use real-world analogies to explain abstract concepts

**FUNCTION 3: QUIZ GENERATION**
When the user says "GENERATE_QUIZ: [node title] | CONTEXT: [parent topic]", create:
{
  "node_title": "[title]",
  "quiz": {
    "question": "A clear, specific question testing understanding",
    "options": [
      {"id": "A", "text": "Option text", "correct": false},
      {"id": "B", "text": "Option text", "correct": true},
      {"id": "C", "text": "Option text", "correct": false},
      {"id": "D", "text": "Option text", "correct": false}
    ],
    "explanation": "Brief explanation of why the correct answer is right"
  }
}

Rules:
- Exactly 4 options, exactly 1 correct
- The question must test UNDERSTANDING, not memorization`;

// Initialize Gemini model (lazy-loaded)
let modelInstance: any = null;

const getModel = () => {
  if (modelInstance) {
    return modelInstance;
  }

  // Try localStorage first, then fall back to env variable
  const apiKey = localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('Gemini API key is not configured. Please add it in Settings.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    modelInstance = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    return modelInstance;
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
    throw new Error('Failed to initialize Gemini client');
  }
};

export interface GeneratedLesson {
  node_title: string;
  lesson: {
    introduction: string;
    core_content: string;
    code_example: string | null;
    key_takeaway: string;
    fun_fact: string;
  };
}

export interface GeneratedQuiz {
  node_title: string;
  quiz: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      correct: boolean;
    }>;
    explanation: string;
  };
}

export interface GeneratedTree {
  topic: string;
  description: string;
  total_xp: number;
  nodes: Array<{
    id: number;
    title: string;
    level: number;
    xp: number;
    children: number[];
    illustration_prompt: string;
    lesson_preview: string;
  }>;
}

// Generate skill tree from topic
export const generateSkillTree = async (topic: string): Promise<SkillTree> => {
  const model = getModel();

  const prompt = `${SYSTEM_PROMPT}

User request: GENERATE_TREE: ${topic}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();
  
  if (!content) {
    throw new Error('No response from Gemini API');
  }

  // Clean up markdown code blocks if present
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Parse JSON response
  const data: GeneratedTree = JSON.parse(cleanContent);

  // Convert to SkillTree format
  const skillTree: SkillTree = {
    topic: data.topic,
    description: data.description,
    total_xp: data.total_xp,
    nodes: data.nodes.map((node) => ({
      id: node.id,
      title: node.title,
      description: node.lesson_preview,
      level: node.level,
      status: node.id === 1 ? ('unlocked' as const) : ('locked' as const),
      xp: node.xp,
      children: node.children || [],
      prerequisites: [] as number[],
      illustration: node.illustration_prompt,
    })),
  };

  // Calculate prerequisites based on children
  skillTree.nodes.forEach((node) => {
    node.children.forEach((childId) => {
      const childNode = skillTree.nodes.find((n) => n.id === childId);
      if (childNode && childNode.prerequisites) {
        childNode.prerequisites.push(node.id);
      }
    });
  });

  return skillTree;
};

// Generate lesson content for a node
export const generateLesson = async (
  nodeTitle: string,
  topic: string
): Promise<GeneratedLesson> => {
  const model = getModel();

  const prompt = `${SYSTEM_PROMPT}

User request: GENERATE_LESSON: ${nodeTitle} | CONTEXT: ${topic}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();
  
  if (!content) {
    throw new Error('No response from Gemini API');
  }

  // Clean up markdown code blocks if present
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(cleanContent);
};

// Enhance an existing lesson with YouTube and external links using Gemini
export const addLinksToLesson = async (
  nodeTitle: string,
  topic: string,
  lesson: GeneratedLesson['lesson']
): Promise<GeneratedLesson['lesson']> => {
  const model = getModel();

  const prompt = `You are an expert curriculum curator.
I have a lesson about "${nodeTitle}" in the topic of "${topic}".
Here is the core content:
${lesson.core_content}

Your task is to embed 1-2 highly relevant YouTube search links and 1-2 authoritative reference links (like Wikipedia, MDN, or established documentation) directly into the bottom of the core content.
Format the links cleanly in markdown (e.g. [Watch: Understanding ${nodeTitle} on YouTube](https://www.youtube.com/results?search_query=...)).
Return the exact same JSON structure, but with the links appended to the \`core_content\` field.

Respond ONLY with valid JSON matching this structure:
{
  "introduction": "...",
  "core_content": "... \\n\\n**Helpful Resources:**\\n- [Link 1]...\\n- [Link 2]...",
  "code_example": "...",
  "key_takeaway": "...",
  "fun_fact": "..."
}`;

  const chat = model.startChat({
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    }
  });

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  let content = response.text();
  
  if (!content) return lesson;

  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    const parsed = JSON.parse(content);
    // Merge the new core_content while keeping everything else strictly intact to avoid data loss
    return {
      ...lesson,
      core_content: parsed.core_content || lesson.core_content
    };
  } catch (e) {
    return lesson;
  }
};

// Generate quiz for a node
export const generateQuiz = async (
  nodeTitle: string,
  topic: string,
  numQuestions: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  format: 'multiple_choice' | 'true_false' | 'mixed' = 'multiple_choice'
): Promise<GeneratedQuiz> => {
  const model = getModel();

  const difficultyInstructions = {
    easy: 'Questions should test recall and basic understanding. Make options clearly distinguishable.',
    medium: 'Questions should require applying knowledge. Include real-world scenarios. Wrong answers should be plausible common misconceptions.',
    hard: 'Questions MUST be expert-level. Test deep understanding, edge cases, and nuanced scenarios. ALL wrong options must be highly plausible — the kind of answers that a student who mostly understands would choose. Include "gotcha" questions that test subtle distinctions.',
  };
  
  const formatInstructions = {
    multiple_choice: 'All questions should have 4 options (A, B, C, D) with exactly one correct answer.',
    true_false: 'All questions should be True/False format with 2 options.',
    mixed: 'Mix of multiple choice (4 options) and true/false (2 options) questions.',
  };

  const systemInstruction = `You are an expert educational quiz generator. Create exactly ${numQuestions} challenging questions about "${nodeTitle}" in ${topic}. Respond ONLY with valid JSON.`;
  
  // Dynamically generate the JSON template to force the model to output multiple questions
  const templateObj = `{"question":"...","options":[{"id":"A","text":"...","correct":false},{"id":"B","text":"...","correct":true},{"id":"C","text":"...","correct":false},{"id":"D","text":"...","correct":false}],"explanation":"..."}`;
  const templateQuestions = Array.from({ length: Math.min(numQuestions, 3) }).map(() => templateObj).join(',');
  const arraySuffix = numQuestions > 3 ? `, ... (continue until exactly ${numQuestions} questions are generated)` : '';

  const prompt = `Generate EXACTLY ${numQuestions} ${difficulty} quiz questions for "${nodeTitle}" (${topic}). ${difficultyInstructions[difficulty]} ${formatInstructions[format]}
Return JSON in this EXACT structure (the "questions" array MUST contain exactly ${numQuestions} distinct question objects):
{"node_title":"${nodeTitle}","quiz":{"questions":[${templateQuestions}${arraySuffix}]}}`;

  const chat = model.startChat({
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
    systemInstruction: { parts: [{ text: systemInstruction }] },
  });

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  let content = response.text();
  
  if (!content) {
    throw new Error('No response from Gemini API');
  }

  // Clean up markdown code blocks if present
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(content);
};

// Generate an optimized image prompt for a node
export const generateImagePrompt = async (
  nodeTitle: string,
  nodeDescription?: string
): Promise<string> => {
  const model = getModel();

  const prompt = `You are an expert prompt engineer for AI image generators. 
Create a short, visually descriptive prompt for an educational illustration representing the concept of "${nodeTitle}".
${nodeDescription ? `Context: ${nodeDescription}` : ''}
The image should be a professional, minimalist, flat vector icon illustration. Soft colors, clean lines, no text.
Respond ONLY with the image prompt string, nothing else.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();
  
  if (!content) {
    throw new Error('No response from Gemini API');
  }

  return content.trim();
};

export const streamChat = async (
  systemPrompt: string,
  messages: { role: 'user' | 'assistant', content: string }[],
  onChunk: (text: string) => void
): Promise<string> => {
  const model = getModel();
  
  // Format history for Gemini (it uses 'user' and 'model' roles)
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const chat = model.startChat({
    history,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
    systemInstruction: { parts: [{ text: systemPrompt }] },
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessageStream(lastMessage.content);

  let fullResponse = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullResponse += chunkText;
    onChunk(fullResponse);
  }

  return fullResponse;
};

// Extract text from image using Gemini vision capabilities
export const extractTextFromImage = async (imageBase64: string): Promise<string> => {
  const apiKey = localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const result = await model.generateContent([
      'Extract all visible text from this image. Return only the extracted text, preserving the original structure and formatting as much as possible.',
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('No text extracted from image');
    }

    return text.trim();
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image. The image may not contain readable text or the API does not support vision capabilities.');
  }
};
