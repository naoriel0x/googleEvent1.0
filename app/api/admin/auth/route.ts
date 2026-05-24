// app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

// POST /api/admin/auth → login
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    // Delay 1s biar ga bisa brute force cepet
    await new Promise(r => setTimeout(r, 1000));
    return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
  }

  // ✅ FIX: Buat token menggunakan HMAC Web Crypto API (Secure)
  const token = await signAdminToken(email);

  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 jam
    path: '/',
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/auth → logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: 'admin_token',
    path: '/',
  });
  return NextResponse.json({ ok: true });
}