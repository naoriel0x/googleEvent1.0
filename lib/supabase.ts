import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Client-side Supabase (pakai @supabase/ssr agar cookie-based session) ──────
// WAJIB pakai createBrowserClient agar session tersync dengan middleware
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

export const supabaseClient = getSupabaseClient();

// ─── Server-side Supabase admin client ───────────────────────────────────────
// HANYA gunakan di API routes (app/api/...) — JANGAN import di komponen
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}