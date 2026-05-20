'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const init = useTheme((s) => s.init);

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  return <>{children}</>;
}
