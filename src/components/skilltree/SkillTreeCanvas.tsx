import React, { useEffect, useState } from 'react';
import { SkillNode } from './SkillNode';
import type { SkillTree, SkillNode as SkillNodeType } from '@/types/skilltree';

interface SkillTreeCanvasProps {
  skillTree: SkillTree;
  onNodeClick?: (node: SkillNodeType) => void;
}

interface NodePosition {
  id: number;
  x: number;
  y: number;
  node: SkillNodeType;
}

export const SkillTreeCanvas: React.FC<SkillTreeCanvasProps> = ({ skillTree, onNodeClick }) => {
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const positions: NodePosition[] = [];
    const levelGroups: { [key: number]: SkillNodeType[] } = {};
    for (const node of skillTree.nodes) {
      if (!levelGroups[node.level]) levelGroups[node.level] = [];
      levelGroups[node.level].push(node);
    }
    const nodeWidth = 240, nodeHeight = 180, hSpace = 80, vSpace = 140;
    for (const level of Object.keys(levelGroups).map(Number).sort()) {
      const nodes = levelGroups[level];
      const w = nodes.length * nodeWidth + (nodes.length - 1) * hSpace;
      nodes.forEach((node, i) => {
        positions.push({ id: node.id, x: i * (nodeWidth + hSpace) - w / 2, y: (level - 1) * (nodeHeight + vSpace), node });
      });
    }
    setNodePositions(positions);
    setTimeout(() => setIsVisible(true), 100);
  }, [skillTree]);

  if (nodePositions.length === 0) return null;
  const pad = 140;
  const minX = Math.min(...nodePositions.map(p => p.x)) - pad;
  const maxX = Math.max(...nodePositions.map(p => p.x + 240)) + pad;
  const minY = -pad;
  const maxY = Math.max(...nodePositions.map(p => p.y + 180)) + pad;
  const vbW = maxX - minX, vbH = maxY - minY;

  return (
    <div className="relative w-full overflow-x-auto pb-20">
      <svg
        viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
        className="w-full"
        style={{ minHeight: '600px', pointerEvents: 'auto' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {nodePositions.map(pp => pp.node.children.map(cid => {
          const cp = nodePositions.find(p => p.id === cid);
          if (!cp) return null;
          const x1=pp.x+120, y1=pp.y+180, x2=cp.x+120, y2=cp.y, my=(y1+y2)/2;
          const done = pp.node.status === 'completed';
          const d = `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
          return (
            <g key={`${pp.id}-${cid}`} style={{ pointerEvents: 'none' }}>
              <path d={d} stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
              <path d={d} stroke="hsl(190, 100%, 50%)" strokeWidth="2" fill="none" filter="url(#glow)" opacity="0.6" />
              {done && <path d={d} stroke="hsl(45, 93%, 47%)" strokeWidth="2" fill="none" strokeDasharray="10 10" className="energy-flow" />}
            </g>
          );
        }))}
        <g className={isVisible ? 'stagger-children' : ''} style={{ pointerEvents: 'auto' }}>
          {nodePositions.map((pos, i) => (
            <foreignObject 
              key={pos.id} 
              x={pos.x} 
              y={pos.y} 
              width="240" 
              height="180"
            >
              <div style={{ width: '240px', height: '180px', pointerEvents: 'auto' }}>
                <SkillNode 
                  node={pos.node} 
                  onClick={() => onNodeClick?.(pos.node)}
                  topic={skillTree.topic}
                />
              </div>
            </foreignObject>
          ))}
        </g>
      </svg>
    </div>
  );
};
