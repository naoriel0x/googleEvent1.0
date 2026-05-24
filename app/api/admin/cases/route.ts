// app/api/admin/cases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { validateAdminRequest } from '@/lib/admin-auth';
import type { Case } from '@/types';

// Paksa dynamic — jangan di-prerender saat build
export const dynamic = 'force-dynamic';

// GET /api/admin/cases → ambil semua kasus
export async function GET() {
  if (!(await validateAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('cases')
    .select()
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// DELETE /api/admin/cases?id=xxx → hapus kasus by id
export async function DELETE(req: NextRequest) {
  if (!(await validateAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id wajib diisi' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: caseData } = await supabase
    .from('cases')
    .select('document_url')
    .eq('id', id)
    .single() as { data: { document_url: string | null } | null; error: unknown };

  if (caseData?.document_url && !caseData.document_url.startsWith('http')) {
    await supabase.storage.from('documents').remove([caseData.document_url]);
  }

  const { error } = await supabase.from('cases').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: id });
}