'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { AuthChangeEvent } from '@supabase/supabase-js';

// Fungsi bantuan untuk membaca cookie di sisi client
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function AuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Daftar halaman publik yang BEBAS diakses siapa saja
    const publicRoutes = ['/', '/login', '/share'];
    const isPublicRoute = publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));

    // 1. CEK SESSION & GUEST MODE SAAT APP PERTAMA DIKUNJUNGI
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // Cek apakah user sedang dalam mode Guest
      const isGuest = getCookie('wc_guest_mode') === 'true';

      // Jika session error / token rusak total
      if (error || !data.session) {
        // Hanya jalankan signOut jika memang bukan guest (mencegah loop)
        if (!isGuest) {
          await supabase.auth.signOut();
        }
        
        // 🔥 FIX: Jangan lempar ke login jika ini rute publik ATAU user adalah GUEST
        if (!isPublicRoute && !isGuest) {
          router.replace('/login');
        }
      }
    };

    checkSession();

    // 2. LISTENER LOGIN / LOGOUT REAL-TIME
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent) => {
        const isGuest = getCookie('wc_guest_mode') === 'true';
        
        // Jika statusnya SIGNED_OUT
        if (event === 'SIGNED_OUT') {
          // 🔥 FIX: Hanya lempar ke login kalau bukan rute publik DAN BUKAN akun guest
          if (!isPublicRoute && !isGuest) {
            router.replace('/login');
          }
        }

        // Jika user berhasil login resmi via Supabase
        if (event === 'SIGNED_IN') {
          router.refresh();
          
          if (pathname === '/login' || pathname === '/') {
            router.replace('/dashboard');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null;
}