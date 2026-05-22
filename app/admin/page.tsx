// app/admin/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Case } from '@/types';
import {
  Shield, FileText, CheckCircle, Clock, TrendingUp,
  Trash2, ExternalLink, LogOut, Search, AlertTriangle,
  RefreshCw, X, Lock,
} from 'lucide-react';

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({
  caseItem,
  onConfirm,
  onCancel,
  loading,
}: {
  caseItem: Case;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-bold text-white">Hapus Dokumen</h3>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4">
          <p className="text-[10px] font-mono text-slate-500 mb-1">#{caseItem.id.substring(0, 8).toUpperCase()}</p>
          <p className="text-sm font-bold text-white">
            {caseItem.violation_type?.replace(/_/g, ' ').toUpperCase() || 'Dokumentasi Kasus'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{caseItem.reporter_name || 'Anonim'}</p>
        </div>

        <div className="flex items-start gap-2 bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            Dokumen ini akan dihapus permanen dari database dan storage. Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 rounded-xl text-sm font-semibold transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menghapus...
              </span>
            ) : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Case | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cases');
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setCases(data);
    } catch {
      showToast('Gagal memuat data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadCases(); }, [loadCases]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.replace('/admin/login');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/cases?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error || 'Gagal menghapus.', 'error');
        return;
      }
      setCases(prev => prev.filter(c => c.id !== deleteTarget.id));
      showToast('Dokumen berhasil dihapus.', 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Terjadi kesalahan.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const stats = {
    total: cases.length,
    completed: cases.filter(c => c.status === 'completed').length,
    drafts: cases.filter(c => c.status !== 'completed').length,
    avgScore: cases.length > 0
      ? Math.round(cases.reduce((s, c) => s + (c.completeness_score || 0), 0) / cases.length)
      : 0,
  };

  const filtered = cases.filter(c =>
    (c.reporter_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.violation_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.incident_location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-dvh bg-slate-950 text-white relative">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          caseItem={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Navbar */}
      <div className="sticky top-0 z-40 w-full flex justify-center pt-3 pb-1 pointer-events-none">
        <header className="pointer-events-auto flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl border bg-slate-900/85 border-slate-700/70 backdrop-blur-2xl shadow-2xl"
          style={{ width: 'min(860px, calc(100vw - 2rem))' }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-xl">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-sm font-black text-white tracking-tight">WitnessChain</span>
            <span className="text-[8px] bg-red-500/15 border border-red-500/25 text-red-400 px-1.5 py-0.5 rounded-full font-bold tracking-wider">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadCases}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 bg-slate-800/50 rounded-xl text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-red-500/15 border border-slate-700/50 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-xl text-xs font-semibold transition-all"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline text-[11px]">Keluar</span>
            </button>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6 relative z-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white">Dashboard Admin</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor dan kelola semua kasus yang masuk ke WitnessChain.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-sm font-semibold">Memuat data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Kasus', value: stats.total, icon: <FileText className="w-5 h-5" />, color: 'slate', textColor: 'text-white' },
                { label: 'Selesai / Permanen', value: stats.completed, icon: <CheckCircle className="w-5 h-5" />, color: 'emerald', textColor: 'text-emerald-400' },
                { label: 'Draf Aktif', value: stats.drafts, icon: <Clock className="w-5 h-5" />, color: 'amber', textColor: 'text-amber-400' },
                { label: 'Rata Kelengkapan', value: `${stats.avgScore}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'teal', textColor: 'text-teal-400' },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
                  <div className={`p-3 bg-${s.color}-500/10 text-${s.color}-400 rounded-xl border border-${s.color}-500/20 flex-shrink-0`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{s.label}</p>
                    <p className={`text-2xl font-black mt-0.5 ${s.textColor}`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl shadow-xl overflow-hidden">
              {/* Search bar */}
              <div className="p-5 border-b border-slate-800/60 flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Cari kasus..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl text-xs placeholder-slate-600 text-white transition-all"
                  />
                </div>
                <span className="text-xs text-slate-500 font-semibold">{filtered.length} kasus</span>
              </div>

              {/* Table content */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60">
                      {['ID', 'Jenis', 'Pelapor', 'Lokasi', 'Tanggal Dibuat', 'Status', 'Skor', 'Aksi'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-16 text-center text-slate-500 text-sm">
                          Tidak ada kasus ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(item => {
                        const isCompleted = item.status === 'completed';
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/20 transition-colors group">
                            <td className="px-4 py-3">
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                #{item.id.substring(0, 8).toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold text-white">
                                {item.violation_type?.replace(/_/g, ' ').toUpperCase() || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {item.reporter_name || <span className="text-slate-600 italic">Anonim</span>}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400 max-w-[150px] truncate">
                              {item.incident_location || '—'}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                  })
                                : '—'}
                            </td>
                            <td className="px-4 py-3">
                              {isCompleted ? (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                  <Lock className="w-2.5 h-2.5" /> Permanen
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                  <Clock className="w-2.5 h-2.5" /> Draf
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${item.completeness_score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${item.completeness_score}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-bold ${item.completeness_score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {item.completeness_score}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => window.open(`/result/${item.id}`, '_blank')}
                                  className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                  title="Lihat Detail"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(item)}
                                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                  title="Hapus Dokumen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}