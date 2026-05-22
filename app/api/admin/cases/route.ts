// app/api/admin/cases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';

const ADMIN_SECRET = process.env.ADMIN_SECRET!;

// Helper: validasi admin cookie
async function isAdminAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 3) return false;

    const secret = parts[parts.length - 1];
    const timestamp = parseInt(parts[parts.length - 2]);

    // Cek secret cocok
    if (secret !== ADMIN_SECRET) return false;

    // Cek token belum expired (8 jam)
    const age = Date.now() - timestamp;
    if (age > 1000 * 60 * 60 * 8) return false;

    return true;
  } catch {
    return false;
  }
}

// GET /api/admin/cases → ambil semua kasus
export async function GET() {
  if (!(await isAdminAuthorized())) {
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
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id wajib diisi' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Hapus dokumen PDF dari storage kalau ada
  const { data: caseData } = await supabase
    .from('cases')
    .select('document_url')
    .eq('id', id)
    .single();

  if (caseData?.document_url && !caseData.document_url.startsWith('http')) {
    await supabase.storage.from('documents').remove([caseData.document_url]);
  }

  // Hapus row dari database
  const { error } = await supabase.from('cases').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: id });
}