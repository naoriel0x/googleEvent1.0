// app/api/cases/route.ts
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Case } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminRequest } from '@/lib/admin-auth'; // ✅ FIX: Import fungsi validasi admin

export async function POST(request: NextRequest): Promise<NextResponse<Case | { error: string }>> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { id, session_id, ...caseData } = body as Case;

    if (id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return NextResponse.json(
          { error: 'Invalid id format' },
          { status: 400 }
        );
      }
    }

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // 1. Get user from auth token if present
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (!authError && authUser) {
          userId = authUser.id;
        }
      } catch (e) {
        console.error('Auth verification error:', e);
      }
    }

    // 2. Prevent updates if case is already completed (🔒 Locked)
    if (id) {
      const { data: existingCase } = await supabaseAdmin
        .from('cases')
        .select('status, user_id')
        .eq('id', id)
        .single();

      if (existingCase && existingCase.status === 'completed') {
        return NextResponse.json(
          { error: 'Kasus ini telah dikunci secara permanen dan tidak dapat diubah.' },
          { status: 403 }
        );
      }
    }

    // Prepare payload
    const upsertData: Record<string, unknown> = {
      id: id || undefined,
      session_id,
      ...caseData,
      updated_at: new Date().toISOString(),
    };
    if (userId) {
      upsertData['user_id'] = userId;
    }

    // Upsert case
    const { data, error } = await supabaseAdmin
      .from('cases')
      .upsert(upsertData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to save case: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Cases POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan kasus' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<Case[] | Case | { error: string }>> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const caseId = searchParams.get('case_id');

    // Get user from auth token if present
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
        if (authUser) {
          userId = authUser.id;
        }
      } catch (e) {
        console.error('Auth verification error in GET:', e);
      }
    }

    // 1. Fetch case by ID
    if (caseId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(caseId)) {
        return NextResponse.json(
          { error: 'Invalid case_id format' },
          { status: 400 }
        );
      }

      // Get specific case by ID
      const { data, error } = await supabaseAdmin
        .from('cases')
        .select()
        .eq('id', caseId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Case not found' },
          { status: 404 }
        );
      }

      // Generate signed URL dynamically if document_url is a private path
      if (data && data.document_url && !data.document_url.startsWith('http')) {
        const { data: signedData } = await supabaseAdmin.storage
          .from('documents')
          .createSignedUrl(data.document_url, 3600);
        if (signedData) {
          data.document_url = signedData.signedUrl;
        }
      }

      return NextResponse.json(data);
    }

    // 2. Fetch user cases for Dashboard (when bearer auth is provided and no specific sessionId or caseId is specified)
    if (userId && !sessionId) {
      const { data, error } = await supabaseAdmin
        .from('cases')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch user cases' },
          { status: 500 }
        );
      }

      // Generate signed URLs dynamically for any cases that have private document paths
      const updatedData = await Promise.all((data || []).map(async (item: Case) => {
        if (item.document_url && !item.document_url.startsWith('http')) {
          const { data: signedData } = await supabaseAdmin.storage
            .from('documents')
            .createSignedUrl(item.document_url, 3600);
          if (signedData) {
            item.document_url = signedData.signedUrl;
          }
        }
        return item;
      }));

      return NextResponse.json(updatedData);
    }

    // 3. Fetch case by session ID
    if (sessionId) {
      // Get case by session ID
      const { data, error } = await supabaseAdmin
        .from('cases')
        .select()
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch case' },
          { status: 500 }
        );
      }

      // Return empty case jika tidak ada
      if (!data) {
        return NextResponse.json({
          id: '',
          session_id: sessionId,
          status: 'draft',
          description: '',
          witnesses: [],
          evidence: [],
          messages: [],
          completeness_score: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Case);
      }

      // Generate signed URL dynamically if document_url is a private path
      if (data && data.document_url && !data.document_url.startsWith('http')) {
        const { data: signedData } = await supabaseAdmin.storage
          .from('documents')
          .createSignedUrl(data.document_url, 3600);
        if (signedData) {
          data.document_url = signedData.signedUrl;
        }
      }

      return NextResponse.json(data);
    }

    // 4. Fallback: Get all cases (for admin)
    // ✅ FIX: Cek token admin sebelum ngasih seluruh data
    const isAdmin = await validateAdminRequest();
    
    if (isAdmin) {
      const { data, error } = await supabaseAdmin
        .from('cases')
        .select()
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch all cases' },
          { status: 500 }
        );
      }

      // Generate signed URLs dynamically (sama seperti section 2)
      const updatedData = await Promise.all((data || []).map(async (item: Case) => {
        if (item.document_url && !item.document_url.startsWith('http')) {
          const { data: signedData } = await supabaseAdmin.storage
            .from('documents')
            .createSignedUrl(item.document_url, 3600);
          if (signedData) {
            item.document_url = signedData.signedUrl;
          }
        }
        return item;
      }));

      return NextResponse.json(updatedData);
    }

    // ✅ FIX: Jika bukan admin, tolak request untuk mencegah Information Disclosure
    return NextResponse.json(
      { error: 'Unauthorized Access' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Cases GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data kasus' },
      { status: 500 }
    );
  }
}