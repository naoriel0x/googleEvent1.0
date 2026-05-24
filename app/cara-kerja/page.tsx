'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Bot, FileText, Radar, Map, LayoutDashboard, ArrowRight, Hash, Clock, UserX } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Bot,
    title: 'AI Interview dengan Gemini',
    badge: 'Inti Platform',
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40',
    description:
      'Chat interaktif berbasis Google Gemini 2.5 Flash yang memandu Anda menceritakan kejadian secara empatik dan terstruktur. Tidak perlu tahu hukum — cukup ceritakan apa yang terjadi.',
    details: [
      {
        label: 'Panduan pertanyaan adaptif',
        text: 'Gemini mengajukan pertanyaan lanjutan secara kontekstual — siapa pelaku, kapan terjadi, di mana lokasi, apa dampaknya — untuk memastikan tidak ada fakta penting yang terlewat.',
      },
      {
        label: 'Bahasa Indonesia alami',
        text: 'Tulis dalam bahasa sehari-hari atau bahasa daerah. AI mengubahnya menjadi narasi dokumentasi yang terstruktur dan sesuai standar pelaporan hukum.',
      },
      {
        label: 'Evidence Completeness Score',
        text: 'Sistem menghitung skor 0–100 secara real-time seiring Anda menjawab, menunjukkan seberapa kuat dokumentasi Anda dan apa yang masih perlu dilengkapi.',
      },
      {
        label: 'Gratis, tanpa login',
        text: 'Seluruh proses interview dapat diselesaikan dalam kurang dari 30 menit, tanpa perlu membuat akun terlebih dahulu.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'Generasi Dokumen PDF',
    badge: 'Output Siap Pakai',
    badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-900/40',
    description:
      'Platform menghasilkan dokumen PDF berformat hukum profesional lengkap dengan verifikasi integritas SHA-256 untuk setiap berkas bukti yang diunggah.',
    details: [
      {
        label: 'Dokumen yang dihasilkan',
        text: 'Kronologi Kejadian terstruktur, Pernyataan Korban, daftar bukti beserta hash-nya, dan ringkasan kasus — semua dalam satu PDF siap setor ke LBH atau instansi terkait.',
      },
      {
        label: 'Hash SHA-256 per bukti',
        text: 'Setiap foto, video, atau dokumen yang diunggah mendapat sidik jari digital SHA-256 unik yang tercatat dalam PDF, membuktikan berkas tidak pernah dimanipulasi sejak saat unggah.',
      },
      {
        label: 'Tanda tangan digital',
        text: 'PDF ditandatangani secara digital untuk memastikan keaslian dokumen yang dihasilkan oleh platform.',
      },
      {
        label: 'Unduh langsung',
        text: 'Dokumen dapat diunduh dari halaman result/[id] kapan saja selama sesi masih aktif.',
      },
    ],
  },
  {
    icon: Radar,
    title: 'Legal Radar AI',
    badge: 'Analisis Hukum',
    badgeColor: 'text-violet-400 bg-violet-950/40 border-violet-900/40',
    description:
      'Analisis berbasis Gemini yang mengidentifikasi pasal-pasal hukum Indonesia yang berpotensi dilanggar berdasarkan fakta kasus Anda, beserta rekomendasi langkah hukum yang dapat diambil.',
    details: [
      {
        label: 'Identifikasi pasal relevan',
        text: 'Menelusuri KUHP, KUHAP, UU HAM, UU Ketenagakerjaan, UU Pengadaan Tanah, dan peraturan terkait lainnya untuk menemukan pasal yang sesuai dengan fakta kasus.',
      },
      {
        label: 'Rekomendasi langkah hukum',
        text: 'Panduan tindakan konkret: lapor ke instansi mana (Komnas HAM, Ombudsman, Polisi, PTUN), dokumen apa yang dibutuhkan, dan tenggat waktu yang perlu diperhatikan.',
      },
      {
        label: 'Peringatan risiko prosedural',
        text: 'Mendeteksi potensi jebakan prosedural dan hal-hal yang bisa memperlemah kasus jika diabaikan.',
      },
      {
        label: 'Bukan nasihat hukum',
        text: 'Output Legal Radar bersifat informatif dan edukatif. Untuk keputusan hukum final, tetap konsultasikan dengan pengacara atau LBH.',
      },
    ],
  },
  {
    icon: Map,
    title: 'Peta Referral LBH',
    badge: 'Direktori',
    badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-900/40',
    description:
      'Peta interaktif berbasis Google Maps yang menampilkan 19 Lembaga Bantuan Hukum (LBH) terverifikasi di seluruh Indonesia, lengkap dengan filter spesialisasi dan informasi kontak.',
    details: [
      {
        label: '19 LBH terverifikasi',
        text: 'Database mencakup LBH dari Sabang sampai Merauke — YLBHI, LBH Jakarta, LBH Apik, Kontras, dan organisasi bantuan hukum lainnya yang aktif menangani kasus hak warga.',
      },
      {
        label: 'Filter spesialisasi',
        text: 'Saring LBH berdasarkan fokus kasus: sengketa tanah, kekerasan aparat, HAM, ketenagakerjaan, perempuan dan anak, lingkungan hidup, dan lainnya.',
      },
      {
        label: 'Google Maps Embed',
        text: 'Visualisasi lokasi LBH pada peta interaktif dengan kalkulasi jarak dari posisi Anda untuk memudahkan pemilihan LBH terdekat.',
      },
      {
        label: 'Informasi lengkap',
        text: 'Alamat, nomor telepon, email, jam operasional, dan spesialisasi kasus tersedia untuk setiap LBH.',
      },
    ],
  },
  {
    icon: LayoutDashboard,
    title: 'Admin Dashboard',
    badge: 'Manajemen',
    badgeColor: 'text-slate-300 bg-slate-800/60 border-slate-700/60',
    description:
      'Dashboard pengelolaan kasus lengkap dengan tampilan statistik, seleksi massal, dan penghapusan massal untuk memudahkan administrasi platform.',
    details: [
      {
        label: 'Statistik overview',
        text: 'Ringkasan jumlah kasus masuk, distribusi jenis pelanggaran, rata-rata completeness score, dan tren dokumentasi per periode.',
      },
      {
        label: 'Bulk selection & deletion',
        text: 'Pilih dan hapus banyak kasus sekaligus untuk menjaga kebersihan database dan memenuhi permintaan penghapusan data.',
      },
      {
        label: 'Manajemen kasus individual',
        text: 'Lihat detail lengkap setiap kasus termasuk transkrip interview, berkas bukti, skor kelengkapan, dan dokumen yang dihasilkan.',
      },
    ],
  },
]

