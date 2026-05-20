import Link from 'next/link';
import { Shield, CheckCircle, FileText, Download, Users, Camera, AlertTriangle, Calendar, MapPin, Hash, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TimelineVisualizer } from '@/components/result/TimelineVisualizer';
import { getSupabaseAdmin } from '@/lib/supabase';

// Helper function to fetch data directly on the server
async function getSharedData(token: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('cases')
    .select('*')
    .eq('share_token', token)
    .gt('share_expired_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  // Filter sensitif
  return {
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
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const caseData = await getSharedData(params.token);

  if (!caseData) {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Link Tidak Valid atau Sudah Kedaluwarsa</h1>
          <p className="text-slate-600 mb-6">Link ini mungkin sudah expired atau tidak valid.</p>
          <Link href="/interview">
            <Button variant="primary" className="w-full">
              Buat Dokumentasi Baru
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const expiryDate = new Date(caseData.share_expired_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-500">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">WitnessChain</h1>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-4">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h2 className="font-bold text-emerald-900 mb-1 flex items-center gap-2">
                Dokumen Terverifikasi
              </h2>
              <p className="text-sm text-emerald-800 leading-relaxed mb-2">
                Dokumen ini dihasilkan oleh WitnessChain dan dilindungi integritas digitalnya.
              </p>
              <p className="text-xs text-emerald-700 font-semibold bg-emerald-100 inline-block px-2 py-1 rounded-md">
                Link aktif hingga {expiryDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        
        {/* Ringkasan Kasus */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Ringkasan Kasus
            </h3>
          </div>
          <div className="p-6">
            <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider border border-amber-200">
              {caseData.violation_type?.replace('_', ' ') || 'Belum Ditentukan'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Tanggal Kejadian
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {caseData.incident_date ? new Date(caseData.incident_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak Diketahui'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Lokasi Kejadian
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {caseData.incident_location || 'Tidak Diketahui'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Kelengkapan */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * caseData.completeness_score) / 100} className="text-emerald-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">
                {caseData.completeness_score}%
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Tingkat Kelengkapan</h3>
              <p className="text-sm text-slate-500">
                {caseData.completeness_score >= 70 ? 'Dokumen Lengkap' : 'Perlu Dilengkapi'}
              </p>
            </div>
          </div>
        </section>

        {/* Bukti & Saksi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                Bukti Terdokumentasi
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
                {caseData.evidence?.length || 0} File
              </span>
            </div>
            <div className="space-y-3">
              {caseData.evidence && caseData.evidence.length > 0 ? (
                caseData.evidence.map((ev: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-start gap-3">
                    <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                      {ev.type === 'photo' ? <Camera className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-0.5">{ev.type}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-slate-200/50 px-1.5 py-0.5 rounded">
                        <Hash className="w-3 h-3" />
                        <span className="truncate">{ev.hash ? ev.hash.substring(0, 16) + '...' : 'pending hash'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Belum ada bukti yang diunggah.</p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Saksi Tercatat
              </h3>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4 h-[calc(100%-2rem)]">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                <span className="text-xl font-bold text-emerald-600">{caseData.witnesses_count}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Saksi telah dicatat dalam dokumen resmi. Identitas disembunyikan untuk melindungi privasi.
              </p>
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-3">
          {caseData.document_url ? (
            <a href={caseData.document_url} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="primary" className="w-full font-bold gap-2">
                <Download className="w-5 h-5" /> Download PDF Resmi
              </Button>
            </a>
          ) : (
            <Button variant="primary" className="w-full font-bold gap-2" disabled>
              <Download className="w-5 h-5" /> PDF Belum Tersedia
            </Button>
          )}

          {caseData.allow_contact && (
            <Button variant="secondary" className="w-full font-bold gap-2 relative group overflow-hidden">
              <span className="relative z-10 group-hover:opacity-0 transition-opacity">Hubungi Pelapor via WitnessChain</span>
              <span className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">
                Segera Hadir
              </span>
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Disclaimer
          </h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Link ini memberikan akses ke ringkasan dokumen yang dibuat melalui WitnessChain. Untuk alasan keamanan, data sensitif telah disembunyikan. Dokumen ini dilindungi integritasnya dan dapat diverifikasi.
          </p>
        </section>

      </main>
    </div>
  );
}
