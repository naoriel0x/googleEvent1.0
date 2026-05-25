'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getSupabaseClient } from '@/lib/supabase';
import type { Case } from '@/types';
import {
  ClipboardList,
  FileText,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  Lock,
  Calendar,
} from 'lucide-react';

function hasCaseContent(item: Case): boolean {
  return !!(
    item.id &&
    (item.reporter_name ||
      item.description?.trim() ||
      item.violation_type ||
      item.incident_location ||
      (item.messages && item.messages.length > 0) ||
      (item.evidence && item.evidence.length > 0))
  );
}

function formatTimestamp(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ResultIndexPage() {
  const supabaseClient = getSupabaseClient();
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const collected: Case[] = [];
        const seen = new Set<string>();

        const addCase = (item: Case | null | undefined) => {
          if (!item?.id || seen.has(item.id) || !hasCaseContent(item)) return;
          seen.add(item.id);
          collected.push(item);
        };

        const { data: { session } } = await supabaseClient.auth.getSession();
        const headers: HeadersInit = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        if (session?.access_token) {
          // Fetch semua kasus user — sudah include semua case milik user ini
          const res = await fetch('/api/cases', { headers });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              data.forEach((item: Case) => addCase(item));
            }
          }
          // Kalau sudah login, SKIP session_id fetch karena
          // API /api/cases sudah return semua case milik user ini
          // (termasuk case yang dibuat saat ini) → cegah duplikat
        } else {
          // Guest mode: hanya ambil dari session_id
          const sessionId =
            typeof window !== 'undefined' ? sessionStorage.getItem('sessionId') : null;
          if (sessionId) {
            const res = await fetch(`/api/cases?session_id=${sessionId}`, { headers });
            if (res.ok) {
              const data = await res.json();
              addCase(data);
            }
          }
        }

        collected.sort(
          (a, b) =>
            new Date(b.created_at || b.updated_at).getTime() -
            new Date(a.created_at || a.updated_at).getTime()
        );
        setCases(collected);
      } catch (error) {
        console.error('Load result cases error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-950 text-white flex items-center justify-center relative">
        <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="text-center space-y-4 relative z-10">
          <Spinner size="lg" className="mx-auto text-emerald-500" />
          <p className="text-sm font-semibold text-slate-400">Memuat hasil dokumentasi...</p>
        </div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="min-h-dvh bg-slate-950 text-white relative">
        <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none" />
        <main className="max-w-lg mx-auto px-4 pt-8 pb-12 flex flex-col items-center text-center relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <ClipboardList className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            Belum Ada Hasil Dokumentasi
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-sm">
            Kamu belum membuat dokumentasi kasus. Mulai sesi wawancara terlebih dahulu,
            lalu hasil lengkapnya akan muncul di halaman ini.
          </p>
          <Link href="/interview" className="w-full max-w-xs">
            <Button variant="primary" size="lg" className="w-full font-bold">
              <Plus className="w-5 h-5" />
              Mulai Dokumentasi
            </Button>
          </Link>
          <Link
            href="/dashboard"
            className="mt-4 text-xs font-semibold text-slate-500 hover:text-emerald-400 transition-colors"
          >
            Kembali ke Dashboard
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-white relative">
      {/* Background blobs — sama persis kayak dashboard */}
      <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Hasil Dokumentasi</h1>
          <p className="text-sm text-slate-400 mt-1">
            Pilih kasus untuk melihat ringkasan, kelengkapan berkas, dan unduh PDF.
          </p>
        </div>

        <ul className="space-y-3">
          {cases.map((item) => {
            const isCompleted = item.status === 'completed';
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/result/${item.id}`)}
                  className="w-full text-left bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-emerald-500/40 hover:bg-slate-900/80 hover:shadow-emerald-900/20 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex-shrink-0">
                        <FileText className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono font-bold text-slate-500 mb-1">
                          #{item.id.substring(0, 8).toUpperCase()}
                        </p>
                        <h2 className="font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {item.violation_type?.replace(/_/g, ' ').toUpperCase() ||
                            item.reporter_name ||
                            'Dokumentasi Kasus'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {item.incident_location || item.reporter_name || 'Lanjutkan pengisian data'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 flex-shrink-0 mt-1 transition-colors" />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Permanen
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Draf
                        </span>
                      )}
                      {/* Timestamp */}
                      {item.created_at && (
                        <span className="text-[10px] text-slate-600 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatTimestamp(item.created_at)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {item.completeness_score ?? 0}% lengkap
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <Link href="/interview">
          <Button variant="secondary" className="w-full font-bold border-slate-700 text-slate-300 hover:text-white hover:border-slate-600">
            <Plus className="w-4 h-4" />
            Buat Dokumentasi Baru
          </Button>
        </Link>
      </main>
    </div>
  );
}