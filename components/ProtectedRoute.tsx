'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from './ui/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Komponen untuk melindungi routes yang memerlukan autentikasi
 * Jika user belum login, akan redirect ke halaman login
 * 
 * Contoh penggunaan:
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || !session) {
        // Simpan path sebelumnya sebelum redirect
        sessionStorage.setItem('wc_prev_path', window.location.pathname);
        router.push('/login');
      } else {
        setIsChecking(false);
      }
    }
  }, [user, session, loading, router]);

  if (loading || isChecking) {
    return fallback ?? (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  return <>{children}</>;
}
