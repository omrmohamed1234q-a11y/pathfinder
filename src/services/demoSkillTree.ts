import type { SkillTree } from '@/types/skilltree';

export const createDemoSkillTree = (topic: string): SkillTree => {
  const normalizedTopic = topic.toLowerCase();
  
  // Check if it's a programming topic
  const isProgramming = normalizedTopic.includes('python') || 
                        normalizedTopic.includes('javascript') || 
                        normalizedTopic.includes('programming') ||
                        normalizedTopic.includes('coding') ||
                        normalizedTopic.includes('web dev');
  
  if (isProgramming) {
    return {
      topic: topic,
      description: `Master ${topic} from fundamentals to advanced concepts`,
      total_xp: 2950,
      nodes: [
        {
          id: 1, title: 'Syntax & Setup', description: 'Install tools and learn basic syntax rules',
          level: 1, xp: 100, children: [2, 3], status: 'unlocked', prerequisites: [],
          illustration: 'Digital art, fantasy RPG style, glowing terminal with code runes, dark background',
        },
        {
          id: 2, title: 'Variables & Types', description: 'Understand data types, variables, and operators',
          level: 2, xp: 150, children: [4, 5], status: 'locked', prerequisites: [1],
          illustration: 'Digital art, fantasy RPG style, glowing crystal containers holding different colored essences, dark background',
        },
        {
          id: 3, title: 'Loops & Conditionals', description: 'Master if/else, for, while loops',
          level: 2, xp: 150, children: [5, 6], status: 'locked', prerequisites: [1],
          illustration: 'Digital art, fantasy RPG style, forking magical pathways with glowing signs, dark background',
        },
        {
          id: 4, title: 'Functions & Scope', description: 'Write reusable code blocks and understand scope',
          level: 3, xp: 200, children: [7, 8], status: 'locked', prerequisites: [2],
          illustration: 'Digital art, fantasy RPG style, magical scroll unrolling with glowing runes, dark background',
        },
        {
          id: 5, title: 'Lists & Dictionaries', description: 'Arrays, hash maps, sets, and tuples',
          level: 3, xp: 200, children: [8, 9], status: 'locked', prerequisites: [2, 3],
          illustration: 'Digital art, fantasy RPG style, interconnected glowing nodes forming a tree structure, dark background',
        },
        {
          id: 6, title: 'String Operations', description: 'String methods, formatting, and regex basics',
          level: 3, xp: 200, children: [9], status: 'locked', prerequisites: [3],
          illustration: 'Digital art, fantasy RPG style, glowing text weaving through the air like ribbons, dark background',
        },
        {
          id: 7, title: 'Classes & Objects', description: 'OOP: classes, inheritance, polymorphism',
          level: 4, xp: 250, children: [10, 11], status: 'locked', prerequisites: [4],
          illustration: 'Digital art, fantasy RPG style, magical blueprints forming 3D structures, dark background',
        },
        {
          id: 8, title: 'File I/O & APIs', description: 'Read/write files and consume REST APIs',
          level: 4, xp: 250, children: [11, 12], status: 'locked', prerequisites: [4, 5],
          illustration: 'Digital art, fantasy RPG style, glowing portals connecting different realms, dark background',
        },
        {
          id: 9, title: 'Error Handling', description: 'Try/except, custom exceptions, debugging',
          level: 4, xp: 250, children: [12], status: 'locked', prerequisites: [5, 6],
          illustration: 'Digital art, fantasy RPG style, shield deflecting red lightning bolts, dark background',
        },
        {
          id: 10, title: 'Design Patterns', description: 'Singleton, factory, observer patterns',
          level: 5, xp: 300, children: [14], status: 'locked', prerequisites: [7],
          illustration: 'Digital art, fantasy RPG style, complex mandala pattern made of glowing code, dark background',
        },
        {
          id: 11, title: 'Unit Testing', description: 'Write tests, TDD, coverage analysis',
          level: 5, xp: 300, children: [14], status: 'locked', prerequisites: [7, 8],
          illustration: 'Digital art, fantasy RPG style, magical laboratory with glowing test tubes, dark background',
        },
        {
          id: 12, title: 'Async & Concurrency', description: 'Async/await, threads, parallel processing',
          level: 5, xp: 300, children: [14], status: 'locked', prerequisites: [8, 9],
          illustration: 'Digital art, fantasy RPG style, multiple glowing timelines running in parallel, dark background',
        },
        {
          id: 14, title: 'Full Stack App', description: 'Build a complete application from scratch',
          level: 6, xp: 500, children: [], status: 'locked', prerequisites: [10, 11, 12],
          illustration: 'Digital art, fantasy RPG style, epic castle made of glowing code and circuits, vibrant gold and rainbow colors, dark background',
        },
      ],
    };
  }
  
  // For non-programming topics, generate topic-aware names
  // This uses the topic to create meaningful subtopic names
  const topicWords = topic.split(' ').filter(w => w.length > 2);
  const mainWord = topicWords[0] || topic;
  
  return {
    topic: topic,
    description: `A comprehensive learning path for ${topic}`,
    total_xp: 2950,
    nodes: [
      {
        id: 1, title: `${mainWord} Basics`, description: `Core principles and vocabulary of ${topic}`,
        level: 1, xp: 100, children: [2, 3], status: 'unlocked', prerequisites: [],
        illustration: 'Digital art, fantasy RPG style, glowing book opening with magical symbols, vibrant colors, dark background',
      },
      {
        id: 2, title: `Key Terminology`, description: `Learn the essential language of ${topic}`,
        level: 2, xp: 150, children: [4, 5], status: 'locked', prerequisites: [1],
        illustration: 'Digital art, fantasy RPG style, floating dictionary pages with glowing words, dark background',
      },
      {
        id: 3, title: `Core Techniques`, description: `Fundamental methods used in ${topic}`,
        level: 2, xp: 150, children: [5, 6], status: 'locked', prerequisites: [1],
        illustration: 'Digital art, fantasy RPG style, hands wielding glowing tools, dark background',
      },
      {
        id: 4, title: `Hands-On Practice`, description: `Apply what you learned through exercises`,
        level: 3, xp: 200, children: [7, 8], status: 'locked', prerequisites: [2],
        illustration: 'Digital art, fantasy RPG style, forge with glowing anvil, dark background',
      },
      {
        id: 5, title: `Theory Deep Dive`, description: `Understand the why behind ${topic}`,
        level: 3, xp: 200, children: [8, 9], status: 'locked', prerequisites: [2, 3],
        illustration: 'Digital art, fantasy RPG style, celestial map with constellations, dark background',
      },
      {
        id: 6, title: `Common Pitfalls`, description: `Mistakes to avoid and how to fix them`,
        level: 3, xp: 200, children: [9], status: 'locked', prerequisites: [3],
        illustration: 'Digital art, fantasy RPG style, warning signs glowing along a forest path, dark background',
      },
      {
        id: 7, title: `${mainWord} Workflows`, description: `Professional workflows and processes`,
        level: 4, xp: 250, children: [10, 11], status: 'locked', prerequisites: [4],
        illustration: 'Digital art, fantasy RPG style, assembly line of glowing artifacts, dark background',
      },
      {
        id: 8, title: `Real-World Cases`, description: `Study actual examples and case studies`,
        level: 4, xp: 250, children: [11, 12], status: 'locked', prerequisites: [4, 5],
        illustration: 'Digital art, fantasy RPG style, city blueprint with glowing buildings, dark background',
      },
      {
        id: 9, title: `Troubleshooting`, description: `Diagnose and solve complex problems`,
        level: 4, xp: 250, children: [12], status: 'locked', prerequisites: [5, 6],
        illustration: 'Digital art, fantasy RPG style, labyrinth with glowing solution path, dark background',
      },
      {
        id: 10, title: `Expert Methods`, description: `Professional-level strategies and techniques`,
        level: 5, xp: 300, children: [14], status: 'locked', prerequisites: [7],
        illustration: 'Digital art, fantasy RPG style, war room with holographic planning table, dark background',
      },
      {
        id: 11, title: `Creative Applications`, description: `Innovative and creative uses of ${topic}`,
        level: 5, xp: 300, children: [14], status: 'locked', prerequisites: [7, 8],
        illustration: 'Digital art, fantasy RPG style, artist painting with light brushes, dark background',
      },
      {
        id: 12, title: `Critical Analysis`, description: `Evaluate, compare, and optimize your work`,
        level: 5, xp: 300, children: [14], status: 'locked', prerequisites: [8, 9],
        illustration: 'Digital art, fantasy RPG style, magnifying glass revealing hidden patterns, dark background',
      },
      {
        id: 14, title: `${mainWord} Portfolio`, description: `Build a complete portfolio project in ${topic}`,
        level: 6, xp: 500, children: [], status: 'locked', prerequisites: [10, 11, 12],
        illustration: 'Digital art, fantasy RPG style, glowing crown on a pedestal with rays of light, vibrant gold colors, dark background',
      },
    ],
  };
};
