import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ADMIN_SECRET = process.env.ADMIN_SECRET!;

// Public routes yang tidak perlu auth Supabase
const publicRoutes = ['/', '/login', '/share'];

// ─── Validasi admin cookie ────────────────────────────────────────────────────
function isAdminTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 3) return false;
    const secret = parts[parts.length - 1];
    const timestamp = parseInt(parts[parts.length - 2]);
    if (secret !== ADMIN_SECRET) return false;
    const age = Date.now() - timestamp;
    if (age > 1000 * 60 * 60 * 8) return false; // 8 jam
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/)
  ) {
    return NextResponse.next();
  }

  // ── Admin routes ─────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Login page admin — boleh diakses tanpa cookie
    if (pathname === '/admin/login') {
      // Kalau sudah punya cookie valid, langsung ke admin
      const token = request.cookies.get('admin_token')?.value;
      if (isAdminTokenValid(token)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Semua route /admin lainnya → wajib cookie valid
    const token = request.cookies.get('admin_token')?.value;
    if (!isAdminTokenValid(token)) {
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
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)', ],
};