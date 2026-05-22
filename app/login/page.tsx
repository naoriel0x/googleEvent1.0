'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Shield, AlertCircle, Mail, Lock,
  Eye, EyeOff, CheckCircle2, ArrowLeft,
} from 'lucide-react';

// ─── Social button icons (inline SVG — Google Only) ───────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Main Content — inside Suspense ──────────────────────────────────────────
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tabs: login vs register
  const initialTab = searchParams.get('tab') === 'register';
  const [isSignUp, setIsSignUp] = useState(initialTab);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsSignUp(searchParams.get('tab') === 'register');
    setError(null);
    setSuccessMsg(null);
  }, [searchParams]);

  // Fungsi pembantu untuk menghapus cookie jika user login/register resmi
  const clearGuestCredentials = () => {
    localStorage.removeItem('wc_guest_mode');
    document.cookie = "wc_guest_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
  };

  // Handle Login & Register submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Silakan isi email dan kata sandi Anda.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error: signUpErr } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpErr) throw signUpErr;

        if (data?.user && data.user.identities?.length === 0) {
          setError('Email ini sudah terdaftar. Silakan masuk menggunakan tab Masuk.');
        } else {
          setSuccessMsg('Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk melakukan verifikasi akun.');
          setEmail('');
          setPassword('');
        }
      } else {
        // Sign In Flow
        const { error: signInErr } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) throw signInErr;

        // Berhasil masuk, hapus data mode tamu dari cookie & localStorage
        clearGuestCredentials();
        
        // Fix 2: Redirect instan menggunakan router.replace
        const prevPath = sessionStorage.getItem('wc_prev_path') || '/dashboard';
        sessionStorage.removeItem('wc_prev_path');
        router.replace(prevPath);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.message === 'Invalid login credentials') {
        setError('Email atau kata sandi yang Anda masukkan salah.');
      } else if (err.message === 'User already registered') {
        setError('Email ini sudah terdaftar.');
      } else {
        setError(err.message || 'Terjadi kesalahan sistem, silakan coba beberapa saat lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Only
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      clearGuestCredentials();
      const { error: oauthErr } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthErr) throw oauthErr;
    } catch (err: any) {
      setError(err.message || 'Gagal tersambung ke Google.');
    }
  };

  // Fix 2, 3 & 4: Set COOKIE + LOCALSTORAGE dan langsung jalankan router.replace tanpa delay
  const handleGuestContinue = () => {
    localStorage.setItem('wc_guest_mode', 'true');
    
    // Set Document Cookie agar Next.js Middleware bisa memvalidasi passthrough
    const maxAge = 7 * 24 * 60 * 60; // 7 hari
    document.cookie = `wc_guest_mode=true; path=/; max-age=${maxAge}; SameSite=Lax`;

    const prevPath = sessionStorage.getItem('wc_prev_path') || '/dashboard';
    sessionStorage.removeItem('wc_prev_path');
    router.replace(prevPath);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Back button to Home */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors group">
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Beranda
      </Link>

      <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Upper glow decoration */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">WitnessChain</h1>
          <p className="text-xs text-slate-400 font-medium max-w-[280px]">
            {isSignUp ? 'Buat akun untuk mengamankan data enkripsi laporan Anda secara permanen.' : 'Masuk untuk mengakses dasbor draf dokumen hukum Anda.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/60 mb-6">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); setSuccessMsg(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${!isSignUp ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); setSuccessMsg(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${isSignUp ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium flex items-start gap-2.5 mb-5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium flex items-start gap-2.5 mb-5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Social Authentication - Google Only */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm group disabled:opacity-50"
          >
            <GoogleIcon />
            Lanjutkan dengan Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-800/60" />
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">atau dengan email</span>
            <div className="flex-1 h-px bg-slate-800/60" />
          </div>

          {/* Traditional Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl text-xs text-white placeholder-slate-700 font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Kata Sandi</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl text-xs text-white placeholder-slate-700 font-mono tracking-widest transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 border-0 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/20 transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Spinner size="sm" /> Proses...
                </span>
              ) : isSignUp ? 'Buat Akun' : 'Masuk'}
            </Button>
          </form>

          {/* Guest Continue (Hanya tampil di tab Login) */}
          {!isSignUp && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-800/60" />
                <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">Tanpa Akun</span>
                <div className="flex-1 h-px bg-slate-800/60" />
              </div>
              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full py-3 border border-slate-800 hover:border-slate-700 bg-slate-950/20 text-slate-400 font-bold rounded-xl hover:bg-slate-950 hover:text-white transition-all text-xs cursor-pointer"
              >
                Lanjutkan tanpa akun →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Export & Wrapper ──────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" className="text-emerald-500" />
      </div>
    }>
      <div className="min-h-dvh w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative font-sans overflow-x-hidden">
        {/* Background ambient light */}
        <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-emerald-950/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-950/10 rounded-full blur-[120px] pointer-events-none" />
        
        <LoginContent />
      </div>
    </Suspense>
  );
}