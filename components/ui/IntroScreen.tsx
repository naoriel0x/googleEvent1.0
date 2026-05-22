'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, FileText, Scale } from 'lucide-react';

export function IntroScreen() {
  const [showIntro, setShowIntro] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const intro_seen = localStorage.getItem('wc_intro_seen');
    if (!intro_seen) {
      setShowIntro(true);
    }
  }, []);

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => {
      localStorage.setItem('wc_intro_seen', 'true');
      setShowIntro(false);
    }, 600);
  };

  if (!showIntro) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-600 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-slate-50 to-white dark:from-emerald-950 dark:via-slate-950 dark:to-slate-900 transition-colors duration-500" />

      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(16, 185, 129, .06) 25%, rgba(16, 185, 129, .06) 26%, transparent 27%, transparent 74%, rgba(16, 185, 129, .06) 75%, rgba(16, 185, 129, .06) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(16, 185, 129, .06) 25%, rgba(16, 185, 129, .06) 26%, transparent 27%, transparent 74%, rgba(16, 185, 129, .06) 75%, rgba(16, 185, 129, .06) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="absolute top-4 right-4 z-20">
        {/* ThemeToggle removed — app uses dark-only mode */}
      </div>

      <div className="relative flex flex-col items-center justify-center h-full px-4">
        <div
          className="text-center mb-8 animate-in fade-in slide-in-from-top-8"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-emerald-600 dark:text-emerald-500" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">WitnessChain</h1>
        </div>

        <div
          className="text-center mb-4 animate-in fade-in"
          style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
        >
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
            Platform Dokumentasi Hak Warga Indonesia
          </p>
        </div>

        <div
          className="text-center mb-12 max-w-md animate-in fade-in"
          style={{ animationDelay: '1s', animationFillMode: 'both' }}
        >
          <p className="text-slate-800 dark:text-white text-xl leading-relaxed">
            Ceritamu penting. Kami bantu dokumentasikan dengan benar.
          </p>
        </div>

        <div
          className="grid grid-cols-3 gap-4 mb-12 max-w-2xl animate-in fade-in"
          style={{ animationDelay: '1.2s', animationFillMode: 'both' }}
        >
          {[
            { icon: FileText, label: 'Dokumentasi Terstruktur' },
            { icon: Shield, label: 'Bukti Tercatat' },
            { icon: Scale, label: 'Siap Konsultasi' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="text-center">
                <div className="bg-white/80 dark:bg-slate-800/50 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-2 border border-emerald-200/80 dark:border-emerald-500/30 shadow-sm">
                  <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div
          className="flex flex-col items-center gap-4 animate-in fade-in"
          style={{ animationDelay: '1.8s', animationFillMode: 'both' }}
        >
          <button
            onClick={handleClose}
            className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold text-lg rounded-full transition-all duration-200 hover:scale-105 shadow-lg shadow-black/40"
          >
            Mulai Sekarang →
          </button>
          <Link
            href="/login"
            onClick={() => sessionStorage.setItem('wc_prev_path', window.location.pathname)}
            className="text-slate-500 dark:text-slate-500 text-sm hover:text-emerald-600 dark:hover:text-slate-400 transition-colors"
          >
            Sudah punya akun? Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
