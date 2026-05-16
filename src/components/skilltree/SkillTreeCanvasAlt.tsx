import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SkillNode } from './SkillNode';
import type { SkillTree, SkillNode as SkillNodeType } from '@/types/skilltree';

interface SkillTreeCanvasProps {
  skillTree: SkillTree;
  onNodeClick?: (node: SkillNodeType) => void;
}

interface LevelRow {
  level: number;
  nodes: SkillNodeType[];
}

interface LineCoord {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  completed: boolean;
  justCompleted?: boolean;
  index: number;
}

/**
 * Dynamic winding path layout for skill trees of any size.
 * Nodes snake in a serpentine pattern as levels progress.
 * Connection lines are animated dotted trails.
 */
export const SkillTreeCanvasAlt: React.FC<SkillTreeCanvasProps> = ({ skillTree, onNodeClick }) => {
  const [levelRows, setLevelRows] = useState<LevelRow[]>([]);
  const [lines, setLines] = useState<LineCoord[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const prevCompletedLinesRef = useRef<Set<string>>(new Set());

  // Group nodes by level
  useEffect(() => {
    const groups: { [key: number]: SkillNodeType[] } = {};
    for (const node of skillTree.nodes) {
      if (!groups[node.level]) groups[node.level] = [];
      groups[node.level].push(node);
    }
    const rows = Object.keys(groups)
      .map(Number)
      .sort((a, b) => a - b)
      .map(level => ({ level, nodes: groups[level] }));
    setLevelRows(rows);
    setTimeout(() => setIsVisible(true), 50);
  }, [skillTree]);

  // Measure layout positions (ignoring CSS transforms from zoom/pan)
  const measureLines = useCallback(() => {
    if (!containerRef.current || levelRows.length === 0) return;
    const container = containerRef.current;
    
    // Helper to get element position relative to container, ignoring CSS transforms
    const getLocalPos = (el: HTMLElement) => {
      let x = 0;
      let y = 0;
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      let current: HTMLElement | null = el;
      
      while (current && current !== container && current !== document.body) {
        x += current.offsetLeft;
        y += current.offsetTop;
        current = current.offsetParent as HTMLElement;
      }
      return { x, y, width, height };
    };

    const newLines: LineCoord[] = [];
    const currentCompletedLines = new Set<string>();
    let lineIndex = 0;

    for (const node of skillTree.nodes) {
      if (!node.children || node.children.length === 0) continue;
      const parentEl = nodeRefs.current.get(node.id);
      if (!parentEl) continue;
      
      const pPos = getLocalPos(parentEl);
      const px = pPos.x + pPos.width / 2;
      const py = pPos.y + pPos.height; // Bottom center

      for (const childId of node.children) {
        const childEl = nodeRefs.current.get(childId);
        if (!childEl) continue;
        
        const cPos = getLocalPos(childEl);
        const cx = cPos.x + cPos.width / 2;
        const cy = cPos.y; // Top center

        const lineKey = `${node.id}-${childId}`;
        const isCompleted = node.status === 'completed';
        const wasCompleted = prevCompletedLinesRef.current.has(lineKey);
        const justCompleted = isCompleted && !wasCompleted;

        if (isCompleted) {
          currentCompletedLines.add(lineKey);
        }

        newLines.push({
          x1: px,
          y1: py,
          x2: cx,
          y2: cy,
          completed: isCompleted,
          justCompleted,
          index: lineIndex++,
        });
      }
    }
    
    prevCompletedLinesRef.current = currentCompletedLines;
    setLines(newLines);
  }, [skillTree, levelRows]);

  useEffect(() => {
    const timer = setTimeout(measureLines, 300);
    window.addEventListener('resize', measureLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureLines);
    };
  }, [measureLines, isVisible]);

  const setNodeRef = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) {
      nodeRefs.current.set(id, el);
    }
  }, []);

  if (levelRows.length === 0) return null;

  const totalNodes = skillTree.nodes.length;
  const maxNodesInRow = Math.max(...levelRows.map(r => r.nodes.length));

  // Winding path: alternate alignment per row — wider swings for visual interest
  const getRowAlignment = (rowIndex: number, nodeCount: number): string => {
    if (nodeCount > 2) return 'justify-center';
    if (nodeCount === 2) return 'justify-center';
    // Single node rows snake: center, left, center, right, center, left...
    const positions = ['justify-center', 'justify-start', 'justify-center', 'justify-end'];
    return positions[rowIndex % positions.length];
  };

  const getRowPadding = (rowIndex: number, nodeCount: number): string => {
    if (nodeCount > 2) return 'px-4';
    if (nodeCount === 2) return 'px-8 md:px-16';
    // Single nodes get wider offsets for serpentine effect
    const positions = ['px-0', 'pl-12 md:pl-32 lg:pl-40', 'px-0', 'pr-12 md:pr-32 lg:pr-40'];
    return positions[rowIndex % positions.length];
  };

  // Dynamic gap — tighter for larger trees
  const rowGap = totalNodes > 14 ? 'gap-8' : totalNodes > 10 ? 'gap-10' : 'gap-12';
  const nodeGap = maxNodesInRow > 3 ? 'gap-3' : 'gap-5';

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto py-8">
      {/* SVG Connection Lines — Dotted Trails */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <defs>
          {/* Glow filter for completed lines */}
          <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {lines.map((line, i) => {
          const my = (line.y1 + line.y2) / 2;
          // Use a smooth S-curve for connections
          const controlOffset = Math.abs(line.x2 - line.x1) * 0.3;
          const d = `M ${line.x1} ${line.y1} C ${line.x1} ${line.y1 + controlOffset + (line.y2 - line.y1) * 0.4}, ${line.x2} ${line.y2 - controlOffset - (line.y2 - line.y1) * 0.4}, ${line.x2} ${line.y2}`;
          
          // Calculate path length for animation
          const animDelay = line.index * 0.08; // Staggered draw-in

          return (
            <g key={`line-${i}`}>
              {/* Trail line */}
              <path
                d={d}
                stroke={line.completed ? 'var(--duo-green)' : 'var(--duo-border)'}
                strokeWidth={line.completed ? 4 : 3}
                fill="none"
                strokeDasharray={line.completed ? 'none' : '8 8'}
                strokeLinecap="round"
                opacity={line.completed ? 0.7 : 0.35}
                filter={line.completed ? 'url(#line-glow)' : undefined}
                className={line.justCompleted ? 'animate-path-reveal' : ''}
                style={{
                  animation: !line.completed && isVisible ? `line-draw-in 0.6s ease-out ${animDelay}s both` : undefined,
                }}
              />
              {/* Energy dots for completed paths */}
              {line.completed && (
                <path
                  d={d}
                  stroke="var(--duo-green-light)"
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray="4 16"
                  strokeLinecap="round"
                  className="energy-flow"
                  opacity={0.5}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Node Rows — winding path */}
      <div className={`flex flex-col ${rowGap}`} style={{ zIndex: 1, position: 'relative' }}>
        {levelRows.map((row, rowIndex) => (
          <div
            key={row.level}
            className={`flex ${getRowAlignment(rowIndex, row.nodes.length)} ${nodeGap} ${getRowPadding(rowIndex, row.nodes.length)}`}
          >
            {row.nodes.map((node, nodeIndex) => (
              <div
                key={node.id}
                ref={(el) => setNodeRef(node.id, el)}
                className={`${isVisible ? 'node-entrance' : 'opacity-0'}`}
                style={{
                  animationDelay: `${(rowIndex * 100) + (nodeIndex * 60)}ms`,
                }}
              >
                <SkillNode
                  node={node}
                  onClick={() => {
                    onNodeClick?.(node);
                  }}
                  topic={skillTree.topic}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
