import React from 'react';

interface ProgressRingProps {
  score: number; // 0-100
  size?: number; // in pixels
  strokeWidth?: number;
  isThinking?: boolean;
  isDark?: boolean;
}

export function ProgressRing({
  score,
  size = 120,
  strokeWidth = 8,
  isThinking = false,
  isDark = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (): string => {
    if (score < 50) return '#dc2626'; // red
    if (score < 80) return '#d97706'; // amber
    return '#059669'; // emerald
  };

  const getBgColor = (): string => {
    return isDark ? '#334155' : '#e2e8f0';
  };

  return (
    <svg 
      width={size} 
      height={size} 
      className={`transform -rotate-90 transition-all duration-500 ${isThinking ? 'animate-pulse scale-105' : ''}`}
      style={{
        filter: isThinking ? `drop-shadow(0 0 8px ${getColor()})` : 'none',
      }}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={getBgColor()}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={getColor()}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 0.35s',
        }}
      />
      {/* Center text */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dy="0.3em"
        fontSize="24"
        fontWeight="bold"
        fill={getColor()}
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: `${size / 2}px ${size / 2}px`,
        }}
      >
        {score}%
      </text>
    </svg>
  );
}
