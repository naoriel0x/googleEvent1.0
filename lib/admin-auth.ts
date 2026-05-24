// lib/admin-auth.ts
import { cookies } from 'next/headers';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'fallback_secret_ganti_di_env';
const encoder = new TextEncoder();

// ─── HELPER WEB CRYPTO API (EDGE COMPATIBLE) ──────────────────────────────────

async function getSecretKey() {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(ADMIN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(data: ArrayBuffer | Uint8Array) {
  // Jika sudah Uint8Array pakai langsung, jika ArrayBuffer convert dulu
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64Url(base64Url: string) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── CORE FUNCTIONS ────────────────────────────────────────────────────────

/**
 * Buat Signed Token (Payload + Signature)
 * Dipakai di app/api/admin/auth/route.ts saat login
 */
export async function signAdminToken(email: string): Promise<string> {
  const key = await getSecretKey();
  const payload = JSON.stringify({ email, exp: Date.now() + 8 * 60 * 60 * 1000 }); // 8 jam
  const payloadBase64 = toBase64Url(encoder.encode(payload));
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadBase64));
  const signatureBase64 = toBase64Url(signatureBuffer);
  
  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Validasi token string — bisa dipakai di middleware maupun server component.
 * SEKARANG ASYNC karena menggunakan kriptografi asli.
 */
export async function isAdminTokenValid(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  
  const [payloadBase64, signatureBase64] = token.split('.');
  
  try {
    const key = await getSecretKey();
    const signatureBuffer = fromBase64Url(signatureBase64);
    
    // Verifikasi Signature
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(payloadBase64)
    );
    
    if (!isValid) return false;

    // Verifikasi Waktu Expired
    const payloadStr = new TextDecoder().decode(fromBase64Url(payloadBase64));
    const payload = JSON.parse(payloadStr);
    
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    // Kalau gagal decode atau struktur rusak, tolak tokennya
    return false;
  }
}

/**
 * Validasi admin token dari cookie.
 * Dipanggil di setiap route handler /api/admin/*
 */
export async function validateAdminRequest(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    
    // ✅ FIX: Tambahkan await karena isAdminTokenValid sekarang mengembalikan Promise
    return await isAdminTokenValid(token);
  } catch {
    return false;
  }
}