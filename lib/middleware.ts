import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const publicRoutes = [
  '/',
  '/login',
  '/share',
];

const protectedRoutes = [
  '/dashboard',
  '/interview',
  '/result',
  '/admin',
  '/my-documents',
  '/legal-radar',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Jika sudah di public route atau static assets, lanjut
  if (publicRoutes.some(route => pathname === route) || pathname.startsWith('/public')) {
    return NextResponse.next();
  }

  // Cek jika di protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.next();
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // Cek session dari cookies
    let authenticated = false;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      authenticated = !!session;
    } catch (error) {
      console.error('Auth check error:', error);
    }

    // Jika tidak authenticated di protected route, redirect ke login
    if (!authenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
