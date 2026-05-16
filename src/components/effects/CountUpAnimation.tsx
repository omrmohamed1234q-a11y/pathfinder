import React, { useEffect, useState, useRef } from 'react';

interface CountUpAnimationProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
}

export const CountUpAnimation: React.FC<CountUpAnimationProps> = ({
  from,
  to,
  duration = 1000,
  suffix = '',
  className = '',
  onComplete,
}) => {
  const [count, setCount] = useState(from);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function: easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentCount = Math.floor(from + (to - from) * easeProgress);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(to);
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [from, to, duration, onComplete]);

  return (
    <span className={className}>
      {count}{suffix}
    </span>
  );
};
