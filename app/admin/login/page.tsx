// app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal.');
        return;
      }

      // Redirect ke admin dashboard
      router.replace('/admin');
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-slate-950 flex items-center justify-center px-4 relative">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-1">WitnessChain — Akses Terbatas</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@witnesschain.id"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none rounded-xl text-sm text-white placeholder-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none rounded-xl text-sm text-white placeholder-slate-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi...
                </span>
              ) : 'Masuk ke Admin Panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          Halaman ini hanya untuk administrator WitnessChain
        </p>
      </div>
    </div>
  );
}