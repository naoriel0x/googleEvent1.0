import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800/90 rounded-lg
        border border-slate-200 dark:border-slate-700
        shadow-sm hover:shadow-md dark:hover:shadow-emerald-950/30
        transition-shadow duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}
