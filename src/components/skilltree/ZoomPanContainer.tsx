import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { haptics } from '@/utils/haptics';

interface ZoomPanContainerProps {
  children: React.ReactNode;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  storageKey?: string;
}

interface Position {
  x: number;
  y: number;
}

interface ZoomPanState {
  scale: number;
  position: Position;
}

export interface ZoomPanControls {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  fitToScreen: () => void;
  getScale: () => number;
  getPosition: () => Position;
}

export const ZoomPanContainer = forwardRef<HTMLDivElement, ZoomPanContainerProps>(({
  children,
  minZoom = 0.5,
  maxZoom = 3,
  zoomStep = 0.1,
  storageKey = 'skill-tree-zoom-pan',
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const state: ZoomPanState = JSON.parse(saved);
        setScale(state.scale);
        setPosition(state.position);
      }
    } catch (e) {
      console.error('Failed to load zoom/pan state:', e);
    }
  }, [storageKey]);

  // Auto-fit on first load if no saved state
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      // Wait for content to render, then fit to screen
      const timer = setTimeout(() => {
        if (containerRef.current && contentRef.current) {
          const container = containerRef.current.getBoundingClientRect();
          const content = contentRef.current.getBoundingClientRect();
          
          if (content.width > 0 && content.height > 0) {
            const scaleX = container.width / content.width;
            const scaleY = container.height / content.height;
            const fitScale = Math.max(minZoom, Math.min(maxZoom, Math.min(scaleX, scaleY) * 0.85));
            setScale(fitScale);
            setPosition({ x: 0, y: 0 });
          }
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [storageKey, minZoom, maxZoom]);

  // Save state to localStorage
  useEffect(() => {
    try {
      const state: ZoomPanState = { scale, position };
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save zoom/pan state:', e);
    }
  }, [scale, position, storageKey]);

  // Clamp zoom level
  const clampZoom = useCallback((zoom: number) => {
    return Math.max(minZoom, Math.min(maxZoom, zoom));
  }, [minZoom, maxZoom]);

  // Clamp position to prevent panning too far
  const clampPosition = useCallback((pos: Position, currentScale: number) => {
    if (!containerRef.current || !contentRef.current) return pos;

    const container = containerRef.current.getBoundingClientRect();
    const contentWidth = contentRef.current.scrollWidth;
    const contentHeight = contentRef.current.scrollHeight;

    const scaledWidth = contentWidth * currentScale;
    const scaledHeight = contentHeight * currentScale;

    // Calculate max pan distance
    const maxX = Math.max(0, (scaledWidth - container.width) / 2);
    const maxY = Math.max(0, (scaledHeight - container.height) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, pos.x)),
      y: Math.max(-maxY, Math.min(maxY, pos.y)),
    };
  }, []);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
    const newScale = clampZoom(scale + delta);

    if (newScale !== scale) {
      setScale(newScale);
      // Adjust position to zoom towards cursor
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        
        const scaleRatio = newScale / scale;
        const newPos = {
          x: mouseX - (mouseX - position.x) * scaleRatio,
          y: mouseY - (mouseY - position.y) * scaleRatio,
        };
        
        setPosition(clampPosition(newPos, newScale));
      }
    }
  }, [scale, position, zoomStep, clampZoom, clampPosition]);

  // Handle mouse down (start drag)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.preventDefault();
  }, [position]);

  // Handle mouse move (drag)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newPos = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };

    setPosition(clampPosition(newPos, scale));
  }, [isDragging, dragStart, scale, clampPosition]);

  // Handle mouse up (end drag)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp, isDragging]);

  // Public API for external controls
  const zoomIn = useCallback(() => {
    const newScale = clampZoom(scale + zoomStep * 2);
    setScale(newScale);
    setPosition(clampPosition(position, newScale));
  }, [scale, position, zoomStep, clampZoom, clampPosition]);

  const zoomOut = useCallback(() => {
    const newScale = clampZoom(scale - zoomStep * 2);
    setScale(newScale);
    setPosition(clampPosition(position, newScale));
  }, [scale, position, zoomStep, clampZoom, clampPosition]);

  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const content = contentRef.current.getBoundingClientRect();

    const scaleX = container.width / content.width;
    const scaleY = container.height / content.height;
    const newScale = clampZoom(Math.min(scaleX, scaleY) * 0.9); // 90% to add padding

    setScale(newScale);
    setPosition({ x: 0, y: 0 });
  }, [clampZoom]);

  // Expose controls via imperative handle
  useImperativeHandle(ref, () => {
    const element = containerRef.current!;
    (element as any).zoomPanControls = {
      zoomIn,
      zoomOut,
      resetView,
      fitToScreen,
      getScale: () => scale,
      getPosition: () => position,
    };
    return element;
  }, [zoomIn, zoomOut, resetView, fitToScreen, scale, position]);

  // Touch event handling for mobile gestures
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    let touchStartDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch gesture started
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchStartDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = scale;
        haptics.tap();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const touchDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const scaleChange = touchDistance / touchStartDistance;
        const newScale = clampZoom(initialScale * scaleChange);
        setScale(newScale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStartDistance = 0;
        haptics.tap();
      }
    };

    content.addEventListener('touchstart', handleTouchStart, { passive: true });
    content.addEventListener('touchmove', handleTouchMove, { passive: false });
    content.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      content.removeEventListener('touchstart', handleTouchStart);
      content.removeEventListener('touchmove', handleTouchMove);
      content.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, clampZoom]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div
        ref={contentRef}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
});

ZoomPanContainer.displayName = 'ZoomPanContainer';
