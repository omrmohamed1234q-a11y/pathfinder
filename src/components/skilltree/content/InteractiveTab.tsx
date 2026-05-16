import React, { useState } from 'react';
import { Code, ExternalLink, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InteractiveContent } from '@/types/skilltree';

interface InteractiveTabProps {
  content: InteractiveContent;
  onComplete?: () => void;
}

export const InteractiveTab: React.FC<InteractiveTabProps> = ({ content, onComplete }) => {
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    onComplete?.();
  };

  const getPlatformName = () => {
    switch (content.platform) {
      case 'codesandbox': return 'CodeSandbox';
      case 'replit': return 'Replit';
      case 'codepen': return 'CodePen';
      default: return 'Interactive Demo';
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {content.instructions && (
        <div className="glass rounded-xl p-6 space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Instructions
          </h3>
          <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {content.instructions}
          </p>
        </div>
      )}

      {/* Interactive Embed */}
      <div className="relative rounded-2xl overflow-hidden glass border border-card-border">
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Code className="h-4 w-4 text-primary" />
            {getPlatformName()}
          </div>
          <a
            href={content.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Open in new tab
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <iframe
          src={content.embedUrl}
          title="Interactive demo"
          className="w-full h-[600px] bg-background"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {content.solution && (
          <Button
            onClick={() => setShowSolution(!showSolution)}
            variant="outline"
            className="gap-2"
          >
            <Code className="h-4 w-4" />
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </Button>
        )}
        {!completed && (
          <Button
            onClick={handleComplete}
            className="gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(190,100%,50%), hsl(258,90%,66%))' }}
          >
            <CheckCircle className="h-4 w-4" />
            Mark as Complete
          </Button>
        )}
        {completed && (
          <div className="flex items-center gap-2 text-green-500 font-medium">
            <CheckCircle className="h-5 w-5" />
            Completed!
          </div>
        )}
      </div>

      {/* Solution */}
      {showSolution && content.solution && (
        <div className="glass rounded-xl p-6 space-y-3 border-l-4 border-green-500">
          <h3 className="text-lg font-bold flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            Solution
          </h3>
          <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm">{content.solution}</code>
          </pre>
          <p className="text-sm text-muted-foreground">
            💡 Try to implement it yourself first before looking at the solution!
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="glass rounded-xl p-4 border-l-4 border-primary">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Experiment with the code! Break things, fix them, and learn by doing. That's the best way to master programming.
        </p>
      </div>
    </div>
  );
};
