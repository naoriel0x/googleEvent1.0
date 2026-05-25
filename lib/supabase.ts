import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing env vars: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum di-set'
  );
}

// ─── Client-side singleton ────────────────────────────────────────────────────
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }
  return clientInstance;
}

// DIHAPUS: export const supabaseClient = getSupabaseClient();
// Alasan: jalan saat module di-load, crash di server-side (window undefined)

// ─── Server-side admin singleton ──────────────────────────────────────────────
let adminInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() hanya boleh dipanggil di server-side');
  }

  if (!adminInstance) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY belum di-set');
    }
    adminInstance = createClient(supabaseUrl!, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return adminInstance;
}