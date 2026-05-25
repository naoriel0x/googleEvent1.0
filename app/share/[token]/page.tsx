import Link from "next/link";
import {
  Shield,
  CheckCircle,
  FileText,
  Download,
  Users,
  Camera,
  AlertTriangle,
  Calendar,
  MapPin,
  Hash,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TimelineVisualizer } from "@/components/result/TimelineVisualizer";
import { getSupabaseAdmin } from "@/lib/supabase";

async function getSharedData(token: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("cases")
    .select("*")
    .eq("share_token", token)
    .gt("share_expired_at", new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  const caseRecord = data as any;

  // Generate signed URL kalau document_url bukan http
  let documentUrl = caseRecord.document_url;
  if (documentUrl && !documentUrl.startsWith('http')) {
    const { data: signedData } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUrl(documentUrl, 3600);
    if (signedData) documentUrl = signedData.signedUrl;
  }

  return {
    id: caseRecord.id,
    violation_type: caseRecord.violation_type,
    incident_date: caseRecord.incident_date,
    incident_location: caseRecord.incident_location,
    description: caseRecord.description,
    completeness_score: caseRecord.completeness_score,
    evidence: caseRecord.evidence?.map((e: any) => ({
      type: e.type,
      hash: e.hash,
      timestamp: e.timestamp,
    })),
    witnesses_count: caseRecord.witnesses?.length || 0,
    document_url: documentUrl,
    share_expired_at: caseRecord.share_expired_at,
    allow_contact: caseRecord.allow_contact,
    timeline_events: caseRecord.timeline_events,
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const caseData = await getSharedData(token);

  // --- STATE: INVALID / EXPIRED ---
  if (!caseData) {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
            Akses Tidak Valid
          </h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Tautan dokumen ini mungkin sudah kedaluwarsa atau tidak valid. Sistem kami membatasi waktu akses untuk melindungi privasi pelapor.
          </p>
          <Link href="/">
            <Button variant="primary" className="w-full py-6 text-base font-semibold shadow-lg shadow-emerald-500/20">
              Pelajari WitnessChain
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const expiryDate = new Date(caseData.share_expired_at).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    },
  );

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-500 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* HEADER & HERO SECTION (Kontras Gelap) */}
      <div className="bg-slate-900 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 backdrop-blur-sm border border-emerald-500/30">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              WitnessChain <span className="text-slate-500 font-normal text-lg">|</span> <span className="text-slate-300 font-medium text-lg">Secure Share</span>
            </h1>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                <ShieldCheck className="w-4 h-4" />
                Integritas Dokumen Terverifikasi
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                Dokumen Laporan Kejadian
              </h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Dokumen ini dicatat dan diamankan menggunakan teknologi WitnessChain. Data yang ditampilkan telah diverifikasi dan dilindungi dari manipulasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - 2 Column Layout pada Desktop */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20 -mt-6">
        
        {/* KOLOM KIRI (Konten Utama: 8 kolom) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Informasi Utama Kasus */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori Laporan</p>
                  <div className="inline-flex px-4 py-1.5 bg-slate-900 text-white text-sm font-bold rounded-lg capitalize tracking-wide shadow-sm">
                    {caseData.violation_type?.replace(/_/g, " ") || "Belum Ditentukan"}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Akses Berakhir</p>
                  <p className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" /> {expiryDate}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Tanggal Kejadian</p>
                    <p className="text-base font-bold text-slate-900">
                      {caseData.incident_date
                        ? new Date(caseData.incident_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                        : "Tidak Diketahui"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Lokasi Kejadian</p>
                    <p className="text-base font-bold text-slate-900 line-clamp-2">
                      {caseData.incident_location || "Tidak Diketahui"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deskripsi (Jika ada) */}
              {caseData.description && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-3">Deskripsi Kejadian</p>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">
                    {caseData.description}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 2. Timeline Kejadian (Hanya render jika data tersedia) */}
          {caseData.timeline_events && caseData.timeline_events.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Kronologi Kejadian
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-100">
                <TimelineVisualizer events={caseData.timeline_events} />
              </div>
            </section>
          )}

          {/* 3. Bukti Digital Terenkripsi */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                Bukti Terdokumentasi
              </h3>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold px-3 py-1 rounded-full">
                {caseData.evidence?.length || 0} File Dilampirkan
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {caseData.evidence && caseData.evidence.length > 0 ? (
                caseData.evidence.map((ev: any, idx: number) => (
                  <div key={idx} className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all duration-300 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-white border border-slate-200 group-hover:border-emerald-100 group-hover:bg-emerald-50 rounded-lg shadow-sm transition-colors">
                      {ev.type === "photo" ? (
                        <Camera className="w-6 h-6 text-slate-600 group-hover:text-emerald-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-slate-600 group-hover:text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                        Dokumen {ev.type}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono bg-slate-200/60 px-2 py-1 rounded-md border border-slate-300/50">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[150px] md:max-w-xs">
                            {ev.hash || "Menunggu pembuatan hash..."}
                          </span>
                        </div>
                        {ev.timestamp && (
                          <span className="text-[10px] text-slate-400 font-medium hidden md:inline-block">
                            {new Date(ev.timestamp).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Tidak ada bukti visual yang dilampirkan.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* KOLOM KANAN (Sidebar Aksi: 4 kolom) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card Download (Primary CTA) */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-900/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <h3 className="font-bold text-slate-900 mb-2">Akses Dokumen</h3>
            <p className="text-sm text-slate-500 mb-6">Unduh laporan lengkap dalam format PDF ber-watermark WitnessChain.</p>
            
            {caseData.document_url ? (
              <a href={caseData.document_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button variant="primary" className="w-full h-12 text-base font-bold shadow-md shadow-emerald-500/20 group">
                  <Download className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" /> 
                  Unduh PDF Resmi
                </Button>
              </a>
            ) : (
              <Button variant="primary" className="w-full h-12 text-base font-bold opacity-70 cursor-not-allowed" disabled>
                <Clock className="w-5 h-5 mr-2 animate-pulse" /> 
                PDF Sedang Diproses
              </Button>
            )}

            {caseData.allow_contact && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Button variant="secondary" className="w-full font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 relative group overflow-hidden">
                  <span className="relative z-10 group-hover:opacity-0 transition-opacity flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" /> Hubungi Pelapor
                  </span>
                  <span className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 bg-slate-100">
                    Fitur Segera Hadir
                  </span>
                </Button>
              </div>
            )}
          </div>

          {/* Card Kelengkapan */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Skor Kelengkapan
            </h3>
            <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
                  <circle
                    cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
                    strokeDasharray="175.9"
                    strokeDashoffset={175.9 - (175.9 * caseData.completeness_score) / 100}
                    className="text-emerald-500 drop-shadow-sm transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-slate-900">
                  {caseData.completeness_score}%
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {caseData.completeness_score >= 80 ? "Sangat Lengkap" : caseData.completeness_score >= 50 ? "Cukup Lengkap" : "Perlu Dilengkapi"}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Berdasarkan matriks standar verifikasi pelaporan.
                </p>
              </div>
            </div>
          </section>

          {/* Card Saksi */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Dukungan Saksi
              </h3>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                <span className="text-xl font-bold text-emerald-700">{caseData.witnesses_count}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Saksi terkait tercatat dalam hash dokumen. Identitas dilindungi oleh enkripsi platform.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-5">
            <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-amber-600" /> Disclaimer Keamanan
            </h3>
            <p className="text-xs text-amber-800/80 leading-relaxed">
              Tautan ini memberikan akses publik ke ringkasan dokumen. Data personal sensitif (PII) telah disensor. Bukti asli diamankan di sistem terdesentralisasi WitnessChain.
            </p>
          </div>
          
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 mt-12 mb-8 text-center">
        <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
          Dilindungi oleh <Shield className="w-4 h-4 text-emerald-500" /> <span className="font-semibold text-slate-600">WitnessChain Protocol</span>
        </p>
      </footer>

    </div>
  );
}