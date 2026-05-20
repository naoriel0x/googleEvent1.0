'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useCallback, useEffect, useState } from 'react';

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

type AnimPhase = 'idle' | 'shrink' | 'grow';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, setTheme, initialized } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<AnimPhase>('idle');
  const [displayDark, setDisplayDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDisplayDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (initialized && phase === 'idle') {
      setDisplayDark(isDark);
    }
  }, [initialized, isDark, phase]);

  const handleClick = useCallback(() => {
    if (phase !== 'idle') return;

    const nextDark = !isDark;
    setPhase('shrink');

    window.setTimeout(() => {
      setDisplayDark(nextDark);
      setTheme(nextDark);
    }, 140);

    window.setTimeout(() => setPhase('grow'), 200);
    window.setTimeout(() => setPhase('idle'), 480);
  }, [phase, isDark, setTheme]);

  if (!mounted) {
    return <div className={`w-9 h-9 rounded-full ${className}`} aria-hidden />;
  }

  const Icon = displayDark ? Sun : Moon;
  const iconColor = displayDark
    ? 'text-amber-400'
    : 'text-slate-600 dark:text-slate-300';

  const scale =
    phase === 'shrink' ? 'scale-[0.45]' : phase === 'grow' ? 'theme-icon-pop' : 'scale-100';

  const sparkColor = displayDark ? 'rgb(251 191 36)' : 'rgb(148 163 184)';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={phase !== 'idle'}
      className={`
        relative w-9 h-9 rounded-full flex items-center justify-center
        bg-slate-100 dark:bg-slate-800
        border border-slate-200/80 dark:border-slate-600/80
        hover:bg-slate-200/80 dark:hover:bg-slate-700/80
        transition-colors duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60
        disabled:pointer-events-none
        ${className}
      `}
      aria-label={displayDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
    >
      {phase === 'shrink' && (
        <span className="absolute inset-0 pointer-events-none" aria-hidden>
          {SPARK_ANGLES.map((deg, i) => (
            <span
              key={deg}
              className="theme-spark absolute left-1/2 top-1/2 w-1 h-1 rounded-full"
              style={{
                ['--spark-angle' as string]: `${deg}deg`,
                animationDelay: `${i * 25}ms`,
                backgroundColor: sparkColor,
              }}
            />
          ))}
        </span>
      )}

      {phase === 'shrink' && (
        <span className="absolute inset-0 rounded-full theme-toggle-ring pointer-events-none" aria-hidden />
      )}

      <span
        className={`
          relative z-10 flex items-center justify-center
          ${phase === 'shrink' ? 'transition-transform duration-150 ease-in' : ''}
          ${scale}
        `}
      >
        <Icon
          className={`w-[18px] h-[18px] ${iconColor} transition-colors duration-300`}
          strokeWidth={2.25}
        />
      </span>
    </button>
  );
}
