'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Shield, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react'

export default function TermsPage() {
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
          <h1 className="font-black text-3xl md:text-4xl text-white mb-3">
            Syarat Penggunaan
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            Harap baca ketentuan berikut sebelum menggunakan platform WitnessChain. Dengan mengakses layanan kami, Anda menyetujui syarat-syarat ini.
          </p>
          <p className="text-slate-500 text-sm mt-3">Terakhir diperbarui: 1 Januari 2025</p>
        </div>

        {/* Content card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 space-y-0">

          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">1. Ketentuan Penggunaan Platform</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                WitnessChain adalah platform dokumentasi hak warga Indonesia yang dirancang untuk membantu individu mendokumentasikan peristiwa, mengumpulkan bukti, dan mengakses informasi hukum dasar.
              </p>
              <p>
                Pengguna berusia minimal 17 tahun atau dengan persetujuan wali yang sah untuk menggunakan layanan ini. Dengan mendaftar, Anda menyatakan bahwa informasi yang diberikan adalah akurat, lengkap, dan terkini.
              </p>
              <p>
                Platform ini dilarang digunakan untuk tujuan ilegal, menyebarkan informasi palsu, melecehkan pengguna lain, atau kegiatan apa pun yang bertentangan dengan hukum yang berlaku di Indonesia.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">2. Batasan Tanggung Jawab</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                WitnessChain menyediakan layanan secara "sebagaimana adanya" (<em>as-is</em>) tanpa jaminan apa pun, baik tersurat maupun tersirat. Kami tidak bertanggung jawab atas:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500">
                <li>Kerugian yang timbul akibat penggunaan atau ketidakmampuan menggunakan layanan</li>
                <li>Keakuratan atau kelengkapan informasi hukum yang disediakan oleh AI</li>
                <li>Kehilangan data akibat kegagalan sistem yang berada di luar kendali kami</li>
                <li>Tindakan pihak ketiga yang berinteraksi dengan konten yang Anda unggah</li>
              </ul>
              <p>
                Total tanggung jawab kami kepada Anda tidak akan melebihi jumlah yang Anda bayarkan kepada kami dalam 12 bulan terakhir sebelum klaim timbul.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">3. Hak Pengguna</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>Sebagai pengguna WitnessChain, Anda berhak untuk:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500">
                <li>Mengakses seluruh dokumen dan laporan yang Anda buat di platform ini</li>
                <li>Mengekspor data pribadi Anda dalam format yang dapat dibaca mesin</li>
                <li>Meminta penghapusan akun beserta seluruh data terkait</li>
                <li>Mendapatkan notifikasi jika terjadi pelanggaran data yang berdampak pada akun Anda</li>
                <li>Mengajukan keberatan atas pemrosesan data Anda</li>
              </ul>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 4 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <AlertTriangle className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">4. Kewajiban Pengguna</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>Dengan menggunakan platform ini, Anda berkewajiban untuk:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500">
                <li>Menjaga kerahasiaan kredensial akun dan tidak membagikannya kepada pihak lain</li>
                <li>Mengunggah hanya konten yang Anda miliki hak atau izin untuk menggunakannya</li>
                <li>Tidak mencoba merekayasa balik, meretas, atau mengganggu sistem kami</li>
                <li>Melaporkan pelanggaran keamanan atau penggunaan tidak sah yang Anda ketahui</li>
                <li>Mematuhi semua hukum dan peraturan yang berlaku di yurisdiksi Anda</li>
              </ul>
              <p>
                Pelanggaran terhadap kewajiban ini dapat mengakibatkan penangguhan atau penghentian akun Anda tanpa pemberitahuan sebelumnya.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 5 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">5. Perubahan Ketentuan</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                WitnessChain berhak mengubah Syarat Penggunaan ini sewaktu-waktu. Perubahan material akan diberitahukan melalui email terdaftar atau notifikasi dalam platform setidaknya 14 hari sebelum berlaku.
              </p>
              <p>
                Penggunaan berkelanjutan setelah tanggal efektif perubahan dianggap sebagai persetujuan terhadap ketentuan yang diperbarui. Jika Anda tidak menyetujui perubahan, Anda dapat menutup akun sebelum perubahan berlaku.
              </p>
              <p>
                Syarat Penggunaan ini diatur oleh hukum Republik Indonesia. Sengketa yang timbul akan diselesaikan melalui Pengadilan Negeri Jakarta Selatan sebagai yurisdiksi yang disepakati.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Footer note */}
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm">
              Pertanyaan tentang Syarat Penggunaan ini? Hubungi kami di{' '}
              <span className="text-emerald-400 font-medium">legal@witnesschain.id</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}