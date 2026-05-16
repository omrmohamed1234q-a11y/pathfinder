import {
  Code, Terminal, Laptop, Database, Server, Globe, Smartphone,
  Calculator, PieChart, TrendingUp, BarChart, Activity, Percent,
  Atom, Microscope, TestTube, Dna, Zap, Beaker,
  BookOpen, MessageCircle, Languages, Book, FileText, PenTool,
  Briefcase, Users, Target, TrendingDown, DollarSign, ShoppingCart,
  Palette, Music, Film, Camera, Image, Brush,
  Heart, Brain, Stethoscope, Pill, Activity as Heartbeat, Droplet,
  Wrench, Hammer, Settings, Cog, Package,
  Rocket, Star, Award, Trophy, Medal, Crown,
  Map, Compass, Navigation, MapPin, Route, Flag,
  Shield, Lock, Key, Eye, AlertTriangle, CheckCircle,
  Lightbulb, Sparkles, Flame, Sun, Moon, Cloud,
  type LucideIcon
} from 'lucide-react';

/**
 * Professional icon mapping system
 * Maps topics and keywords to relevant Lucide icons
 */

interface IconMapping {
  keywords: string[];
  icons: LucideIcon[];
  gradient: string; // Tailwind gradient classes
}

const iconMappings: IconMapping[] = [
  // Programming & Technology
  {
    keywords: ['programming', 'code', 'coding', 'software', 'developer', 'development', 'web', 'app', 'javascript', 'python', 'java', 'typescript', 'react', 'node', 'frontend', 'backend'],
    icons: [Code, Terminal, Laptop],
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    keywords: ['database', 'sql', 'data', 'storage', 'mongodb', 'postgres', 'mysql'],
    icons: [Database, Server],
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    keywords: ['web', 'website', 'internet', 'online', 'http', 'api', 'rest'],
    icons: [Globe, Server],
    gradient: 'from-green-500 to-teal-500'
  },
  {
    keywords: ['mobile', 'ios', 'android', 'app', 'phone', 'smartphone'],
    icons: [Smartphone, Laptop],
    gradient: 'from-indigo-500 to-purple-500'
  },

  // Mathematics & Statistics
  {
    keywords: ['math', 'mathematics', 'algebra', 'calculus', 'geometry', 'arithmetic', 'numbers', 'equations'],
    icons: [Calculator, PieChart],
    gradient: 'from-orange-500 to-red-500'
  },
  {
    keywords: ['statistics', 'stats', 'data analysis', 'analytics', 'probability', 'charts'],
    icons: [BarChart, TrendingUp, Activity],
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    keywords: ['finance', 'accounting', 'money', 'investment', 'trading', 'economics'],
    icons: [DollarSign, TrendingUp, Percent],
    gradient: 'from-green-500 to-emerald-500'
  },

  // Science
  {
    keywords: ['physics', 'chemistry', 'science', 'experiment', 'lab', 'research'],
    icons: [Atom, TestTube, Beaker],
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    keywords: ['biology', 'life science', 'anatomy', 'genetics', 'cells', 'dna'],
    icons: [Microscope, Dna, Droplet],
    gradient: 'from-green-500 to-lime-500'
  },
  {
    keywords: ['energy', 'electricity', 'power', 'electrical', 'circuit'],
    icons: [Zap, Lightbulb],
    gradient: 'from-yellow-500 to-orange-500'
  },

  // Languages & Communication
  {
    keywords: ['language', 'english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'learning language'],
    icons: [Languages, Globe, MessageCircle],
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    keywords: ['writing', 'reading', 'literature', 'book', 'novel', 'story', 'essay'],
    icons: [BookOpen, Book, PenTool],
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    keywords: ['communication', 'speaking', 'presentation', 'public speaking', 'speech'],
    icons: [MessageCircle, Users],
    gradient: 'from-blue-500 to-indigo-500'
  },

  // Business & Marketing
  {
    keywords: ['business', 'management', 'entrepreneurship', 'startup', 'company'],
    icons: [Briefcase, Target, Users],
    gradient: 'from-slate-500 to-gray-500'
  },
  {
    keywords: ['marketing', 'advertising', 'sales', 'promotion', 'branding'],
    icons: [TrendingUp, Target, Users],
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    keywords: ['ecommerce', 'shop', 'store', 'retail', 'shopping', 'commerce'],
    icons: [ShoppingCart, Package, DollarSign],
    gradient: 'from-green-500 to-teal-500'
  },

  // Arts & Design
  {
    keywords: ['design', 'graphic design', 'ui', 'ux', 'interface', 'visual'],
    icons: [Palette, Brush, Image],
    gradient: 'from-pink-500 to-purple-500'
  },
  {
    keywords: ['art', 'drawing', 'painting', 'illustration', 'creative'],
    icons: [Brush, Palette, Image],
    gradient: 'from-red-500 to-pink-500'
  },
  {
    keywords: ['music', 'audio', 'sound', 'song', 'instrument', 'melody'],
    icons: [Music, Sparkles],
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    keywords: ['video', 'film', 'movie', 'cinema', 'editing', 'production'],
    icons: [Film, Camera],
    gradient: 'from-red-500 to-orange-500'
  },

  // Health & Medicine
  {
    keywords: ['health', 'medicine', 'medical', 'doctor', 'healthcare', 'wellness'],
    icons: [Heart, Stethoscope, Heartbeat],
    gradient: 'from-red-500 to-pink-500'
  },
  {
    keywords: ['psychology', 'mental health', 'brain', 'mind', 'cognitive'],
    icons: [Brain, Heart],
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    keywords: ['pharmacy', 'medicine', 'drugs', 'medication', 'prescription'],
    icons: [Pill, TestTube],
    gradient: 'from-blue-500 to-cyan-500'
  },

  // Engineering & Mechanics
  {
    keywords: ['engineering', 'mechanical', 'civil', 'construction', 'building'],
    icons: [Wrench, Hammer, Settings],
    gradient: 'from-gray-500 to-slate-500'
  },
  {
    keywords: ['electronics', 'hardware', 'circuit', 'robotics', 'automation'],
    icons: [Cog, Settings, Zap],
    gradient: 'from-blue-500 to-purple-500'
  },

  // Achievement & Progress
  {
    keywords: ['achievement', 'success', 'goal', 'milestone', 'accomplishment'],
    icons: [Trophy, Award, Medal],
    gradient: 'from-yellow-500 to-amber-500'
  },
  {
    keywords: ['beginner', 'basics', 'fundamentals', 'introduction', 'start', 'foundation'],
    icons: [Rocket, Flag, Star],
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    keywords: ['advanced', 'expert', 'master', 'professional', 'pro'],
    icons: [Crown, Star, Sparkles],
    gradient: 'from-purple-500 to-pink-500'
  },

  // Navigation & Learning
  {
    keywords: ['navigation', 'path', 'route', 'journey', 'roadmap', 'guide'],
    icons: [Map, Compass, Route],
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    keywords: ['learning', 'education', 'study', 'knowledge', 'skill', 'training'],
    icons: [BookOpen, Lightbulb, Brain],
    gradient: 'from-blue-500 to-indigo-500'
  },

  // Security & Safety
  {
    keywords: ['security', 'cybersecurity', 'protection', 'safety', 'encryption'],
    icons: [Shield, Lock, Key],
    gradient: 'from-red-500 to-orange-500'
  },
  {
    keywords: ['privacy', 'confidential', 'secret', 'hidden', 'secure'],
    icons: [Eye, Lock, Shield],
    gradient: 'from-gray-500 to-slate-500'
  },

  // General/Fallback
  {
    keywords: ['idea', 'concept', 'innovation', 'creative', 'thinking'],
    icons: [Lightbulb, Sparkles, Brain],
    gradient: 'from-yellow-500 to-amber-500'
  },
  {
    keywords: ['important', 'key', 'essential', 'critical', 'vital'],
    icons: [Star, Flame, Sparkles],
    gradient: 'from-orange-500 to-red-500'
  },
];

/**
 * Get the most relevant icon for a topic
 */
export function getIconForTopic(topic: string): {
  Icon: LucideIcon;
  gradient: string;
} {
  const normalizedTopic = topic.toLowerCase();
  
  // Find best matching mapping
  for (const mapping of iconMappings) {
    for (const keyword of mapping.keywords) {
      if (normalizedTopic.includes(keyword)) {
        // Return random icon from the matching set for variety
        const randomIcon = mapping.icons[Math.floor(Math.random() * mapping.icons.length)];
        return {
          Icon: randomIcon,
          gradient: mapping.gradient
        };
      }
    }
  }
  
  // Default fallback
  return {
    Icon: Lightbulb,
    gradient: 'from-blue-500 to-purple-500'
  };
}

/**
 * Get icon based on node level (for progression)
 */
export function getIconForLevel(level: number): {
  Icon: LucideIcon;
  gradient: string;
} {
  if (level === 1) {
    return { Icon: Flag, gradient: 'from-green-500 to-emerald-500' };
  } else if (level === 2) {
    return { Icon: Target, gradient: 'from-blue-500 to-cyan-500' };
  } else if (level === 3) {
    return { Icon: Award, gradient: 'from-purple-500 to-pink-500' };
  } else {
    return { Icon: Crown, gradient: 'from-yellow-500 to-amber-500' };
  }
}

/**
 * Get icon based on content type
 */
export function getIconForContentType(contentType: string): {
  Icon: LucideIcon;
  gradient: string;
} {
  switch (contentType) {
    case 'lesson':
      return { Icon: BookOpen, gradient: 'from-blue-500 to-indigo-500' };
    case 'video':
      return { Icon: Film, gradient: 'from-red-500 to-pink-500' };
    case 'interactive':
      return { Icon: Code, gradient: 'from-green-500 to-teal-500' };
    case 'flashcard':
      return { Icon: Brain, gradient: 'from-purple-500 to-pink-500' };
    case 'project':
      return { Icon: Rocket, gradient: 'from-orange-500 to-red-500' };
    case 'challenge':
      return { Icon: Trophy, gradient: 'from-yellow-500 to-amber-500' };
    default:
      return { Icon: Star, gradient: 'from-blue-500 to-purple-500' };
  }
}
