'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { IntroScreen } from '@/components/ui/IntroScreen';
import {
  Shield,
  Sparkles,
  BookOpen,
  Lock,
  ShieldAlert,
  FileCheck2,
  Heart,
  ArrowRight,
  MessageSquare,
  Upload,
  CheckCircle,
  Scale,
  FolderOpen,
  Share2,
  MapPin,
  Menu,
  X
} from 'lucide-react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <IntroScreen />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="p-1 bg-emerald-50 dark:bg-emerald-950 rounded text-emerald-600 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <span>WitnessChain</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm"
            >
              Cara Kerja
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm"
            >
              Fitur
            </button>
            <button
              onClick={() => {
                document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm"
            >
              Tentang
            </button>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium hidden sm:flex">
                Masuk
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="font-semibold hidden sm:flex">
                Mulai Gratis
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-900 dark:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <button
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 font-medium"
            >
              Cara Kerja
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 font-medium"
            >
              Fitur
            </button>
            <button
              onClick={() => {
                document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 font-medium"
            >
              Tentang
            </button>
            <Link href="/login" className="block">
              <Button variant="ghost" size="sm" className="w-full font-medium">
                Masuk
              </Button>
            </Link>
            <Link href="/dashboard" className="block">
              <Button variant="primary" size="sm" className="w-full font-semibold">
                Mulai Gratis
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 pt-32 px-4 pb-24 relative overflow-hidden">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/20 dark:bg-emerald-950/50 border border-emerald-800/30 dark:border-emerald-700/50">
              <span className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                ✦ Gratis · Tanpa Registrasi · 100% Aman
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-6">
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-4 text-balance">
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Ceritamu penting.
              </span>
              <br />
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Kami bantu dokumentasikan
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
                dengan benar.
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-center max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
            WitnessChain membantu korban penggusuran, sengketa lahan, dan pelanggaran hak mendokumentasikan bukti secara terstruktur — siap dibawa ke LBH atau Polri.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/dashboard">
              <Button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-full shadow-lg shadow-emerald-900/30 hover:scale-105 transition-transform">
                Mulai Dokumentasi →
              </Button>
            </Link>
            <button
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 border border-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-base rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Pelajari Cara Kerja
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex justify-center items-center gap-4 mb-16">
            <div className="flex -space-x-3">
              {[
                { color: 'bg-emerald-600', initials: 'A' },
                { color: 'bg-blue-600', initials: 'B' },
                { color: 'bg-purple-600', initials: 'C' },
                { color: 'bg-orange-600', initials: 'D' }
              ].map((avatar, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-900 ${avatar.color}`}
                >
                  {avatar.initials}
                </div>
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              Dipercaya 1.200+ warga Indonesia
            </p>
          </div>

          {/* Mockup Card */}
          <div className="flex justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full relative">
              {/* Card border accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-t-2xl" />

              {/* Chat interface mockup */}
              <div className="space-y-4">
                {/* AI message */}
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3 max-w-xs">
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Apa jenis pelanggaran yang Anda alami?
                    </p>
                  </div>
                </div>

                {/* User message */}
                <div className="flex gap-2 justify-end">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 max-w-xs">
                    <p className="text-xs text-slate-900 dark:text-slate-200">
                      Rumah saya digusur paksa tanpa surat resmi...
                    </p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Score Kelengkapan</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">65%</p>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 dark:bg-slate-950 border-y border-slate-800 py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black text-emerald-400 mb-2">74.000+</p>
            <p className="text-slate-400 text-sm font-medium">Kasus penipuan online per tahun</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black text-emerald-400 mb-2">30 menit</p>
            <p className="text-slate-400 text-sm font-medium">Rata-rata waktu dokumentasi</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black text-emerald-400 mb-2">100%</p>
            <p className="text-slate-400 text-sm font-medium">Gratis tanpa registrasi</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black text-emerald-400 mb-2">20+ LBH</p>
            <p className="text-slate-400 text-sm font-medium">Siap membantu di seluruh Indonesia</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 text-balance">
              Tiga langkah menuju dokumen yang kuat
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
              Dari cerita menjadi dokumen hukum profesional dalam 30 menit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg dark:hover:shadow-emerald-900/10 transition-all">
              <p className="text-8xl font-black text-emerald-900/10 dark:text-emerald-900/30 mb-2">01</p>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ceritakan Kejadian</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                AI kami mewawancaraimu dengan pertanyaan terstruktur yang digunakan investigator dan paralegal nyata. Ceritakan kronologi kejadian secara natural, AI kami akan memandu Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg dark:hover:shadow-emerald-900/10 transition-all">
              <p className="text-8xl font-black text-emerald-900/10 dark:text-emerald-900/30 mb-2">02</p>
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Bukti</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Foto, video, dokumen — semua tersimpan dengan timestamp dikunci dan SHA-256 hash untuk memastikan integritas data. Setiap bukti tidak bisa dimanipulasi.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg dark:hover:shadow-emerald-900/10 transition-all">
              <p className="text-8xl font-black text-emerald-900/10 dark:text-emerald-900/30 mb-2">03</p>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dapatkan Dokumen</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                PDF profesional dengan kronologi, referensi pasal hukum, dan daftar saksi — siap dibawa ke LBH, Komnas HAM, atau Polri untuk tindakan lanjutan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                Mengapa WitnessChain?
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Dokumentasi yang diakui secara hukum
              </h2>

              <div className="space-y-4">
                {[
                  {
                    icon: <FileCheck2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                    title: 'Evidence Completeness Score',
                    desc: 'Tahu persis kekuatan dokumenmu dengan scoring sistem'
                  },
                  {
                    icon: <Scale className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                    title: 'Legal Radar AI',
                    desc: 'Identifikasi pasal yang dilanggar secara otomatis'
                  },
                  {
                    icon: <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                    title: 'Timestamp Terkunci',
                    desc: 'Bukti tidak bisa dimanipulasi dengan hash encryption'
                  },
                  {
                    icon: <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                    title: 'Referral LBH',
                    desc: 'Langsung terhubung ke bantuan hukum profesional'
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              {/* Stacked cards */}
              <div className="relative h-96">
                {/* Back card */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-emerald-500/10 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/10 transform translate-y-8 translate-x-8 scale-90" />
                {/* Middle card */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-emerald-500/5 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5 transform translate-y-4 translate-x-4 scale-95" />
                {/* Front card */}
                <div className="absolute inset-0 bg-white dark:bg-slate-700 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-lg dark:shadow-emerald-900/20 p-6 flex flex-col items-center justify-center">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Score Kelengkapan</p>
                  <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-600 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">78</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">/100</p>
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    {['Identitas', 'Kronologi', 'Lokasi', 'Saksi'].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-slate-600 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 px-4 bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-balance">
            Setiap dokumentasi adalah langkah menuju keadilan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-800/70 transition-colors">
              <p className="text-5xl font-black text-emerald-400 mb-2">3.291</p>
              <p className="text-slate-300">Kasus terdokumentasi</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-800/70 transition-colors">
              <p className="text-5xl font-black text-emerald-400 mb-2">89%</p>
              <p className="text-slate-300">Berhasil diproses LBH</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-800/70 transition-colors">
              <p className="text-5xl font-black text-emerald-400 mb-2">&lt; 30m</p>
              <p className="text-slate-300">Rata-rata selesai</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">
            Jangan tunda. Dokumentasikan sekarang.
          </h2>
          <p className="text-lg text-emerald-50 mb-8">
            Setiap detail yang terlupakan adalah bukti yang hilang.
          </p>
          <Link href="/dashboard">
            <Button className="px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-base rounded-full shadow-lg hover:scale-105 transition-transform">
              Mulai Dokumentasi Gratis →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 dark:bg-slate-900 text-slate-400 py-16 px-4 border-t border-slate-900 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Column 1 - Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-white text-lg">WitnessChain</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Platform dokumentasi hak warga Indonesia
              </p>
              <p className="text-xs text-slate-600">
                ⚠️ Bukan pengganti konsultasi pengacara profesional
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors">f</a>
                <a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors">x</a>
                <a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors">in</a>
              </div>
            </div>

            {/* Column 2 - Platform */}
            <div>
              <h3 className="font-bold text-white mb-4">Platform</h3>
              <ul className="space-y-2 text-xs">
                <li><a href="/dashboard" className="text-slate-500 hover:text-emerald-400 transition-colors">Mulai Dokumentasi</a></li>
                <li><a href="/legal-radar" className="text-slate-500 hover:text-emerald-400 transition-colors">Legal Radar</a></li>
                <li><a href="/referral" className="text-slate-500 hover:text-emerald-400 transition-colors">Cari LBH</a></li>
                <li><a href="/dashboard" className="text-slate-500 hover:text-emerald-400 transition-colors">Dashboard</a></li>
              </ul>
            </div>

            {/* Column 3 - Bantuan */}
            <div>
              <h3 className="font-bold text-white mb-4">Bantuan</h3>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => document.getElementById('how-it-works')?.scrollIntoView()} className="text-slate-500 hover:text-emerald-400 transition-colors">Cara Kerja</button></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors">Kontak Kami</a></li>
                <li><button onClick={() => document.getElementById('impact')?.scrollIntoView()} className="text-slate-500 hover:text-emerald-400 transition-colors">Tentang Kami</button></li>
              </ul>
            </div>

            {/* Column 4 - Emergency */}
            <div>
              <h3 className="font-bold text-red-500 mb-4 text-sm">🚨 KONTAK DARURAT</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <p className="text-slate-500">Komnas HAM RI:</p>
                  <p className="font-bold text-slate-300">119 ext 6</p>
                </li>
                <li>
                  <p className="text-slate-500">YLBHI Jakarta:</p>
                  <p className="font-bold text-slate-300">(021) 315-7038</p>
                </li>
                <li>
                  <p className="text-slate-500">Panggilan Darurat:</p>
                  <p className="font-bold text-slate-300">110</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-900 dark:border-slate-800 pt-8 text-center text-xs text-slate-600">
            <p className="flex items-center justify-center gap-1 font-medium">
              © 2025 WitnessChain · All rights reserved · Dibuat untuk keadilan Indonesia
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
