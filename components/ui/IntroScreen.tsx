'use client'

import { useEffect, useState } from 'react'
import { Shield, FileText, Scale } from 'lucide-react'

export function IntroScreen() {
  const [showIntro, setShowIntro] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const intro_seen = localStorage.getItem('wc_intro_seen')
    if (!intro_seen) {
      setShowIntro(true)
    }
  }, [])

  const handleClose = () => {
    setFadeOut(true)
    setTimeout(() => {
      localStorage.setItem('wc_intro_seen', 'true')
      setShowIntro(false)
    }, 600)
  }

  if (!showIntro) return null

  return (
    <div
      className={`fixed inset-0 z-100 transition-opacity duration-600 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full px-4">
        {/* Logo */}
        <div
          className="text-center mb-8 animate-in fade-in slide-in-from-top-8"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-emerald-500" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-white">WitnessChain</h1>
        </div>

        {/* Tagline */}
        <div
          className="text-center mb-4 animate-in fade-in"
          style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
        >
          <p className="text-slate-400 text-lg font-medium">
            Platform Dokumentasi Hak Warga Indonesia
          </p>
        </div>

        {/* Description */}
        <div
          className="text-center mb-12 max-w-md animate-in fade-in"
          style={{ animationDelay: '1s', animationFillMode: 'both' }}
        >
          <p className="text-white text-xl leading-relaxed">
            Ceritamu penting. Kami bantu dokumentasikan dengan benar.
          </p>
        </div>

        {/* Feature Cards */}
        <div
          className="grid grid-cols-3 gap-4 mb-12 max-w-2xl animate-in fade-in"
          style={{ animationDelay: '1.2s', animationFillMode: 'both' }}
        >
          {[
            { icon: FileText, label: 'Dokumentasi Aman', delay: '0s' },
            { icon: Shield, label: 'Terverifikasi', delay: '0.5s' },
            { icon: Scale, label: 'Siap Hukum', delay: '1s' }
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="text-center animate-bounce"
                style={{ animationDelay: item.delay }}
              >
                <div className="bg-slate-800/50 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                  <Icon className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-slate-300 text-xs font-medium">{item.label}</p>
              </div>
            )
          })}
        </div>

        {/* CTA Button */}
        <div
          className="flex flex-col items-center gap-4 animate-in fade-in"
          style={{ animationDelay: '1.8s', animationFillMode: 'both' }}
        >
          <button
            onClick={handleClose}
            className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-full transition-all duration-200 hover:scale-105 shadow-lg shadow-emerald-900/30"
          >
            Mulai Sekarang →
          </button>
          <a
            href="/login"
            className="text-slate-500 text-sm hover:text-slate-400 transition-colors"
          >
            Sudah punya akun? Masuk
          </a>
        </div>
      </div>
    </div>
  )
}
