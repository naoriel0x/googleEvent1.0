// lib/admin-auth.ts
import { cookies } from 'next/headers';

const ADMIN_SECRET = process.env.ADMIN_SECRET!;

/**
 * Validasi admin token dari cookie.
 * Dipanggil di setiap route handler /api/admin/* karena
 * middleware skip semua /api routes.
 */
export async function validateAdminRequest(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    return isAdminTokenValid(token);
  } catch {
    return false;
  }
}

/**
 * Validasi token string — bisa dipakai di middleware (sync)
 * maupun di server component.
 */
export function isAdminTokenValid(token: string | undefined): boolean {
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