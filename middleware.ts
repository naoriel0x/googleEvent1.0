import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Public routes yang tidak perlu auth
const publicRoutes = ['/', '/login', '/share'];

// ✅ FIX 1: Mengubah nama fungsi dari 'proxy' menjadi 'middleware'
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip untuk static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/)
  ) {
    return NextResponse.next();
  }

  // ✅ FIX 1: Pengecekan status Guest Mode dari Cookie
  const isGuestMode = request.cookies.get('wc_guest_mode')?.value === 'true';

  // Jika user dalam mode tamu dan mengakses rute privat, langsung izinkan (bypass)
  if (isGuestMode && !publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Public routes tidak perlu auth tambahan
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Buat response object menggunakan NextResponse.next() agar request berlanjut ke page
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Refresh session jika ada
  const { data: { session } } = await supabase.auth.getSession();

  // Proteksi rute privat jika tidak ada session
  if (!session) {
    // Jika tidak ada session dan mencoba akses halaman privat, tendang ke /login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
};