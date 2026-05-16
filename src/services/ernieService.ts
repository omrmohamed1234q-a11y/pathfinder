import type { SkillTree, SkillNode } from '@/types/skilltree';

const ERNIE_API_URL = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';

interface ErnieResponse {
  result: string;
  is_truncated: boolean;
  need_clear_history: boolean;
}

const getAccessToken = async (apiKey: string): Promise<string> => {
  // For ERNIE, the API key IS the access token in most cases
  // If you need to get a token from API Key + Secret Key, implement that here
  return apiKey;
};

const callErnie = async (prompt: string): Promise<string> => {
  const apiKey = localStorage.getItem('ERNIE_API_KEY') || import.meta.env.VITE_ERNIE_API_KEY;
  
  if (!apiKey) {
    throw new Error('ERNIE API key is not configured. Please add VITE_ERNIE_API_KEY to your .env file.');
  }

  try {
    const accessToken = await getAccessToken(apiKey);
    
    const response = await fetch(`${ERNIE_API_URL}?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`ERNIE API error: ${response.statusText}`);
    }

    const data: ErnieResponse = await response.json();
    return data.result;
  } catch (error) {
    console.error('ERNIE API call failed:', error);
    throw error;
  }
};

const SYSTEM_PROMPT = `You are Pathfinder AI — an expert curriculum designer and educator. Create a skill tree for learning any topic.

When given a topic, respond with ONLY valid JSON (no markdown, no explanation):

{
  "topic": "[topic name]",
  "description": "One-sentence description of this learning path",
  "total_xp": [sum of all node XP],
  "nodes": [
    {
      "id": 1,
      "title": "Node Title (max 4 words)",
      "level": 1,
      "xp": 100,
      "children": [2, 3],
      "illustration_prompt": "Digital art, fantasy RPG style, vibrant colors, glowing effects, dark background — [vivid scene description]",
      "lesson_preview": "One sentence about what this node teaches"
    }
  ]
}

Rules:
- Generate exactly 6-7 nodes
- Arrange in logical progression: fundamentals (level 1) → intermediate (level 2-3) → advanced (level 4)
- XP scales with difficulty: level 1 = 100, level 2 = 150, level 3 = 200, level 4 = 300
- Each illustration_prompt must be unique and vivid
- Node titles must be concise (max 4 words)
- Single root node (id: 1) with branching paths
- Children arrays define which nodes unlock after completing this node`;

export const generateSkillTree = async (topic: string): Promise<SkillTree> => {
  const prompt = `${SYSTEM_PROMPT}

Topic: ${topic}

Generate the skill tree JSON:`;

  try {
    const responseText = await callErnie(prompt);
    
    // Parse JSON response
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
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
    
    return skillTree;
  } catch (error) {
    console.error('Error generating skill tree with ERNIE:', error);
    throw new Error('Failed to generate skill tree. Please check your ERNIE API key configuration.');
  }
};

export const generateLesson = async (nodeTitle: string, topic: string): Promise<any> => {
  const prompt = `Generate a lesson for "${nodeTitle}" in the context of learning "${topic}".

Respond with ONLY valid JSON:
{
  "node_title": "${nodeTitle}",
  "lesson": {
    "introduction": "Engaging opening paragraph (2-3 sentences)",
    "core_content": "Main educational content (2-3 paragraphs)",
    "code_example": "Code example or null if not applicable",
    "key_takeaway": "One bold, memorable sentence",
    "fun_fact": "An interesting fact"
  }
}`;

  try {
    const responseText = await callErnie(prompt);
    let jsonText = responseText.trim();
    
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating lesson with ERNIE:', error);
    throw error;
  }
};

export const generateQuiz = async (nodeTitle: string, topic: string): Promise<any> => {
  const prompt = `Generate a quiz for "${nodeTitle}" in the context of learning "${topic}".

Respond with ONLY valid JSON:
{
  "node_title": "${nodeTitle}",
  "quiz": {
    "question": "A clear question testing understanding",
    "options": [
      {"id": "A", "text": "Option text", "correct": false},
      {"id": "B", "text": "Option text", "correct": true},
      {"id": "C", "text": "Option text", "correct": false},
      {"id": "D", "text": "Option text", "correct": false}
    ],
    "explanation": "Brief explanation of the correct answer"
  }
}`;

  try {
    const responseText = await callErnie(prompt);
    let jsonText = responseText.trim();
    
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating quiz with ERNIE:', error);
    throw error;
  }
};
