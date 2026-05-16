import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToScreen: () => void;
  currentZoom: number;
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToScreen,
  currentZoom,
  className = '',
}) => {
  return (
    <TooltipProvider>
      <div 
        className={`fixed bottom-6 right-6 flex flex-col gap-2 z-40 ${className}`}
        style={{
          background: 'var(--duo-surface)',
          border: '2px solid var(--duo-border)',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Zoom In */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomIn}
              className="h-10 w-10"
              style={{
                color: 'var(--duo-text)',
                background: 'transparent',
              }}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Zoom In (+)</p>
          </TooltipContent>
        </Tooltip>

        {/* Current Zoom Level */}
        <div 
          className="text-xs font-bold text-center py-1"
          style={{ color: 'var(--duo-text-muted)' }}
        >
          {Math.round(currentZoom * 100)}%
        </div>

        {/* Zoom Out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomOut}
              className="h-10 w-10"
              style={{
                color: 'var(--duo-text)',
                background: 'transparent',
              }}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Zoom Out (-)</p>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div 
          className="h-px w-full my-1"
          style={{ background: 'var(--duo-border)' }}
        />

        {/* Fit to Screen */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFitToScreen}
              className="h-10 w-10"
              style={{
                color: 'var(--duo-text)',
                background: 'transparent',
              }}
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Fit to Screen</p>
          </TooltipContent>
        </Tooltip>

        {/* Reset View */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="h-10 w-10"
              style={{
                color: 'var(--duo-text)',
                background: 'transparent',
              }}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Reset View (R)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
