'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Target, Lightbulb, Heart, Eye, Shield, Users } from 'lucide-react'

const values = [
  {
    icon: Shield,
    title: 'Keberanian',
    description: 'Kami percaya setiap warga berhak berani bersuara tanpa rasa takut, dengan dukungan dokumentasi yang kuat.',
  },
  {
    icon: Eye,
    title: 'Transparansi',
    description: 'Platform kami beroperasi secara terbuka. Anda selalu tahu bagaimana data Anda digunakan.',
  },
  {
    icon: Heart,
    title: 'Empati',
    description: 'Setiap fitur kami dirancang dengan memahami konteks dan beban emosional yang dialami warga yang mencari keadilan.',
  },
  {
    icon: Users,
    title: 'Inklusivitas',
    description: 'Keadilan bukan hak istimewa. Kami membangun untuk semua lapisan masyarakat, termasuk mereka yang jauh dari pusat kekuasaan.',
  },
]

export default function TentangPage() {
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
            Tentang WitnessChain
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            Platform dokumentasi hak warga Indonesia — dibangun dari keprihatinan nyata, untuk perubahan nyata.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-white font-extrabold text-xl">Misi Kami</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4 pl-1">
            WitnessChain hadir untuk <span className="text-white font-semibold">mendemokratisasi akses terhadap keadilan</span> bagi seluruh warga Indonesia. Kami percaya bahwa kemampuan mendokumentasikan hak, melindungi bukti, dan memahami opsi hukum tidak seharusnya hanya dimiliki oleh mereka yang mampu membayar pengacara mahal.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed pl-1">
            Dengan memanfaatkan teknologi AI, kriptografi, dan desain yang berpusat pada manusia, kami membangun alat yang memberdayakan warga biasa untuk berdiri setara di hadapan sistem hukum yang kompleks.
          </p>
        </div>

        {/* Story */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
              <Lightbulb className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-white font-extrabold text-xl">Latar Belakang</h2>
          </div>
          <div className="text-slate-400 text-sm leading-relaxed space-y-4 pl-1">
            <p>
              WitnessChain lahir dari sebuah pertanyaan sederhana: <span className="text-slate-300 italic">"Mengapa warga yang mengalami ketidakadilan harus berjuang sendirian melawan birokrasi dan sistem hukum yang rumit?"</span>
            </p>
            <p>
              Kami melihat bagaimana ribuan kasus kekerasan, pelanggaran hak tenaga kerja, sengketa tanah, dan pelecehan wewenang tidak pernah sampai ke pengadilan — bukan karena tidak ada dasar hukum, melainkan karena bukti tidak terdokumentasi dengan benar, atau korban tidak tahu ke mana harus mulai.
            </p>
            <p>
              Dari keprihatinan itu, tim kami mulai merancang platform yang menggabungkan kemudahan smartphone, kecerdasan buatan, dan prinsip-prinsip hukum Indonesia untuk menciptakan alat dokumentasi yang sesungguhnya berguna di lapangan.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
              <Heart className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-white font-extrabold text-xl">Nilai-Nilai Kami</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-100 font-bold text-sm">{value.title}</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Vision */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-white font-extrabold text-xl">Visi untuk Indonesia</h2>
          </div>
          <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
            <p>
              Kami membayangkan Indonesia di mana setiap warga — dari petani di Kalimantan, buruh pabrik di Bekasi, hingga mahasiswa di Papua — memiliki akses yang sama terhadap alat hukum yang efektif.
            </p>
            <p>
              Dalam visi kami, WitnessChain menjadi lapisan kepercayaan digital yang menghubungkan warga dengan sistem hukum, LBH, dan advokat secara efisien. Setiap bukti yang didokumentasikan melalui platform kami adalah satu langkah menuju akuntabilitas yang lebih kuat.
            </p>
          </div>

          <hr className="border-slate-800/60 my-6" />

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm">
              Ingin berkolaborasi atau mengetahui lebih lanjut tentang WitnessChain?{' '}
              <span className="text-emerald-400 font-medium">hello@witnesschain.id</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}