'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Shield, AlertCircle, Mail, Lock, Eye, EyeOff, CheckCircle2, Check } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

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

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 1;

    return {
      strength,
      label: strength === 0 ? 'Lemah' : strength === 1 || strength === 2 ? 'Sedang' : strength === 3 ? 'Kuat' : 'Sangat Kuat',
      color: strength === 0 ? 'bg-red-500' : strength <= 2 ? 'bg-yellow-500' : strength === 3 ? 'bg-emerald-500' : 'bg-green-600'
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email dan Password wajib diisi.');
      return;
    }

    if (isSignUp) {
      if (!name) {
        setError('Nama wajib diisi.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password tidak cocok.');
        return;
      }
      if (!acceptTerms) {
        setError('Anda harus menerima Ketentuan Layanan.');
        return;
      }
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
            data: { full_name: name }
          },
        });

        if (error) {
          setError(error.message);
        } else if (data?.user && data.session === null) {
          setSuccess('Pendaftaran berhasil! Silakan cek email Anda untuk memverifikasi akun.');
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        } else {
          setSuccess('Registrasi sukses! Mengalihkan...');
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1500);
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message);
        } else {
          setSuccess('Berhasil masuk! Mengalihkan...');
          if (rememberMe) {
            localStorage.setItem('wc_remember_email', email);
          }
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
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
    <div className="min-h-screen bg-white dark:bg-slate-950 flex">
      {/* Left Side - Visual (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white">WitnessChain</h1>
          </Link>

          <h2 className="text-5xl font-black text-white mb-6 leading-tight">
            Setiap dokumentasi adalah langkah menuju keadilan
          </h2>

          {/* Features */}
          <div className="space-y-4">
            {[
              'Dokumentasi terstruktur dan kredibel',
              'Bukti terlindungi dengan hash encryption',
              'Siap diajukan ke LBH dan Polri'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-400 text-sm">
            Dipercaya oleh 1.200+ warga Indonesia untuk menjaga hak mereka
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">WitnessChain</span>
            </Link>
          </div>

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
          <div className="flex gap-1 mb-8 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 font-bold text-sm rounded-md transition-all ${
                !isSignUp
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 font-bold text-sm rounded-md transition-all ${
                isSignUp
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator (Sign Up only) */}
              {isSignUp && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all`}
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Minimal 8 karakter, huruf besar/kecil, angka, dan simbol
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Remember Me / Accept Terms */}
            {!isSignUp && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 dark:text-emerald-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">
                  Ingat saya
                </label>
              </div>
            )}

            {isSignUp && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 dark:text-emerald-500 mt-1 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400">
                  Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi untuk perlindungan data saya
                </label>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Proses...
                </span>
              ) : isSignUp ? (
                'Buat Akun'
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          {/* Divider */}
          {!isSignUp && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Atau</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Guest Continue */}
              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <LoginComponent />
    </Suspense>
  );
}