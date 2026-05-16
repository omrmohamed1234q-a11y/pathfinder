import type { SkillTree, SkillNode } from '@/types/skilltree';

/**
 * Demo Skill Tree showcasing all Phase 2 content types
 * This demonstrates: Video, Interactive, Flashcards, Projects, and Challenges
 */
export const demoSkillTree: SkillTree = {
  topic: 'Web Development Fundamentals',
  nodes: [
    // Node 1: Traditional Lesson (Root)
    {
      id: 1,
      title: 'What is Web Development?',
      level: 1,
      status: 'unlocked',
      xp: 100,
      children: [2, 3],
      illustration: '🌐',
      difficulty: 'beginner',
      contentType: 'lesson',
    },

    // Node 2: Video Lesson
    {
      id: 2,
      title: 'HTML Basics',
      level: 2,
      status: 'locked',
      xp: 150,
      children: [4],
      illustration: '📝',
      difficulty: 'beginner',
      contentType: 'video',
      content: {
        type: 'video',
        platform: 'youtube',
        videoId: 'UB1O30fR-EE',
        videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
        duration: 3600,
        summary: 'Learn the fundamentals of HTML including tags, elements, attributes, and document structure. This comprehensive tutorial covers everything you need to know to start building web pages.',
        transcript: 'HTML stands for HyperText Markup Language. It is the standard markup language for creating web pages...'
      }
    },

    // Node 3: Flashcards
    {
      id: 3,
      title: 'CSS Selectors',
      level: 2,
      status: 'locked',
      xp: 150,
      children: [5],
      illustration: '🎨',
      difficulty: 'beginner',
      contentType: 'flashcard',
      content: {
        type: 'flashcard',
        cards: [
          {
            front: 'What does the . selector target in CSS?',
            back: 'Classes - it selects all elements with a specific class attribute',
            hint: 'Think about class names'
          },
          {
            front: 'What does the # selector target in CSS?',
            back: 'IDs - it selects a single element with a specific id attribute',
            hint: 'Think about unique identifiers'
          },
          {
            front: 'What does the * selector do?',
            back: 'Universal selector - it selects all elements on the page',
            hint: 'Think about selecting everything'
          },
          {
            front: 'How do you select all <p> elements inside a <div>?',
            back: 'div p { } - descendant selector',
            hint: 'Think about parent-child relationships'
          },
          {
            front: 'What is the :hover pseudo-class used for?',
            back: 'To apply styles when the user hovers over an element',
            hint: 'Think about mouse interactions'
          }
        ]
      }
    },

    // Node 4: Interactive Demo
    {
      id: 4,
      title: 'Build Your First Page',
      level: 3,
      status: 'locked',
      xp: 200,
      children: [6],
      illustration: '💻',
      difficulty: 'intermediate',
      contentType: 'interactive',
      content: {
        type: 'interactive',
        platform: 'codesandbox',
        embedUrl: 'https://codesandbox.io/embed/vanilla-html-css-starter-forked-3qkxvw?fontsize=14&hidenavigation=1&theme=dark',
        instructions: 'Create a simple webpage with:\n1. A heading (h1)\n2. A paragraph (p)\n3. An image (img)\n4. A link (a)\n\nExperiment with different HTML tags and see how they render!',
        solution: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Welcome to My Website</h1>\n  <p>This is my first webpage!</p>\n  <img src="https://via.placeholder.com/300" alt="Placeholder">\n  <a href="https://example.com">Visit Example</a>\n</body>\n</html>'
      }
    },

    // Node 5: Project
    {
      id: 5,
      title: 'Style a Card Component',
      level: 3,
      status: 'locked',
      xp: 200,
      children: [7],
      illustration: '🎴',
      difficulty: 'intermediate',
      contentType: 'project',
      content: {
        type: 'project',
        description: 'Create a beautiful card component using HTML and CSS. This is a fundamental UI pattern used in modern web design.',
        requirements: [
          'Create a card with a border and shadow',
          'Add a header section with a title',
          'Include an image at the top',
          'Add body text with padding',
          'Create a footer with a button',
          'Make it responsive (works on mobile)',
          'Add hover effects'
        ],
        hints: [
          'Use border-radius for rounded corners',
          'box-shadow creates depth',
          'Use flexbox for layout',
          'Media queries handle responsiveness',
          'transition property creates smooth hover effects'
        ],
        starterCode: '.card {\n  /* Add your styles here */\n}\n\n.card:hover {\n  /* Add hover effects */\n}',
        solution: '.card {\n  max-width: 300px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n  overflow: hidden;\n  transition: transform 0.3s;\n}\n\n.card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 4px 16px rgba(0,0,0,0.2);\n}\n\n.card-header {\n  padding: 16px;\n  background: #f5f5f5;\n  font-weight: bold;\n}\n\n.card-image {\n  width: 100%;\n  height: 200px;\n  object-fit: cover;\n}\n\n.card-body {\n  padding: 16px;\n}\n\n.card-footer {\n  padding: 16px;\n  border-top: 1px solid #ddd;\n}\n\n.card-button {\n  background: #007bff;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\n@media (max-width: 768px) {\n  .card {\n    max-width: 100%;\n  }\n}',
        estimatedTime: 45
      }
    },

    // Node 6: Challenge
    {
      id: 6,
      title: 'Flexbox Challenge',
      level: 4,
      status: 'locked',
      xp: 300,
      children: [7],
      illustration: '⚡',
      difficulty: 'advanced',
      contentType: 'challenge',
      content: {
        type: 'challenge',
        description: 'Create a responsive navigation bar using Flexbox. You have 10 minutes to complete this challenge!',
        timeLimit: 600,
        difficulty: 'medium',
        testCases: [
          {
            input: 'Desktop view (>768px)',
            expectedOutput: 'Horizontal layout with space-between'
          },
          {
            input: 'Mobile view (<768px)',
            expectedOutput: 'Vertical layout with centered items'
          },
          {
            input: 'Logo alignment',
            expectedOutput: 'Logo on the left, menu on the right'
          }
        ],
        hints: [
          'Use display: flex on the container',
          'justify-content: space-between spreads items apart',
          'Use media queries for responsive design',
          'flex-direction: column for mobile',
          'align-items: center for vertical centering'
        ]
      }
    },

    // Node 7: Final Project
    {
      id: 7,
      title: 'Build a Portfolio Page',
      level: 4,
      status: 'locked',
      xp: 300,
      children: [8],
      illustration: '🚀',
      difficulty: 'advanced',
      contentType: 'project',
      content: {
        type: 'project',
        description: 'Create a complete portfolio webpage showcasing your skills. This is your capstone project!',
        requirements: [
          'Hero section with your name and title',
          'About section with bio',
          'Skills section with icons',
          'Projects section with cards',
          'Contact section with form',
          'Responsive design (mobile-first)',
          'Smooth scrolling navigation',
          'Professional color scheme'
        ],
        hints: [
          'Start with mobile design first',
          'Use CSS Grid for the projects section',
          'Flexbox works great for the navigation',
          'Use CSS variables for colors',
          'Add transitions for smooth interactions',
          'Test on different screen sizes'
        ],
        starterCode: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Portfolio</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <!-- Add your HTML here -->\n</body>\n</html>',
        estimatedTime: 120
      }
    },

    // Node 8: BONUS - Advanced CSS Animations
    {
      id: 8,
      title: 'Advanced CSS Animations',
      level: 5,
      status: 'locked',
      xp: 500,
      children: [],
      illustration: '✨',
      difficulty: 'expert',
      contentType: 'challenge',
      isBonusNode: true,
      isOptional: true,
      content: {
        type: 'challenge',
        description: 'Master advanced CSS animations! Create complex keyframe animations, transitions, and transforms. This bonus challenge is for those who want to go beyond the basics.',
        timeLimit: 900,
        difficulty: 'hard',
        testCases: [
          {
            input: 'Create a loading spinner',
            expectedOutput: 'Smooth rotation animation'
          },
          {
            input: 'Implement a card flip effect',
            expectedOutput: '3D transform with backface-visibility'
          },
          {
            input: 'Build a parallax scroll effect',
            expectedOutput: 'Multiple layers moving at different speeds'
          }
        ],
        hints: [
          'Use @keyframes for complex animations',
          'transform: rotateY() for 3D effects',
          'animation-timing-function controls easing',
          'will-change optimizes performance',
          'Combine multiple transforms for complex effects'
        ]
      }
    }
  ],
  userSkillLevel: 'beginner',
  assessmentCompleted: false
};

/**
 * Get a demo node by ID
 */
export const getDemoNode = (id: number): SkillNode | undefined => {
  return demoSkillTree.nodes.find(node => node.id === id);
};

/**
 * Check if a topic should use demo data
 */
export const isDemoTopic = (topic: string): boolean => {
  const normalizedTopic = topic.toLowerCase().trim();
  return normalizedTopic === 'web development fundamentals' || 
         normalizedTopic === 'demo' ||
         normalizedTopic === 'test';
};
