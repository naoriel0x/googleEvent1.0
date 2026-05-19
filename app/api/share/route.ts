import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { case_id, allow_contact } = await req.json();

    if (!case_id) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    // Check if case exists
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .select('id, status')
      .eq('id', case_id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Generate token
    const token = crypto.randomUUID() + '-' + Date.now().toString(36);
    const expired_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Update case
    const { error: updateError } = await supabaseAdmin
      .from('cases')
      .update({
        share_token: token,
        share_expired_at: expired_at,
        is_shareable: true,
        allow_contact: allow_contact || false,
      })
      .eq('id', case_id);

    if (updateError) {
      console.error('Update share error:', updateError);
      return NextResponse.json({ error: 'Gagal membuat link berbagia' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const share_url = `${appUrl}/share/${token}`;

    return NextResponse.json({ share_url, token, expired_at });
  } catch (error) {
    console.error('Share POST error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('cases')
      .select('*')
      .eq('share_token', token)
      .gt('share_expired_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Token tidak valid atau sudah expired' }, { status: 404 });
    }

    // Filter sensitif
    const safeData = {
      id: data.id,
      violation_type: data.violation_type,
      incident_date: data.incident_date,
      incident_location: data.incident_location,
      description: data.description,
      completeness_score: data.completeness_score,
      evidence: data.evidence?.map((e: any) => ({ type: e.type, hash: e.hash, timestamp: e.timestamp })),
      witnesses_count: data.witnesses?.length || 0,
      document_url: data.document_url,
      share_expired_at: data.share_expired_at,
      allow_contact: data.allow_contact,
      timeline_events: data.timeline_events,
    };

    return NextResponse.json(safeData);
  } catch (error) {
    console.error('Share GET error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
