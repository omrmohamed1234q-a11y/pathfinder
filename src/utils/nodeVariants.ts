import type { SkillNode, NodeShape, NodeSize, NodeVariant } from '@/types/skilltree';

/**
 * Intelligently assign node variants based on position, content, and context
 */
export function assignNodeVariants(nodes: SkillNode[]): SkillNode[] {
  const totalNodes = nodes.length;
  const maxLevel = Math.max(...nodes.map(n => n.level));
  
  return nodes.map((node, index) => {
    // Determine node type based on position and characteristics
    let shape: NodeShape = 'circle';
    let size: NodeSize = 'medium';
    let variant: NodeVariant = 'standard';
    
    // CHECKPOINT NODES: Every 5th level or end of major section
    if (node.level % 5 === 0 && node.level > 0) {
      shape = 'hexagon';
      size = 'large';
      variant = 'checkpoint';
      node.isCheckpoint = true;
    }
    
    // BOSS NODES: Major milestones (every 10 levels or final node)
    else if (node.level === maxLevel || node.level % 10 === 0) {
      shape = 'star';
      size = 'xl';
      variant = 'boss';
      node.isBoss = true;
      node.xp = Math.floor(node.xp * 1.5); // Boss nodes give more XP
    }
    
    // STORY NODES: Nodes with "introduction", "overview", "theory" in title
    else if (
      node.title.toLowerCase().includes('introduction') ||
      node.title.toLowerCase().includes('overview') ||
      node.title.toLowerCase().includes('theory') ||
      node.title.toLowerCase().includes('concept') ||
      node.contentType === 'video'
    ) {
      shape = 'book';
      size = 'medium';
      variant = 'story';
      node.isStory = true;
    }
    
    // PRACTICE NODES: Nodes with "practice", "exercise", "drill" in title
    else if (
      node.title.toLowerCase().includes('practice') ||
      node.title.toLowerCase().includes('exercise') ||
      node.title.toLowerCase().includes('drill') ||
      node.title.toLowerCase().includes('hands-on') ||
      node.contentType === 'flashcard' ||
      node.contentType === 'challenge'
    ) {
      shape = 'dumbbell';
      size = 'medium';
      variant = 'practice';
      node.isPractice = true;
    }
    
    // LEGENDARY NODES: Final mastery node
    else if (index === totalNodes - 1 && node.level === maxLevel) {
      shape = 'crown';
      size = 'xl';
      variant = 'legendary';
      node.isLegendary = true;
      node.xp = Math.floor(node.xp * 2); // Legendary nodes give double XP
    }
    
    // BONUS NODES: Optional or bonus content
    else if (node.isOptional || node.isBonusNode) {
      size = 'small';
    }
    
    // STANDARD NODES: Everything else
    else {
      shape = 'circle';
      size = 'medium';
      variant = 'standard';
    }
    
    return {
      ...node,
      shape,
      size,
      variant,
    };
  });
}

/**
 * Get node type description for UI
 */
export function getNodeTypeDescription(node: SkillNode): string {
  if (node.isLegendary) return 'Legendary Challenge';
  if (node.isBoss) return 'Boss Challenge';
  if (node.isCheckpoint) return 'Checkpoint Review';
  if (node.isStory) return 'Story Lesson';
  if (node.isPractice) return 'Practice Exercise';
  if (node.isBonusNode) return 'Bonus Content';
  return 'Lesson';
}

/**
 * Get node type color for UI
 */
export function getNodeTypeColor(node: SkillNode): string {
  if (node.isLegendary) return 'var(--duo-gold)';
  if (node.isBoss) return 'var(--duo-red)';
  if (node.isCheckpoint) return 'var(--duo-gold)';
  if (node.isStory) return 'var(--duo-purple)';
  if (node.isPractice) return 'var(--duo-blue)';
  if (node.isBonusNode) return 'var(--duo-purple)';
  return 'var(--duo-green)';
}
