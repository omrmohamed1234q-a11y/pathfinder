// Career Path Types
export interface CareerPathTree {
  topic: string;
  estimatedHours: number;
  order: number;
  isOptional?: boolean;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMonths: number;
  trees: CareerPathTree[];
  skills: string[];
  outcomes: string[];
}

// Predefined Career Paths
export const careerPaths: CareerPath[] = [
  {
    id: 'full-stack-developer',
    title: 'Full-Stack Developer',
    description: 'Master both frontend and backend development to build complete web applications',
    icon: 'Laptop',
    difficulty: 'intermediate',
    estimatedMonths: 6,
    trees: [
      { topic: 'HTML Fundamentals', estimatedHours: 20, order: 1 },
      { topic: 'CSS Fundamentals', estimatedHours: 30, order: 2 },
      { topic: 'JavaScript Basics', estimatedHours: 40, order: 3 },
      { topic: 'React', estimatedHours: 50, order: 4 },
      { topic: 'Node.js', estimatedHours: 40, order: 5 },
      { topic: 'Express.js', estimatedHours: 30, order: 6 },
      { topic: 'MongoDB', estimatedHours: 25, order: 7 },
      { topic: 'REST APIs', estimatedHours: 30, order: 8 },
      { topic: 'Authentication & Security', estimatedHours: 25, order: 9 },
      { topic: 'Deployment & DevOps', estimatedHours: 20, order: 10, isOptional: true },
    ],
    skills: [
      'Frontend Development',
      'Backend Development',
      'Database Design',
      'API Development',
      'Authentication',
      'Deployment'
    ],
    outcomes: [
      'Build complete web applications',
      'Create RESTful APIs',
      'Manage databases',
      'Deploy to production',
      'Work as a full-stack developer'
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Learn to analyze data, build machine learning models, and extract insights',
    icon: 'Database',
    difficulty: 'advanced',
    estimatedMonths: 8,
    trees: [
      { topic: 'Python Basics', estimatedHours: 40, order: 1 },
      { topic: 'NumPy & Pandas', estimatedHours: 35, order: 2 },
      { topic: 'Data Visualization', estimatedHours: 25, order: 3 },
      { topic: 'Statistics', estimatedHours: 40, order: 4 },
      { topic: 'Machine Learning', estimatedHours: 60, order: 5 },
      { topic: 'Deep Learning', estimatedHours: 50, order: 6 },
      { topic: 'Natural Language Processing', estimatedHours: 40, order: 7, isOptional: true },
      { topic: 'Computer Vision', estimatedHours: 40, order: 8, isOptional: true },
      { topic: 'SQL & Databases', estimatedHours: 30, order: 9 },
      { topic: 'Big Data Tools', estimatedHours: 35, order: 10, isOptional: true },
    ],
    skills: [
      'Python Programming',
      'Data Analysis',
      'Machine Learning',
      'Statistical Analysis',
      'Data Visualization',
      'Model Deployment'
    ],
    outcomes: [
      'Analyze complex datasets',
      'Build ML models',
      'Create data visualizations',
      'Make data-driven decisions',
      'Work as a data scientist'
    ]
  },
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    description: 'Create beautiful, responsive user interfaces and web experiences',
    icon: 'Paintbrush',
    difficulty: 'beginner',
    estimatedMonths: 4,
    trees: [
      { topic: 'HTML Fundamentals', estimatedHours: 20, order: 1 },
      { topic: 'CSS Fundamentals', estimatedHours: 30, order: 2 },
      { topic: 'CSS Flexbox & Grid', estimatedHours: 20, order: 3 },
      { topic: 'JavaScript Basics', estimatedHours: 40, order: 4 },
      { topic: 'DOM Manipulation', estimatedHours: 25, order: 5 },
      { topic: 'React', estimatedHours: 50, order: 6 },
      { topic: 'TypeScript', estimatedHours: 30, order: 7 },
      { topic: 'Tailwind CSS', estimatedHours: 15, order: 8, isOptional: true },
      { topic: 'Web Performance', estimatedHours: 20, order: 9 },
      { topic: 'Accessibility', estimatedHours: 15, order: 10 },
    ],
    skills: [
      'HTML & CSS',
      'JavaScript',
      'React',
      'Responsive Design',
      'Web Performance',
      'Accessibility'
    ],
    outcomes: [
      'Build responsive websites',
      'Create interactive UIs',
      'Optimize performance',
      'Ensure accessibility',
      'Work as a frontend developer'
    ]
  },
  {
    id: 'mobile-developer',
    title: 'Mobile App Developer',
    description: 'Build native and cross-platform mobile applications',
    icon: 'Smartphone',
    difficulty: 'intermediate',
    estimatedMonths: 5,
    trees: [
      { topic: 'JavaScript Basics', estimatedHours: 40, order: 1 },
      { topic: 'React', estimatedHours: 50, order: 2 },
      { topic: 'React Native', estimatedHours: 60, order: 3 },
      { topic: 'Mobile UI/UX', estimatedHours: 30, order: 4 },
      { topic: 'Native APIs', estimatedHours: 35, order: 5 },
      { topic: 'State Management', estimatedHours: 25, order: 6 },
      { topic: 'Mobile Databases', estimatedHours: 20, order: 7 },
      { topic: 'Push Notifications', estimatedHours: 15, order: 8 },
      { topic: 'App Store Deployment', estimatedHours: 20, order: 9 },
      { topic: 'Mobile Testing', estimatedHours: 25, order: 10, isOptional: true },
    ],
    skills: [
      'React Native',
      'Mobile UI Design',
      'Native APIs',
      'State Management',
      'App Deployment',
      'Mobile Testing'
    ],
    outcomes: [
      'Build iOS & Android apps',
      'Create native experiences',
      'Handle device features',
      'Deploy to app stores',
      'Work as a mobile developer'
    ]
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    description: 'Automate deployment, manage infrastructure, and ensure reliability',
    icon: 'Settings',
    difficulty: 'advanced',
    estimatedMonths: 6,
    trees: [
      { topic: 'Linux Fundamentals', estimatedHours: 40, order: 1 },
      { topic: 'Bash Scripting', estimatedHours: 25, order: 2 },
      { topic: 'Git & Version Control', estimatedHours: 20, order: 3 },
      { topic: 'Docker', estimatedHours: 35, order: 4 },
      { topic: 'Kubernetes', estimatedHours: 50, order: 5 },
      { topic: 'CI/CD Pipelines', estimatedHours: 40, order: 6 },
      { topic: 'Cloud Platforms (AWS)', estimatedHours: 60, order: 7 },
      { topic: 'Infrastructure as Code', estimatedHours: 35, order: 8 },
      { topic: 'Monitoring & Logging', estimatedHours: 30, order: 9 },
      { topic: 'Security Best Practices', estimatedHours: 25, order: 10 },
    ],
    skills: [
      'Linux Administration',
      'Containerization',
      'Orchestration',
      'CI/CD',
      'Cloud Infrastructure',
      'Monitoring'
    ],
    outcomes: [
      'Automate deployments',
      'Manage cloud infrastructure',
      'Ensure system reliability',
      'Implement CI/CD',
      'Work as a DevOps engineer'
    ]
  },
  {
    id: 'ai-engineer',
    title: 'AI/ML Engineer',
    description: 'Build and deploy artificial intelligence and machine learning systems',
    icon: 'Brain',
    difficulty: 'advanced',
    estimatedMonths: 9,
    trees: [
      { topic: 'Python Basics', estimatedHours: 40, order: 1 },
      { topic: 'Mathematics for ML', estimatedHours: 50, order: 2 },
      { topic: 'NumPy & Pandas', estimatedHours: 35, order: 3 },
      { topic: 'Machine Learning', estimatedHours: 60, order: 4 },
      { topic: 'Deep Learning', estimatedHours: 50, order: 5 },
      { topic: 'Neural Networks', estimatedHours: 45, order: 6 },
      { topic: 'Computer Vision', estimatedHours: 40, order: 7 },
      { topic: 'Natural Language Processing', estimatedHours: 40, order: 8 },
      { topic: 'MLOps', estimatedHours: 35, order: 9 },
      { topic: 'Model Deployment', estimatedHours: 30, order: 10 },
    ],
    skills: [
      'Machine Learning',
      'Deep Learning',
      'Neural Networks',
      'Computer Vision',
      'NLP',
      'Model Deployment'
    ],
    outcomes: [
      'Build ML models',
      'Train neural networks',
      'Deploy AI systems',
      'Solve complex problems',
      'Work as an AI engineer'
    ]
  }
];

