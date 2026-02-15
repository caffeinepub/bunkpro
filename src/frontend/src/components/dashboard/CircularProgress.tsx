// Animated circular progress indicator

import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  className,
  showLabel = true 
}: CircularProgressProps) {
  const progressRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    if (!progressRef.current) return;
    
    const offset = circumference - (percentage / 100) * circumference;
    progressRef.current.style.strokeDashoffset = offset.toString();
  }, [percentage, circumference]);

  const getColor = () => {
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          ref={progressRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          className={cn('transition-all duration-1000 ease-out', getColor())}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
