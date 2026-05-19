'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, ClipboardList, Scale, MapPin } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Dokumentasi', href: '/interview', icon: FileText },
    { name: 'Hasil', href: '/result', icon: ClipboardList },
    { name: 'Legal', href: '/legal-radar', icon: Scale },
    { name: 'LBH', href: '/referral', icon: MapPin },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-800/50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-between items-center px-4 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            item.name === 'Hasil' ? pathname.startsWith('/result') :
            item.name === 'Legal' ? pathname === '/legal-radar' :
            pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-full transition-transform duration-100 active:scale-90"
            >
              <div className="relative flex flex-col items-center justify-center w-full h-full z-10">
                <Icon className={`w-[22px] h-[22px] mb-1 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 -mt-1.5 w-1 h-1 bg-emerald-500 rounded-full" />
                )}
              </div>
              {isActive && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl -z-10" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
