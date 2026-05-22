import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Get User Session Route
 * GET /api/auth/session
 * 
 * Returns the current user's session and profile information
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.admin.getUserById(token);

    if (error || !user) {
      console.error('Get session error:', error?.message);
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          avatar: user.user_metadata?.avatar_url,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Get session exception:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
