import React from 'react';

export const SkeletonTree: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-12">
      {/* Loading Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold gradient-text animate-pulse-slow">
          Generating your learning path...
        </h2>
        <p className="text-muted-foreground text-lg">
          Our AI is crafting a personalized skill tree just for you
        </p>
      </div>

      {/* Neural Network Animation */}
      <div className="relative w-80 h-72">
        <svg viewBox="0 0 300 270" className="w-full h-full">
          <defs>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(190, 100%, 50%)" />
              <stop offset="100%" stopColor="hsl(258, 90%, 66%)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines with flow animation */}
          {[
            [150,40,80,130], [150,40,220,130],
            [80,130,60,230], [80,130,140,230],
            [220,130,160,230], [220,130,240,230],
          ].map(([x1,y1,x2,y2], i) => (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(190, 100%, 50%)" strokeWidth="2" strokeDasharray="5 5" className="energy-flow" filter="url(#glow)" opacity="0.6" />
            </g>
          ))}

          {/* Pulsing nodes */}
          {[
            [150,40,0], [80,130,0.3], [220,130,0.6],
            [60,230,0.9], [140,230,1.2], [160,230,1.5], [240,230,1.8],
          ].map(([cx,cy,delay], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="12" fill="url(#nodeGradient)" filter="url(#glow)">
                <animate attributeName="r" values="12;16;12" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={cx} cy={cy} r="6" fill="hsl(222, 45%, 5%)">
                <animate attributeName="r" values="6;8;6" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>
      </div>

      {/* Loading steps */}
      <div className="space-y-2 text-center">
        {['Analyzing topic structure...', 'Building learning path...', 'Generating node content...'].map((step, i) => (
          <div key={i} className="flex items-center justify-center gap-2 text-sm text-muted-foreground" style={{ animationDelay: `${i * 0.5}s` }}>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};
