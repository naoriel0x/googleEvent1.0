'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide nav on these pages
  const hideNav = ['/', '/login', /^\/share\//];
  const shouldHideNav = hideNav.includes(pathname) || hideNav.some(path => typeof path === 'string' ? false : path.test(pathname));

  if (shouldHideNav) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNav />
      <main className="pt-14 pb-20">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
