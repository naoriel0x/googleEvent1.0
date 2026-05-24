import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Client-side singleton ────────────────────────────────────────────────────
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

export const supabaseClient = getSupabaseClient();

// ─── Server-side admin singleton ──────────────────────────────────────────────
let adminInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!adminInstance) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    adminInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return adminInstance;
}