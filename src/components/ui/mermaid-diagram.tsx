import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

// Initialize Mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#00d4ff',
    primaryTextColor: '#fff',
    primaryBorderColor: '#8b5cf6',
    lineColor: '#8b5cf6',
    secondaryColor: '#8b5cf6',
    tertiaryColor: '#1e293b',
    background: '#0f172a',
    mainBkg: '#1e293b',
    secondBkg: '#334155',
    textColor: '#e2e8f0',
    fontSize: '14px',
  },
  flowchart: {
    curve: 'basis',
    padding: 20,
  },
});

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        setError(null);
        
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, chart);
        
        // Insert the SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="glass rounded-lg p-4 border border-red-500/30 bg-red-500/10">
        <p className="text-red-500 text-sm">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`mermaid-container glass rounded-lg p-4 overflow-x-auto ${className}`}
      style={{ 
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
};
