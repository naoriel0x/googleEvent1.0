'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CompletenessDisplay } from '@/components/result/CompletenessDisplay';
import { EvidenceTimeline } from '@/components/result/EvidenceTimeline';
import { TimelineVisualizer } from '@/components/result/TimelineVisualizer';
import { useParams } from 'next/navigation';
import type { Case } from '@/types';
import { supabaseClient } from '@/lib/supabase';
import {
  Shield,
  ShieldAlert,
  User,
  Download,
  Check,
  ArrowRight,
  Pencil,
  AlertTriangle,
  FileCheck2,
  Calendar,
  MapPin,
  FileText,
  Users,
  Lock,
  Clock
} from 'lucide-react';

export default function ResultPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [allowContact, setAllowContact] = useState(false);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!caseId) return;
    const loadCase = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const token = session?.access_token;
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/cases?case_id=${caseId}`, { headers });
        const data = await response.json();
        if (data && data.id) {
          setCaseData(data);
          if (data.document_url) {
            setDocumentUrl(data.document_url);
          }
        }
      } catch (error) {
        console.error('Load case error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [caseId]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Check if document already exists and the case status is completed
      if (documentUrl && caseData?.status === 'completed') {
        window.open(documentUrl, '_blank');
        return;
      }

      // Generate new PDF (lock case state to completed)
      const { data: { session } } = await supabaseClient.auth.getSession();
      const token = session?.access_token;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/document', {
        method: 'POST',
        headers,
        body: JSON.stringify({ case_id: caseId }),
      });

      const data = await response.json();
      if (data.url) {
        setDocumentUrl(data.url);
        // Refresh case data to display locked status
        const refreshedResponse = await fetch(`/api/cases?case_id=${caseId}`, { headers });
        const refreshedData = await refreshedResponse.json();
        if (refreshedData && refreshedData.id) {
          setCaseData(refreshedData);
        }
        window.open(data.url, '_blank');
      } else {
        alert(data.error || 'Gagal generate dokumen');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Gagal mengunduh dokumen');
    } finally {
      setDownloading(false);
    }
  };
  const handleGenerateShare = async () => {
    setShareLoading(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, allow_contact: allowContact })
      });
      const data = await response.json();
      if (data.share_url) {
        setShareUrl(data.share_url);
      } else {
        alert(data.error || 'Gagal membuat link berbagia');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Gagal membuat link berbagia');
    } finally {
      setShareLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenShare = () => setShowShareModal(true);
    window.addEventListener('open-share-modal', handleOpenShare);
    return () => window.removeEventListener('open-share-modal', handleOpenShare);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Kasus tidak ditemukan</p>
          <Link href="/interview">
            <Button variant="primary">Kembali ke Interview</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">


      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-slate-900 mb-2">
            Hasil Dokumentasi Kasusmu
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Nomor Kasus: <span className="font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs">{caseData.id}</span>
          </p>
        </div>

        {/* Completeness Display */}
        <div className="mb-12">
          <CompletenessDisplay score={caseData.completeness_score} />
        </div>

        {/* Case Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Case Info */}
            <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-emerald-600" />
                Detail Kejadian
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Nama Pelapor
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {caseData.reporter_name || 'Belum diisi'}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    Jenis Pelanggaran
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {caseData.violation_type?.replace(/_/g, ' ').toUpperCase() || 'Belum ditentukan'}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Tanggal Kejadian
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {caseData.incident_date
                      ? new Date(caseData.incident_date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                      : 'Belum ditentukan'}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner md:col-span-2">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Lokasi Kejadian
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {caseData.incident_location || 'Belum ditentukan'}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Pihak Terlibat / Pelaku
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {caseData.involved_parties || 'Belum diisi'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Kronologi / Deskripsi Kejadian</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  {caseData.description || 'Belum ada deskripsi'}
                </p>
              </div>
            </section>

            {/* Timeline */}
            <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-emerald-600" />
                Kronologi Kejadian
              </h2>
              <TimelineVisualizer events={caseData.timeline_events || []} />
            </section>

            {/* Witnesses */}
            <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-600" />
                Daftar Saksi
              </h2>
              {caseData.witnesses && caseData.witnesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseData.witnesses.map((witness, index) => (
                    <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                          <Users className="w-4 h-4" />
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{witness.name}</p>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Hubungan: <strong className="text-slate-700">{witness.relationship}</strong>
                      </p>
                      {witness.contact && (
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Kontak: <strong className="text-slate-700">{witness.contact}</strong>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium bg-slate-50 p-5 rounded-xl text-center border border-slate-100">Belum ada saksi yang dicatat</p>
              )}
            </section>

            {/* Evidence */}
            <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileCheck2 className="w-6 h-6 text-emerald-600" />
                Bukti yang Diunggah
              </h2>
              {caseData.evidence && caseData.evidence.length > 0 ? (
                <EvidenceTimeline evidence={caseData.evidence} />
              ) : (
                <p className="text-sm text-slate-400 font-medium bg-slate-50 p-5 rounded-xl text-center border border-slate-100">Belum ada bukti yang diunggah</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Download PDF / Lock Status */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {caseData.status === 'completed' ? (
                  <Lock className="w-5 h-5 text-emerald-600 animate-pulse" />
                ) : (
                  <Download className="w-5 h-5 text-emerald-600" />
                )}
                {caseData.status === 'completed' ? 'Dokumen Terkunci' : 'Unduh Dokumen'}
              </h3>

              <Button
                variant="primary"
                className="w-full font-bold gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 border-0 text-white"
                onClick={handleDownloadPDF}
                loading={downloading}
              >
                {caseData.status === 'completed' ? (
                  <>
                    <Lock className="w-4 h-4" /> Unduh Ulang PDF Resmi
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Simpan Permanen & Unduh PDF
                  </>
                )}
              </Button>

              {caseData.status === 'completed' && (
                <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-emerald-800 font-bold">
                  <span>🔒 Terkunci & Aman</span>
                </div>
              )}

              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                {caseData.status === 'completed'
                  ? 'Berkas ini telah dikunci untuk menjaga integritas data hukum. Perubahan di masa depan tidak diizinkan.'
                  : 'Dokumen ini akan otomatis dikunci menjadi berkas hukum resmi ketika diunduh pertama kali.'}
              </p>
            </div>

            {/* Guest Alert Box */}
            {!user && caseData.status === 'draft' && (
              <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3 animate-fadeIn">
                <h4 className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                  Peringatan Pengguna Tamu
                </h4>
                <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                  Anda sedang mengakses sebagai tamu. Daftarkan akun WitnessChain gratis terlebih dahulu agar kasus ini tersimpan permanen di dashboard Anda dan bisa diunduh kembali kapan saja.
                </p>
                <Link href={`/login?redirect=/result/${caseId}`} className="block">
                  <Button variant="secondary" className="w-full text-xs font-bold bg-white hover:bg-slate-50 border border-amber-300 text-amber-800 py-2">
                    Daftar / Masuk Sekarang
                  </Button>
                </Link>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                Langkah Berikutnya
              </h3>
              <ul className="space-y-3.5 text-xs text-emerald-900 font-semibold">
                <li className="flex gap-2.5 items-center">
                  <div className="p-1 bg-emerald-100 rounded text-emerald-700">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Unduh dokumen hasil WitnessChain.</span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <div className="p-1 bg-emerald-100 rounded text-emerald-700">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Gunakan modul LBH untuk mencari bantuan terdekat.</span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <div className="p-1 bg-emerald-100 rounded text-emerald-700">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Serahkan salinan dokumen beserta bukti asli ke LBH.</span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <div className="p-1 bg-emerald-100 rounded text-emerald-700">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Konsultasikan strategi hukum bersama pengacara.</span>
                </li>
              </ul>
            </div>

            {/* Find LBH */}
            <Link href="/referral" className="block">
              <Button variant="secondary" className="w-full font-bold gap-2">
                🏢 Cari LBH Terdekat
              </Button>
            </Link>

            {/* Legal Radar */}
            <Link href="/legal-radar" className="block">
              <Button variant="secondary" className="w-full font-bold gap-2">
                ⚖️ Analisis Hukum AI
              </Button>
            </Link>

            {/* Share */}
            <Button
              variant="secondary"
              className="w-full font-bold gap-2"
              onClick={() => setShowShareModal(true)}
            >
              🔗 Bagikan ke Pengacara/Jurnalis
            </Button>
            {/* Continue Interview or Locked Indicator */}
            {caseData.status === 'completed' ? (
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold cursor-not-allowed text-center">
                🔒 Kasus Terkunci & Aman (Edit Dinonaktifkan)
              </div>
            ) : (
              <Link href={`/interview?case=${caseId}`} className="block">
                <Button variant="ghost" className="w-full font-bold gap-2">
                  <Pencil className="w-4 h-4" /> Lanjut Lengkapi Data
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-8 mb-8">
          <h3 className="font-bold text-amber-900 mb-3">⚠️ Penting - Disclaimer</h3>
          <p className="text-sm text-amber-900 leading-relaxed">
            Dokumen ini adalah hasil dokumentasi dari platform WitnessChain dan dapat digunakan sebagai bukti pendukung di pengadilan atau lembaga hak asasi manusia. Namun, dokumen ini <strong>bukan merupakan pengganti dari konsultasi hukum profesional</strong>. Untuk kasus-kasus serius, sangat disarankan untuk menghubungi Lembaga Bantuan Hukum (LBH) atau advokat yang berpengalaman. WitnessChain tidak bertanggung jawab atas akurasi atau konsekuensi hukum dari informasi yang terdapat dalam dokumen ini.
          </p>
        </section>

        {/* Emergency Contacts */}
        <section className="bg-white rounded-lg border border-slate-200 p-8">
          <h3 className="font-bold text-slate-900 mb-4">Kontak Darurat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Komnas HAM</p>
              <p className="font-mono font-bold text-lg">119 ext 6</p>
            </div>
            <div>
              <p className="text-slate-600">Polres</p>
              <p className="font-mono font-bold text-lg">110</p>
            </div>
          </div>
        </section>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="max-w-md mx-auto mt-20 bg-white rounded-2xl p-6 shadow-2xl relative animate-slideIn">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Bagikan Dokumen</h2>
            <p className="text-sm text-slate-600 mb-6">
              Buat link yang bisa dibagikan selama 30 hari. Penerima hanya bisa melihat ringkasan (tanpa data pribadi).
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Siapapun dengan link ini bisa melihat ringkasan kasusmu. Pastikan Anda hanya membagikannya kepada pihak terpercaya.
              </p>
            </div>

            <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <input 
                type="checkbox" 
                id="allow-contact" 
                checked={allowContact}
                onChange={(e) => setAllowContact(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="allow-contact" className="text-sm text-slate-700 font-semibold cursor-pointer">
                Izinkan penerima menghubungi saya via platform
              </label>
            </div>

            {shareUrl ? (
              <div className="space-y-4">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-600"
                />
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link berhasil disalin!');
                  }}
                >
                  Salin Link
                </Button>
                <p className="text-xs text-center text-slate-500 font-medium">Link aktif hingga 30 hari ke depan</p>
              </div>
            ) : (
              <Button 
                variant="primary" 
                className="w-full"
                onClick={handleGenerateShare}
                disabled={shareLoading}
              >
                {shareLoading ? 'Membuat Link...' : 'Buat Link'}
              </Button>
            )}

            <button 
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 p-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
