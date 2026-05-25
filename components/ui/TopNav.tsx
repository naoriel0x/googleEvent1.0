'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Share2, Shield, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: import('@supabase/supabase-js').Session | null } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_: any, session: import('@supabase/supabase-js').Session | null) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

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

  // Avatar/login button untuk pojok kanan
  const authRight = user ? (
    <button
      onClick={async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut({ scope: 'local' });
        router.replace('/login');
      }}
      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center"
      title="Keluar"
    >
      {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
        <img
          src={user.user_metadata.avatar_url || user.user_metadata.picture}
          alt="avatar"
          className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
          <span className="text-[9px] font-black text-emerald-400">
            {(user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'U')
              .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
          </span>
        </div>
      )}
    </button>
  ) : (
    <Link
      href="/login"
      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title="Masuk"
    >
      <LogIn className="w-4 h-4 text-slate-700 dark:text-slate-200" />
    </Link>
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
    <div className="fixed top-0 inset-x-0 z-50 w-full h-14 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center transition-colors duration-300 overflow-hidden">
      <div className="flex items-center w-full px-3">
        <div className="w-12 flex justify-start flex-shrink-0">{leftContent}</div>
        <div className="flex-1 text-center font-semibold text-slate-900 dark:text-slate-100 text-sm truncate px-2">
          {centerContent}
        </div>
        <div className="w-12 flex justify-end flex-shrink-0">
          {rightContent ?? authRight}
        </div>
      </div>
    </div>
  );
}