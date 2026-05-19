'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, BookmarkPlus, Share2, Download, Navigation2, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  let leftContent = null;
  let centerContent = '';
  let rightContent = null;

  if (pathname === '/interview') {
    leftContent = (
      <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
        <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </button>
    );
    centerContent = 'Dokumentasi Baru';
    rightContent = <ThemeToggle />;
  } else if (pathname.startsWith('/result/')) {
    leftContent = (
      <button onClick={() => router.push('/interview')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
        <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </button>
    );
    centerContent = 'Hasil Dokumentasi';
    rightContent = (
      <button onClick={() => window.dispatchEvent(new CustomEvent('open-share-modal'))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
        <Share2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </button>
    );
  } else if (pathname === '/legal-radar') {
    leftContent = (
      <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
        <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </button>
    );
    centerContent = 'Legal Radar';
    rightContent = <ThemeToggle />;
  } else if (pathname === '/referral') {
    leftContent = (
      <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
        <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </button>
    );
    centerContent = 'Cari LBH';
    rightContent = <ThemeToggle />;
  } else {
    leftContent = (
      <div className="p-2 rounded-full">
        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
    );
    centerContent = 'WitnessChain';
    rightContent = <ThemeToggle />;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full h-14 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center px-2">
      <div className="w-20 flex justify-start">
        {leftContent}
      </div>
      <div className="flex-1 text-center font-semibold text-slate-900 dark:text-white text-sm truncate px-2">
        {centerContent}
      </div>
      <div className="w-20 flex justify-end">
        {rightContent}
      </div>
    </div>
  );
}
