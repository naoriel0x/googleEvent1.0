'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Shield, AlertCircle, Mail, Lock,
  Eye, EyeOff, CheckCircle2, Check, ArrowLeft,
} from 'lucide-react';

// ─── Social button icons (inline SVG — no extra deps) ─────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// ─── Back button — detects where user came from ───────────────────────────────
function BackButton() {
  const [href, setHref] = useState('/');
  const [label, setLabel] = useState('← Kembali');

useEffect(() => {
  const prev = sessionStorage.getItem('wc_prev_path');
  const params = new URLSearchParams(window.location.search);
  const hasRedirectParam = params.has('redirect');

  // Kalau ada ?redirect= = dipaksa middleware → back ke intro
  // Kalau prev null = tidak ada history → back ke intro
  if (prev && prev !== '/login' && !hasRedirectParam) {
    setHref(prev);
    const labelMap: Record<string, string> = {
      '/': '← Kembali ke Halaman Utama',
      '/dashboard': '← Kembali ke Dashboard',
      '/legal-radar': '← Kembali ke Legal Radar',
      '/referral': '← Kembali ke Cari LBH',
      '/interview': '← Kembali ke Wawancara',
    };
    setLabel(labelMap[prev] || '← Kembali');
  } else {
    setHref('/');
    setLabel('← Kembali ke Halaman Utama');
  }
}, []);

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors group"
    >
      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </Link>
  );
}

// ─── Social Login Buttons ─────────────────────────────────────────────────────
function SocialLoginButtons() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoadingProvider(provider);
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });
      if (error) console.error('OAuth error:', error.message);
    } catch (err) {
      console.error('Social login error:', err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const socialProviders = [
    {
      key: 'google' as const,
      label: 'Google',
      icon: <GoogleIcon />,
      className: 'hover:border-blue-500/40 hover:bg-blue-950/20',
    },
    {
      key: 'facebook' as const,
      label: 'Facebook',
      icon: <FacebookIcon />,
      className: 'hover:border-blue-600/40 hover:bg-blue-950/20',
    },
    {
      key: 'twitter' as const,
      label: 'X',
      icon: <XIcon />,
      className: 'hover:border-slate-400/40 hover:bg-slate-700/30',
    },
  ];

  return (
    <div className="flex gap-2">
      {socialProviders.map(({ key, label, icon, className }) => (
        <button
          key={key}
          type="button"
          onClick={() => handleSocialLogin(key)}
          disabled={loadingProvider !== null}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5
            border border-slate-700 rounded-lg
            text-slate-300 text-xs font-semibold
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          title={`Masuk dengan ${label}`}
        >
          {loadingProvider === key ? (
            <span className="w-4 h-4 border-2 border-slate-500 border-t-slate-200 rounded-full animate-spin" />
          ) : (
            icon
          )}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Login Component ─────────────────────────────────────────────────────
function LoginComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 1;
    return {
      strength,
      label: strength <= 1 ? 'Lemah' : strength === 2 ? 'Sedang' : strength === 3 ? 'Kuat' : 'Sangat Kuat',
      color: strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-yellow-500' : strength === 3 ? 'bg-emerald-500' : 'bg-green-500',
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) { setError('Email dan Password wajib diisi.'); return; }
    if (isSignUp) {
      if (!name) { setError('Nama wajib diisi.'); return; }
      if (password !== confirmPassword) { setError('Password tidak cocok.'); return; }
      if (!acceptTerms) { setError('Anda harus menerima Ketentuan Layanan.'); return; }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: name },
          },
        });
        if (error) {
          setError(error.message);
        } else if (data?.user && data.session === null) {
          setSuccess('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi akun.');
          setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
        } else {
          setSuccess('Registrasi berhasil! Mengalihkan ke dashboard...');
          setTimeout(() => router.replace(redirectUrl), 1000);
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message);
        } else {
          setSuccess('Berhasil masuk! Mengalihkan...');
          if (rememberMe) localStorage.setItem('wc_remember_email', email);
          setTimeout(() => router.push(redirectUrl), 1500);
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    localStorage.setItem('wc_guest_mode', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex relative">
      <div className="absolute top-4 right-4 z-20">
        {/* ThemeToggle removed — dark-only mode */}
      </div>

      {/* ── Left Side — Visual (Desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-100 via-slate-100 to-white dark:from-emerald-950 dark:via-slate-950 dark:to-slate-900 p-12 flex-col justify-between relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Back button — desktop left side */}
          <div className="mb-8">
            <BackButton />
          </div>

          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">WitnessChain</h1>
          </Link>

          <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            Setiap dokumentasi adalah langkah menuju keadilan
          </h2>

          <div className="space-y-4">
            {[
              'Dokumentasi terstruktur dan mudah dilanjutkan',
              'Bukti dicatat dengan hash SHA-256 sebagai referensi',
              'Berkas siap dibawa saat konsultasi ke LBH',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Dibuat untuk membantu warga menyusun dokumentasi kasus secara mandiri
          </p>
        </div>
      </div>

      {/* ── Right Side — Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950 transition-colors duration-500">
        <div className="w-full max-w-sm">

          {/* Mobile: logo + back button */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-emerald-950 rounded">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">WitnessChain</span>
            </Link>
            <BackButton />
          </div>

          {/* Desktop: back button above form (right side) */}


          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              {isSignUp ? 'Buat Akun' : 'Masuk'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {isSignUp
                ? 'Simpan berkas kasus dan riwayat dokumentasi Anda dengan aman.'
                : 'Kelola draf kasus dan pantau riwayat dokumen Anda.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg">
            {[
              { label: 'Masuk', value: false },
              { label: 'Daftar', value: true },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => { setIsSignUp(value); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 px-4 font-bold text-sm rounded-md transition-all ${
                  isSignUp === value
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Social Login (Login tab only) ── */}
          {!isSignUp && (
            <>
              <SocialLoginButtons />
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs text-slate-600 font-medium">atau dengan email</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
            </>
          )}

          {/* Error / Success */}
          {error && (
            <div className="mb-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-300">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password strength (Sign Up) */}
              {isSignUp && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{passwordStrength.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">Minimal 8 karakter, huruf besar/kecil, angka, dan simbol</p>
                </div>
              )}
            </div>

            {/* Confirm Password (Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            {/* Remember Me */}
            {!isSignUp && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-600 accent-emerald-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-400">Ingat saya</label>
              </div>
            )}

            {/* Accept Terms (Sign Up) */}
            {isSignUp && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-600 accent-emerald-500 mt-1 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-xs text-slate-400">
                  Saya menyetujui{' '}
                  <a href="#" className="text-emerald-400 hover:underline">Ketentuan Layanan</a>
                  {' '}dan{' '}
                  <a href="#" className="text-emerald-400 hover:underline">Kebijakan Privasi</a>
                </label>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Proses...
                </span>
              ) : isSignUp ? 'Buat Akun' : 'Masuk'}
            </Button>
          </form>

          {/* Guest Continue (Login only) */}
          {!isSignUp && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs text-slate-600">atau</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200 transition-all text-sm"
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

// ─── Export ────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <LoginComponent />
    </Suspense>
  );
}