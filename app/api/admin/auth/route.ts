// app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const ADMIN_SECRET = process.env.ADMIN_SECRET!; // random string buat sign cookie

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

  // Buat token sederhana: base64(email:timestamp:secret)
  const payload = Buffer.from(`${email}:${Date.now()}:${ADMIN_SECRET}`).toString('base64');

  const cookieStore = await cookies();
  cookieStore.set('admin_token', payload, {
    httpOnly: true,       // tidak bisa dibaca JS client
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 jam
    path: '/admin',
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/auth → logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: 'admin_token', path: '/admin' });
  return NextResponse.json({ ok: true });
}