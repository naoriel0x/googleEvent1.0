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
    // Outer wrapper: fixed, full width, transparent — only for positioning + safe area
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-3 pointer-events-none"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {/* The floating Dynamic Island pill */}
      <nav className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-black/50 transition-all duration-500">
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
              className={`
                relative flex flex-col items-center justify-center
                px-4 py-2 rounded-xl
                transition-all duration-200 active:scale-90
                group
                ${isActive
                  ? 'bg-emerald-500/15 border border-emerald-500/25'
                  : 'border border-transparent hover:bg-slate-800/60 hover:border-slate-700/40'
                }
              `}
            >
              {/* Active dot indicator (top) */}
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              )}

              <Icon
                className={`w-5 h-5 mb-1 transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span
                className={`text-[10px] font-bold tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}