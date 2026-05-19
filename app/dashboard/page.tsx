'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Case } from '@/types';
import {
  Shield,
  Plus,
  FileText,
  Users,
  Download,
  Lock,
  Search,
  LogOut,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  LayoutDashboard
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'completed'>('all');
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    completed: 0,
    avgCompleteness: 0
  });

  const calculateStats = useCallback((items: Case[]) => {
    const total = items.length;
    const drafts = items.filter(c => c.status !== 'completed').length;
    const completed = items.filter(c => c.status === 'completed').length;
    const totalCompleteness = items.reduce((acc, c) => acc + (c.completeness_score || 0), 0);
    const avgCompleteness = total > 0 ? Math.round(totalCompleteness / total) : 0;
    setStats({ total, drafts, completed, avgCompleteness });
  }, []);

  const loadUserCases = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/cases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCases(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // Check auth session
  // Check auth session
  useEffect(() => {
    const checkUser = async () => {
      try {
        // 1. Cek apakah user menggunakan mode Guest
        const isGuest = localStorage.getItem('wc_guest_mode') === 'true';
        
        // 2. Cek session dari Supabase
        const { data: { session } } = await supabaseClient.auth.getSession();

        // 3. Logika Redirect: Jika TIDAK ada session DAN BUKAN guest, lempar ke login
        if (!session && !isGuest) {
          router.push('/login?redirect=/dashboard');
        } 
        // 4. Jika ada session (User Login Normal)
        else if (session) {
          setUser(session.user);
          loadUserCases(session.access_token);
        } 
        // 5. Jika Guest Mode (Tidak ada session tapi isGuest true)
        else if (isGuest) {
          setLoading(false); // Matikan loading agar dashboard bisa tampil kosong
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login?redirect=/dashboard');
      }
    };

    checkUser();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (session) {
        setUser(session.user);
        // Tambahan opsi keamanan: hapus status guest jika akhirnya mereka login
        localStorage.removeItem('wc_guest_mode');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, loadUserCases]);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  const resumeDraft = (item: Case) => {
    // Store in session storage so the interview page can pickup the draft case session
    sessionStorage.setItem('sessionId', item.session_id);
    router.push('/interview');
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      (c.reporter_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.violation_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.incident_location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true :
        statusFilter === 'completed' ? c.status === 'completed' :
          c.status !== 'completed';

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto text-emerald-500" />
          <p className="text-slate-400 text-sm font-semibold">Memuat Data Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative pb-16">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="bg-slate-900/60 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                WitnessChain <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">DASHBOARD</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full">
              Sesi Aktif: <strong className="text-emerald-400">{user?.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all duration-200 flex items-center gap-2 text-xs font-bold"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 z-10 relative">
        {/* Banner header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-emerald-400" />
              Selamat Datang Kembali
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Pantau laporan pelanggaran, draf kelengkapan berkas, dan unduh salinan berkas resmi Anda.
            </p>
          </div>
          <Link href="/interview">
            <Button
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 font-extrabold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-emerald-900/30 flex items-center gap-2 group transition-all"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
              Mulai Kasus Baru
            </Button>
          </Link>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-slate-800 transition-all">
            <div className="p-3.5 bg-slate-800/50 text-slate-300 rounded-xl border border-slate-800 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Kasus</p>
              <p className="text-2xl font-black text-white mt-0.5">{stats.total}</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-slate-800 transition-all">
            <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Draf Aktif</p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">{stats.drafts}</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-slate-800 transition-all">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Simpan Permanen</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">{stats.completed}</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-slate-800 transition-all">
            <div className="p-3.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Rata Kelengkapan</p>
              <p className="text-2xl font-black text-teal-400 mt-0.5">{stats.avgCompleteness}%</p>
            </div>
          </div>
        </div>

        {/* Case List Controls */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari ID Kasus, Pelapor, Lokasi..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl text-xs placeholder-slate-650 text-white transition-all"
              />
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-end md:self-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-350'
                  }`}
              >
                Semua ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'draft' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-350'
                  }`}
              >
                Draf ({stats.drafts})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'completed' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-350'
                  }`}
              >
                Simpan Permanen ({stats.completed})
              </button>
            </div>
          </div>

          {/* Cases grid list */}
          {filteredCases.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/40 rounded-2xl border border-slate-850/50">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-sm text-slate-400 font-bold">Tidak ada berkas kasus ditemukan</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Silakan mulai sesi wawancara asisten baru untuk mencatat berkas kasus Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map((item) => {
                const isCompleted = item.status === 'completed';
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-slate-700/80 transition-all duration-205 group hover:-translate-y-0.5"
                  >
                    <div className="space-y-4">
                      {/* Header Card */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850">
                          #{item.id.substring(0, 8).toUpperCase()}
                        </span>

                        {isCompleted ? (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Permanen
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Draf Kasus
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-white text-base truncate group-hover:text-emerald-400 transition-colors">
                          {item.violation_type?.replace(/_/g, ' ').toUpperCase() || 'JENIS PELANGGARAN DRAF'}
                        </h3>

                        <div className="space-y-1.5 text-xs text-slate-400 font-medium">
                          <p className="flex items-center gap-2 truncate">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            Pelapor: <strong className="text-slate-300 ml-0.5">{item.reporter_name || 'Tamu / Anonim'}</strong>
                          </p>
                          {item.incident_location && (
                            <p className="flex items-center gap-2 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              Lokasi: <span className="text-slate-300 ml-0.5">{item.incident_location}</span>
                            </p>
                          )}
                          {item.incident_date && (
                            <p className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              Tanggal: <span className="text-slate-300 ml-0.5">
                                {new Date(item.incident_date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress Completeness */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>Kelengkapan Berkas</span>
                          <span className={`${item.completeness_score >= 70 ? 'text-emerald-400' : 'text-amber-400'
                            }`}>{item.completeness_score}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850/50">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${item.completeness_score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            style={{ width: `${item.completeness_score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Card */}
                    <div className="mt-5 pt-4 border-t border-slate-850 flex items-center justify-between gap-3">
                      <Link
                        href={`/result/${item.id}`}
                        className="text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                      >
                        Detail Kasus <ArrowRight className="w-3 h-3" />
                      </Link>

                      {isCompleted ? (
                        item.document_url ? (
                          <button
                            onClick={() => window.open(item.document_url, '_blank')}
                            className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> Unduh PDF
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold italic">PDF belum dibuat</span>
                        )
                      ) : (
                        <button
                          onClick={() => resumeDraft(item)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-1.5 px-3 rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                          Lanjutkan Wawancara
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