export default function FiturPage() {
  const router = useRouter()

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 relative">
      <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-10 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="mb-10">
          <h1 className="font-black text-3xl md:text-4xl text-white mb-3">
            Fitur Platform
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            WitnessChain menyediakan lima fitur utama yang bekerja bersama untuk mengubah pengalaman Anda menjadi dokumentasi hukum yang kuat — gratis, tanpa login, dalam kurang dari 30 menit.
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[
            { icon: Clock, text: '< 30 menit per kasus' },
            { icon: UserX, text: 'Tanpa login' },
            { icon: Hash, text: 'SHA-256 per bukti' },
            { icon: Map, text: '19 LBH di seluruh Indonesia' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="inline-flex items-center gap-2 bg-slate-900/60 border border-slate-800/60 rounded-full px-3 py-1.5">
              <Icon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 text-xs font-medium">{text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-5">
                  <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-900/30 flex-shrink-0">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-white font-extrabold text-xl">{feature.title}</h2>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${feature.badgeColor}`}>
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>

                <hr className="border-slate-800/60 my-5" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {feature.details.map((detail) => (
                    <div key={detail.label} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                      <p className="text-slate-300 font-semibold text-xs mb-1">{detail.label}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{detail.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-slate-200 font-semibold text-base">Ingin tahu cara kerja lengkapnya?</p>
            <p className="text-slate-500 text-sm">Lihat panduan step-by-step dari cerita hingga dokumen jadi.</p>
          </div>
          <Link
            href="/cara-kerja"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors flex-shrink-0"
          >
            Cara Kerja
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}