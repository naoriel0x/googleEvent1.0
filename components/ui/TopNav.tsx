'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Share2, Shield } from 'lucide-react';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  let leftContent: React.ReactNode = null;
  let centerContent: React.ReactNode = '';
  let rightContent: React.ReactNode = null;

  const backBtn = (onClick: () => void) => (
    <button
      onClick={onClick}
      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
    </button>
  );

  if (pathname === '/interview') {
    leftContent = backBtn(() => router.back());
    centerContent = 'Dokumentasi Baru';
  } else if (pathname === '/result') {
    leftContent = backBtn(() => router.back());
    centerContent = 'Hasil Dokumentasi';
  } else if (pathname.startsWith('/result/')) {
    leftContent = backBtn(() => router.push('/result'));
    centerContent = 'Hasil Dokumentasi';
    rightContent = (
      <div className="flex items-center gap-1">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-share-modal'))}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Share2 className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
      </div>
    );
  } else if (pathname === '/legal-radar') {
    leftContent = backBtn(() => router.back());
    centerContent = 'Legal Radar';
  } else if (pathname === '/referral') {
    leftContent = backBtn(() => router.back());
    centerContent = 'Cari LBH';
  } else {
    // Menentukan target redirect secara dinamis
    const logoTarget = pathname === '/' ? '/' : '/dashboard';

    leftContent = (
      <Link
        href={logoTarget}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors block cursor-pointer"
      >
        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </Link>
    );

    centerContent = (
      <Link
        href={logoTarget}
        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
      >
        WitnessChain
      </Link>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full h-14 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center px-2 transition-colors duration-300">
      <div className="w-12 flex justify-start">{leftContent}</div>
      <div className="flex-1 text-center font-semibold text-slate-900 dark:text-slate-100 text-sm truncate px-2">
        {centerContent}
      </div>
      <div className="w-auto min-w-[3rem] flex justify-end">{rightContent}</div>
    </div>
  );
}