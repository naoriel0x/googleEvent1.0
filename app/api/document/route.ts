import { generateCasePDF } from '@/lib/pdf';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Case } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse<{ url: string } | { error: string }>> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { case_id } = body;

    if (!case_id) {
      return NextResponse.json(
        { error: 'case_id is required' },
        { status: 400 }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(case_id)) {
      return NextResponse.json(
        { error: 'Invalid case_id format' },
        { status: 400 }
      );
    }

    // Get user from auth token if present
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
        console.error('Auth verification error in document API:', e);
      }
    }

    // Ambil data case dari Supabase
    const { data: caseData, error: fetchError } = await supabaseAdmin
      .from('cases')
      .select()
      .eq('id', case_id)
      .single();

    if (fetchError || !caseData) {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateCasePDF(caseData as Case);

    // Upload ke Supabase Storage
    const fileName = `case-${case_id}-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload PDF: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Dapatkan signed URL yang aman (valid selama 1 jam / 3600 detik)
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUrl(uploadData.path, 3600);

    if (signError || !signedData) {
      console.error('Sign URL error:', signError);
      return NextResponse.json(
        { error: 'Gagal membuat tautan aman untuk dokumen' },
        { status: 500 }
      );
    }

    const secureUrl = signedData.signedUrl;

    // Update case dengan document_url & completed status
    const updatePayload: Record<string, string> = {
      document_url: uploadData.path,
      status: 'completed',
      updated_at: new Date().toISOString(),
    };
    if (userId) {
      updatePayload.user_id = userId;
    }

    const { error: updateError } = await supabaseAdmin
      .from('cases')
      .update(updatePayload)
      .eq('id', case_id);

    if (updateError) {
      console.error('Update error:', updateError);
      // Tetap return URL meski update gagal
      return NextResponse.json({ url: secureUrl });
    }

    return NextResponse.json({ url: secureUrl });
  } catch (error) {
    console.error('Document API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan saat generate dokumen' },
      { status: 500 }
    );
  }
}
