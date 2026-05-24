'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Code2, Heart, ExternalLink, GitBranch } from 'lucide-react'

const libraries = [
  {
    name: 'Next.js',
    version: '14.x',
    license: 'MIT',
    author: 'Vercel, Inc.',
    url: 'https://github.com/vercel/next.js',
    description: 'Framework React untuk produksi dengan rendering sisi server dan generasi situs statis.',
  },
  {
    name: 'React',
    version: '18.x',
    license: 'MIT',
    author: 'Meta Platforms, Inc.',
    url: 'https://github.com/facebook/react',
    description: 'Library JavaScript untuk membangun antarmuka pengguna berbasis komponen.',
  },
  {
    name: 'Supabase',
    version: '2.x',
    license: 'MIT & Apache 2.0',
    author: 'Supabase, Inc.',
    url: 'https://github.com/supabase/supabase',
    description: 'Alternatif open source Firebase dengan database PostgreSQL, autentikasi, dan penyimpanan.',
  },
  {
    name: 'Tailwind CSS',
    version: '3.x',
    license: 'MIT',
    author: 'Tailwind Labs, Inc.',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    description: 'Framework CSS utility-first untuk membangun desain yang cepat dan responsif.',
  },
  {
    name: 'Lucide Icons',
    version: '0.x',
    license: 'ISC',
    author: 'Lucide Contributors',
    url: 'https://github.com/lucide-icons/lucide',
    description: 'Kumpulan ikon open source yang konsisten dan dapat dikustomisasi.',
  },
  {
    name: 'TypeScript',
    version: '5.x',
    license: 'Apache 2.0',
    author: 'Microsoft Corporation',
    url: 'https://github.com/microsoft/TypeScript',
    description: 'Superset JavaScript bertipe statis yang meningkatkan keandalan kode.',
  },
  {
    name: 'Radix UI',
    version: '1.x',
    license: 'MIT',
    author: 'WorkOS',
    url: 'https://github.com/radix-ui/primitives',
    description: 'Komponen UI primitif tanpa gaya untuk membangun sistem desain yang aksesibel.',
  },
  {
    name: 'date-fns',
    version: '3.x',
    license: 'MIT',
    author: 'date-fns contributors',
    url: 'https://github.com/date-fns/date-fns',
    description: 'Library utilitas tanggal dan waktu JavaScript yang modular dan modern.',
  },
]

export default function LicensePage() {
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
            Lisensi Open Source
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            WitnessChain dibangun di atas fondasi proyek-proyek open source yang luar biasa. Kami berterima kasih kepada seluruh komunitas yang telah berkontribusi.
          </p>
        </div>

        {/* MIT License card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
              <Code2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-white font-extrabold text-xl">Lisensi WitnessChain</h2>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/40 font-mono text-xs text-slate-400 leading-relaxed">
            <p className="text-emerald-400 font-bold mb-3">MIT License</p>
            <p className="mb-3">Copyright (c) 2025 WitnessChain</p>
            <p className="mb-3">
              Dengan ini diberikan izin, secara gratis, kepada siapa pun yang mendapatkan salinan perangkat lunak ini dan file dokumentasi terkait ("Perangkat Lunak"), untuk menggunakan Perangkat Lunak tanpa batasan, termasuk tanpa batasan hak untuk menggunakan, menyalin, memodifikasi, menggabungkan, menerbitkan, mendistribusikan, mensublisensikan, dan/atau menjual salinan Perangkat Lunak.
            </p>
            <p>
              PERANGKAT LUNAK INI DISEDIAKAN "SEBAGAIMANA ADANYA", TANPA GARANSI APA PUN, TERSURAT MAUPUN TERSIRAT.
            </p>
          </div>
        </div>

        {/* Libraries */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
              <Heart className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-white font-extrabold text-xl">Library yang Digunakan</h2>
          </div>

          <div className="space-y-3">
            {libraries.map((lib, index) => (
              <div key={lib.name}>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40 hover:border-slate-600/60 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-slate-100 font-bold text-sm">{lib.name}</span>
                        <span className="text-slate-600 text-xs">{lib.version}</span>
                        <span className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">
                          {lib.license}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed mb-1">{lib.description}</p>
                      <p className="text-slate-600 text-xs">by {lib.author}</p>
                    </div>
                    <a
                      href={lib.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-slate-600 hover:text-emerald-400 transition-colors mt-0.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                {index < libraries.length - 1 && <div className="h-0" />}
              </div>
            ))}
          </div>

          <hr className="border-slate-800/60 my-6" />

          {/* Contribution */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
                <GitBranch className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-extrabold text-xl">Berkontribusi</h2>
            </div>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3 pl-1">
              <p>
                WitnessChain percaya pada kekuatan komunitas. Jika Anda adalah pengembang, peneliti hukum, atau desainer yang ingin berkontribusi pada misi kami, kami menyambut kolaborasi dalam bentuk:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500">
                <li>Pelaporan bug atau isu keamanan yang bertanggung jawab</li>
                <li>Pengembangan fitur baru yang relevan dengan kebutuhan warga</li>
                <li>Peningkatan aksesibilitas dan pengalaman pengguna</li>
                <li>Terjemahan dan lokalisasi ke bahasa daerah Indonesia</li>
              </ul>
              <p>
                Hubungi kami di <span className="text-emerald-400">dev@witnesschain.id</span> untuk mulai berkontribusi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}