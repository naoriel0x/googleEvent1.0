import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Sign Out Route
 * POST /api/auth/signout
 * 
 * Logs out the current user and clears the session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error.message);
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Signed out successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Sign out exception:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
