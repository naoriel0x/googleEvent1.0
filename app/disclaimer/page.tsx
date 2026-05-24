'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertOctagon, Scale, UserX, BookOpen } from 'lucide-react'

export default function DisclaimerPage() {
  const router = useRouter()

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 relative">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-10 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        {/* Header */}
        <div className="mb-10">
          {/* Warning banner */}
          <div className="inline-flex items-center gap-2 bg-amber-950/30 border border-amber-800/40 rounded-full px-4 py-1.5 mb-4">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold tracking-wide uppercase">Penting untuk Dibaca</span>
          </div>
          <h1 className="font-black text-3xl md:text-4xl text-white mb-3">
            Disclaimer Hukum
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            Harap pahami batasan layanan WitnessChain sebelum menggunakannya untuk keperluan hukum Anda.
          </p>
          <p className="text-slate-500 text-sm mt-3">Terakhir diperbarui: 1 Januari 2025</p>
        </div>

        {/* Prominent warning box */}
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertOctagon className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-bold text-base mb-2">WitnessChain bukan firma hukum dan tidak memberikan nasihat hukum.</p>
              <p className="text-amber-200/60 text-sm leading-relaxed">
                Semua informasi yang dihasilkan oleh platform ini, termasuk analisis AI, dokumen yang dibuat, dan saran yang diberikan, bersifat informatif semata dan tidak dapat dianggap sebagai konsultasi hukum profesional.
              </p>
            </div>
          </div>
        </div>

        {/* Content card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">

          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <Scale className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">1. Bukan Firma Hukum</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                WitnessChain adalah perusahaan teknologi, bukan firma hukum atau lembaga konsultasi hukum. Platform kami tidak memiliki lisensi untuk memberikan representasi hukum, dan tidak ada hubungan klien-pengacara yang terbentuk antara Anda dan WitnessChain.
              </p>
              <p>
                Informasi hukum yang tersedia di platform ini disusun untuk keperluan edukasi umum dan tidak dimaksudkan sebagai pengganti konsultasi dengan pengacara berlisensi yang memahami situasi spesifik Anda.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <UserX className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">2. Tidak Memberikan Nasihat Hukum</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                Konten yang dihasilkan oleh fitur Legal Radar AI, template dokumen, dan panduan prosedural di WitnessChain:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-500">
                <li>Tidak mempertimbangkan fakta dan keadaan spesifik kasus Anda secara menyeluruh</li>
                <li>Tidak dapat menggantikan penilaian seorang pengacara yang terlatih dan berpengalaman</li>
                <li>Mungkin tidak mencerminkan perubahan hukum terbaru atau interpretasi yurisprudensi terkini</li>
                <li>Tidak menjamin keberhasilan dalam proses hukum apa pun</li>
              </ul>
              <p>
                Keputusan hukum yang signifikan selalu harus dikonsultasikan dengan pengacara atau lembaga bantuan hukum yang kompeten.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <Scale className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">3. Konsultasi dengan Pengacara Profesional</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                Kami sangat menyarankan Anda untuk selalu berkonsultasi dengan pengacara berlisensi atau lembaga bantuan hukum (LBH) resmi, terutama dalam situasi berikut:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-500">
                <li>Sebelum mengajukan gugatan atau laporan hukum resmi</li>
                <li>Ketika menghadapi tuduhan pidana atau perkara perdata yang kompleks</li>
                <li>Dalam sengketa yang melibatkan jumlah uang atau aset yang signifikan</li>
                <li>Ketika hak asasi manusia atau kebebasan pribadi Anda terancam</li>
                <li>Sebelum menandatangani kontrak atau perjanjian hukum apa pun</li>
              </ul>
              <p>
                Platform kami menyediakan fitur referral ke LBH terdekat untuk membantu Anda terhubung dengan bantuan hukum profesional yang mungkin gratis atau terjangkau.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 4 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">4. Batasan Penggunaan Dokumen</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                Dokumen yang dihasilkan oleh platform WitnessChain, termasuk Surat Pernyataan, Kronologi Kejadian, dan laporan dokumentasi lainnya:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-500">
                <li>Diberikan sebagai titik awal dokumentasi, bukan dokumen hukum final</li>
                <li>Harus ditinjau oleh pengacara sebelum digunakan dalam proses hukum resmi</li>
                <li>Validitas dan penerimaan sebagai alat bukti bergantung pada konteks hukum yang berlaku</li>
                <li>WitnessChain tidak bertanggung jawab atas konsekuensi penggunaan dokumen tanpa verifikasi profesional</li>
              </ul>
              <p>
                Timestamp dan hash kriptografis yang kami sediakan dapat membantu membuktikan keaslian dan waktu pembuatan dokumen, namun penerimaan sebagai bukti tetap berada di bawah diskresi pengadilan.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm">
              WitnessChain hadir untuk <span className="text-emerald-400 font-medium">memberdayakan</span>, bukan menggantikan, akses warga terhadap bantuan hukum profesional. Gunakan platform ini sebagai langkah pertama dalam perjalanan keadilan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}