// Helper functions
export const getCareerPath = (id: string): CareerPath | undefined => {
  return careerPaths.find(path => path.id === id);
};

export const getCareerPathProgress = (pathId: string, completedTopics: string[]): number => {
  const path = getCareerPath(pathId);
  if (!path) return 0;

  const requiredTrees = path.trees.filter(t => !t.isOptional);
  const completedRequired = requiredTrees.filter(t => 
    completedTopics.some(topic => 
      topic.toLowerCase() === t.topic.toLowerCase() ||
      topic.toLowerCase().includes(t.topic.toLowerCase()) ||
      t.topic.toLowerCase().includes(topic.toLowerCase())
    )
  ).length;

  return Math.round((completedRequired / requiredTrees.length) * 100);
};

export const getNextTreeInPath = (pathId: string, completedTopics: string[]): CareerPathTree | null => {
  const path = getCareerPath(pathId);
  if (!path) return null;

  // Find first incomplete tree
  for (const tree of path.trees) {
    const isCompleted = completedTopics.some(topic => 
      topic.toLowerCase() === tree.topic.toLowerCase() ||
      topic.toLowerCase().includes(tree.topic.toLowerCase()) ||
      tree.topic.toLowerCase().includes(topic.toLowerCase())
    );
    if (!isCompleted) {
      return tree;
    }
  }

  return null; // All trees completed
};
