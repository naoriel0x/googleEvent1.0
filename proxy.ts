// middleware.ts (atau proxy.ts tergantung setup project lo)
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isAdminTokenValid } from '@/lib/admin-auth';

// Public routes yang tidak perlu auth Supabase
const publicRoutes = ['/', '/login', '/share'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files & internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') || // ✅ FIX Bug #1: skip /auth/callback agar cookie session
    // sempat di-set sebelum middleware ngecek session
    pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/)
  ) {
    return NextResponse.next();
  }

  // ── Admin routes ─────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      const token = request.cookies.get('admin_token')?.value;
      
      // ✅ FIX: Tambahkan await karena fungsinya sekarang async
      if (await isAdminTokenValid(token)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token')?.value;
    
    // ✅ FIX: Tambahkan await karena fungsinya sekarang async
    if (!await isAdminTokenValid(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // ── Public routes — skip Supabase check ──────────────────────────────────────
  if (publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.next();
  }

  // ── Protected routes — cek Supabase session ──────────────────────────────────
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const guestCookie = request.cookies.get('wc_guest_mode');
  const isGuest = guestCookie?.value === 'true';

  if (!session && !isGuest) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};