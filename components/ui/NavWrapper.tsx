'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideTopNav = ['/', '/login', '/dashboard', /^\/share\//];
  const hideBottomNav = ['/', '/login', /^\/share\//];

  const shouldHideTop = hideTopNav.some(p =>
    typeof p === 'string' ? p === pathname : p.test(pathname)
  );
  const shouldHideBottom = hideBottomNav.some(p =>
    typeof p === 'string' ? p === pathname : p.test(pathname)
  );

  if (shouldHideTop && shouldHideBottom) return <>{children}</>;

  return (
    <>
      {!shouldHideTop && <TopNav />}
      <main className={`${!shouldHideTop ? 'pt-14' : ''} ${!shouldHideBottom ? 'pb-20' : ''}`}>
        {children}
      </main>
      {!shouldHideBottom && <BottomNav />}
    </>
  );
}