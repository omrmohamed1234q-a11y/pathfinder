import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Oops! Something went wrong. Let's try that again.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-8">
      {/* Error Icon */}
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>

      {/* Error Message */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Unable to Generate Content</h3>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>

      {/* Retry Button */}
      <Button
        onClick={onRetry}
        size="lg"
        className="text-lg font-semibold rounded-xl px-8 hover-scale"
        style={{
          background: 'linear-gradient(135deg, hsl(190, 100%, 50%), hsl(258, 90%, 66%))',
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
        }}
      >
        <RefreshCw className="mr-2 h-5 w-5" />
        Try Again
      </Button>
    </div>
  );
};
