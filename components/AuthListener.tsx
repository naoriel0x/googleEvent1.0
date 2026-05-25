'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // 1. Tambahkan usePathname
import { getSupabaseClient } from '@/lib/supabase';
import { AuthChangeEvent } from '@supabase/supabase-js';

export default function AuthListener() {
  const router = useRouter();
  const pathname = usePathname(); // 2. Ambil rute url aktif saat ini

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // CEK SESSION SAAT APP PERTAMA DIKUNJUNGI
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      // Jika refresh token invalid / session rusak
      if (error || !data.session) {
        // Panggil signOut bawaan Supabase untuk bersihkan cookie & token di storage
        await supabase.auth.signOut();

        // Catatan: localStorage.removeItem('supabase.auth.token') bersifat opsional 
        // karena signOut() di atas otomatis membersihkan storage bawaan Supabase.

        // Hanya lempar ke login jika user sedang tidak berada di rute publik
        const publicRoutes = ['/', '/login', '/share'];
        const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
        
        if (!isPublic) {
          router.replace('/login');
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent) => {
        if (event === 'SIGNED_OUT') {
          router.replace('/login');
        }

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
  }, [router, pathname]); // 3. Masukkan pathname ke dalam dependency array

  return null;
}