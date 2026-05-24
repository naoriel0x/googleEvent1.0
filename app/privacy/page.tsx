'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Database, Eye, Lock, UserCog, Mail } from 'lucide-react'

export default function PrivacyPage() {
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
            Kebijakan Privasi
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            Privasi Anda adalah prioritas kami. Dokumen ini menjelaskan bagaimana WitnessChain mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
          </p>
          <p className="text-slate-500 text-sm mt-3">Terakhir diperbarui: 1 Januari 2025</p>
        </div>

        {/* Content card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">

          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">1. Data yang Kami Kumpulkan</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>Kami mengumpulkan informasi berikut untuk menyediakan layanan:</p>
              <div className="space-y-3">
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-slate-300 font-semibold text-sm mb-1">Data Identitas</p>
                  <p className="text-slate-500 text-xs leading-relaxed">Nama lengkap, alamat email, nomor telepon, dan kata sandi terenkripsi yang Anda berikan saat mendaftar.</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-slate-300 font-semibold text-sm mb-1">Data Konten</p>
                  <p className="text-slate-500 text-xs leading-relaxed">Laporan, dokumen, foto, video, dan berkas lain yang Anda unggah ke platform sebagai bagian dari dokumentasi kasus.</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-slate-300 font-semibold text-sm mb-1">Data Teknis</p>
                  <p className="text-slate-500 text-xs leading-relaxed">Alamat IP, jenis perangkat, browser, sistem operasi, dan log aktivitas untuk keperluan keamanan dan analitik.</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-slate-300 font-semibold text-sm mb-1">Data Lokasi</p>
                  <p className="text-slate-500 text-xs leading-relaxed">Lokasi perkiraan berdasarkan IP, atau lokasi GPS jika Anda memberikan izin eksplisit saat mendokumentasikan insiden.</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <Eye className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">2. Bagaimana Data Digunakan</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>Data Anda digunakan semata-mata untuk tujuan berikut:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-500">
                <li>Menyediakan dan meningkatkan layanan platform WitnessChain</li>
                <li>Menghasilkan dokumen hukum dan analisis berbasis AI sesuai permintaan Anda</li>
                <li>Mengirimkan notifikasi penting terkait akun dan pembaruan layanan</li>
                <li>Mendeteksi dan mencegah penipuan, penyalahgunaan, atau aktivitas mencurigakan</li>
                <li>Mematuhi kewajiban hukum yang berlaku di Indonesia</li>
              </ul>
              <p className="mt-3 text-slate-500">
                <span className="text-emerald-400 font-medium">Kami tidak menjual data Anda</span> kepada pihak ketiga mana pun untuk tujuan pemasaran atau komersial.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">3. Keamanan Data</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                Kami menerapkan langkah-langkah keamanan teknis dan organisasional untuk melindungi data Anda:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-500">
                <li>Enkripsi data saat transit menggunakan TLS 1.3</li>
                <li>Enkripsi data saat penyimpanan menggunakan AES-256</li>
                <li>Hash kriptografis (SHA-256) untuk setiap berkas bukti yang diunggah</li>
                <li>Kontrol akses berbasis peran dan autentikasi dua faktor</li>
                <li>Audit keamanan berkala oleh pihak ketiga independen</li>
                <li>Pencadangan data terenkripsi secara rutin</li>
              </ul>
              <p>
                Meski demikian, tidak ada sistem yang 100% aman. Kami mendorong Anda untuk menggunakan kata sandi yang kuat dan unik serta mengaktifkan autentikasi dua faktor.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 4 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <UserCog className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">4. Hak Anda atas Data</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>Sesuai dengan UU Perlindungan Data Pribadi (UU No. 27 Tahun 2022), Anda memiliki hak:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-500">
                <li><span className="text-slate-400">Akses:</span> Meminta salinan data pribadi yang kami simpan tentang Anda</li>
                <li><span className="text-slate-400">Koreksi:</span> Meminta perbaikan data yang tidak akurat atau tidak lengkap</li>
                <li><span className="text-slate-400">Penghapusan:</span> Meminta penghapusan data Anda (kecuali yang diwajibkan hukum)</li>
                <li><span className="text-slate-400">Portabilitas:</span> Menerima data Anda dalam format terstruktur yang dapat dibaca mesin</li>
                <li><span className="text-slate-400">Keberatan:</span> Menolak pemrosesan data untuk tujuan tertentu</li>
              </ul>
              <p>
                Untuk menggunakan hak-hak ini, kirimkan permintaan ke <span className="text-emerald-400">privacy@witnesschain.id</span>. Kami akan merespons dalam 30 hari kerja.
              </p>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Section 5 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">5. Kontak Privasi</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                Untuk pertanyaan, kekhawatiran, atau permintaan terkait privasi data Anda, hubungi Data Protection Officer kami:
              </p>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40 space-y-2">
                <p className="text-slate-300 text-sm"><span className="text-slate-500">Email:</span> <span className="text-emerald-400">privacy@witnesschain.id</span></p>
                <p className="text-slate-300 text-sm"><span className="text-slate-500">Subjek:</span> [Permintaan Privasi] — diikuti deskripsi singkat</p>
                <p className="text-slate-300 text-sm"><span className="text-slate-500">Waktu respons:</span> Maksimal 30 hari kerja</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-800/60 my-6" />

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm">
              WitnessChain berkomitmen penuh terhadap kepatuhan UU PDP Indonesia dan prinsip privasi by design dalam setiap fitur yang kami kembangkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}