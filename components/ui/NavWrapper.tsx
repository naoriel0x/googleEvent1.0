'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideTopNav = ['/', '/login', '/dashboard', /^\/share\//];
  const hideBottomNav = ['/', '/login', '/interview', '/result', '/my-documents', '/admin', '/referral', '/legal', /^\/share\//];

  const shouldHideTop = hideTopNav.some(p =>
    typeof p === 'string' ? p === pathname : p.test(pathname)
  );
  const shouldHideBottom = hideBottomNav.some(p =>
    typeof p === 'string' ? p === pathname : p.test(pathname)
  );
  const isDashboard = pathname === '/dashboard';

  if (shouldHideTop && shouldHideBottom) return <>{children}</>;

  return (
    <>
      {!shouldHideTop && <TopNav />}
      <main
        className={[
          'flex flex-1 flex-col min-h-dvh',
          !shouldHideTop ? 'pt-14' : '',
          !shouldHideBottom && !isDashboard ? 'pb-24' : '',
          isDashboard ? 'flex flex-1 flex-col min-h-dvh' : 'bg-slate-50 dark:bg-slate-950',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </main>
      {!shouldHideBottom && <BottomNav />}
    </>
  );
}
