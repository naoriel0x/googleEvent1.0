'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Scale, AlertTriangle, Clock, Info, CheckCircle, ChevronDown, ChevronUp, ArrowRight, FileText, Calendar } from 'lucide-react';
import type { Case } from '@/types';

interface LegalAnalysis {
  kekuatan_kasus: number;
  pasal_dilanggar: Array<{
    pasal: string;
    nama: string;
    penjelasan: string;
  }>;
  rekomendasi: Array<{
    urutan: number;
    langkah: string;
    detail: string;
  }>;
  risiko: string[];
  estimasi_timeline: string;
  disclaimer: string;
}

// ─── State machine ────────────────────────────────────────────────────────────
type PageState =
  | { view: 'loading_cases' }
  | { view: 'no_case' }
  | { view: 'select_case'; cases: Case[] }
  | { view: 'analyzing'; caseData: Case }
  | { view: 'result'; caseData: Case; result: LegalAnalysis }
  | { view: 'error'; caseData: Case; message: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function truncate(text: string, max = 90) {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…';
}

const VIOLATION_LABEL: Record<string, string> = {
  penggusuran: 'Penggusuran',
  sengketa_lahan: 'Sengketa Lahan',
  pencemaran_lingkungan: 'Pencemaran Lingkungan',
  pelanggaran_hak: 'Pelanggaran Hak',
  lainnya: 'Lainnya',
};

function caseTitle(c: Case, idx: number): string {
  const type = c.violation_type ? VIOLATION_LABEL[c.violation_type] : null;
  const date = c.incident_date
    ? new Date(c.incident_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  if (type && date) return `${type} — ${date}`;
  if (type) return type;
  if (date) return `Kasus ${date}`;
  return `Kasus #${idx + 1}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BackgroundBlobs() {
  return (
    <>
      <div className="fixed top-0 right-0 w-[40%] h-[30%] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[35%] bg-teal-950/10 rounded-full blur-[140px] pointer-events-none z-0" />
    </>
  );
}

function LoadingCases() {
  return (
    <div className="flex-1 min-h-full bg-slate-950 text-slate-100 relative">
      <BackgroundBlobs />
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Memuat kasus…</p>
        </div>
      </div>
    </div>
  );
}

function NoCasePage({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 min-h-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-12 text-center relative">
      <BackgroundBlobs />
      <div className="max-w-2xl w-full flex flex-col items-center relative z-10">
        <Scale className="w-24 h-24 text-slate-400 mb-6" />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Belum Ada Kasus untuk Dianalisis</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          Mulai dokumentasi kasusmu terlebih dahulu agar AI kami dapat menganalisis dan memberikan pandangan hukum awal.
        </p>
        <Button variant="primary" size="lg" onClick={onStart}>
          Mulai Dokumentasi
        </Button>
      </div>
    </div>
  );
}

function SelectCasePage({ cases, onSelect }: { cases: Case[]; onSelect: (c: Case) => void }) {
  return (
    <div className="flex-1 min-h-full bg-slate-950 text-slate-100 relative">
      <BackgroundBlobs />
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            Legal Radar
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Pilih Kasus yang Ingin Dianalisis</h2>
          <p className="text-slate-400 text-sm">Kamu punya {cases.length} kasus. Pilih salah satu untuk dianalisis AI.</p>
        </div>

        {/* Case list */}
        <div className="space-y-3">
          {cases.map((c, idx) => (
            <button
              key={c.id ?? idx}
              onClick={() => onSelect(c)}
              className="w-full text-left group bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800 hover:border-emerald-700/50 rounded-2xl p-5 transition-all duration-200 flex items-start gap-4"
            >
              {/* Icon */}
              <div className="shrink-0 w-10 h-10 bg-slate-800 group-hover:bg-emerald-900/40 rounded-xl flex items-center justify-center transition-colors">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-100 truncate">
                    {caseTitle(c, idx)}
                  </span>
                  {idx === 0 && (
                    <span className="shrink-0 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
                      Terbaru
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {truncate(c.description ?? '', 120)}
                </p>
                {(c.created_at || c.updated_at) && (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(c.created_at || c.updated_at)}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ArrowRight className="shrink-0 w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all mt-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyzingPage() {
  return (
    <div className="flex-1 min-h-full bg-slate-950 text-slate-100 relative">
      <BackgroundBlobs />
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="w-12 h-12 border-4 border-emerald-600/30 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-emerald-300 font-semibold animate-pulse">AI sedang menganalisis kasusmu…</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-32 bg-slate-800/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorPage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex-1 min-h-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-12 text-center relative">
      <BackgroundBlobs />
      <div className="max-w-2xl w-full flex flex-col items-center relative z-10">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-100 mb-2">Analisis Gagal</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        <Button variant="primary" onClick={onRetry}>
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}

// ─── Main Result View ─────────────────────────────────────────────────────────

function ResultPage({
  result,
  onBack,
  hasMultiple,
}: {
  result: LegalAnalysis;
  onBack: () => void;
  hasMultiple: boolean;
}) {
  const [expandedPasal, setExpandedPasal] = useState<number | null>(null);

  const scoreLabel =
    result.kekuatan_kasus <= 2 ? 'Lemah' :
    result.kekuatan_kasus === 3 ? 'Cukup' :
    result.kekuatan_kasus === 4 ? 'Kuat' : 'Sangat Kuat';

  const scoreGradient =
    result.kekuatan_kasus <= 2
      ? 'bg-linear-to-r from-red-50 to-red-100 border-red-200'
      : result.kekuatan_kasus === 3
      ? 'bg-linear-to-r from-amber-50 to-amber-100 border-amber-200'
      : 'bg-linear-to-r from-emerald-50 to-emerald-100 border-emerald-200';

  return (
    <div className="flex-1 min-h-full bg-slate-950 text-slate-100 relative">
      <BackgroundBlobs />
      <div className="max-w-2xl mx-auto px-4 py-6 pb-8 space-y-6 relative z-10">

        {/* Back button — only shown when user came from the selection screen */}
        {hasMultiple && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
            Pilih kasus lain
          </button>
        )}

        {/* Card 1: Kekuatan Kasus */}
        <div className={`p-6 rounded-2xl border shadow-sm ${scoreGradient}`}>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Kekuatan Kasus</h3>
          <div className="flex items-center gap-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-3xl ${
                    star <= result.kekuatan_kasus
                      ? result.kekuatan_kasus <= 2
                        ? 'text-red-500'
                        : result.kekuatan_kasus === 3
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                      : 'text-slate-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-slate-100">{scoreLabel}</span>
              <span className="text-xs text-slate-400 font-medium">{result.pasal_dilanggar.length} pasal teridentifikasi</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pasal */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-800/80 bg-slate-800/40">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              Pasal yang Berpotensi Dilanggar
            </h3>
          </div>
          <div className="divide-y divide-slate-800/80">
            {result.pasal_dilanggar.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                Tidak ada pasal spesifik yang teridentifikasi dari informasi yang diberikan.
              </div>
            ) : (
              result.pasal_dilanggar.map((pasal, idx) => (
                <div key={idx} className="flex flex-col">
                  <button
                    className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors w-full text-left"
                    onClick={() => setExpandedPasal(expandedPasal === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-red-500/30 text-red-300 text-xs font-bold px-2 py-1 rounded-md shrink-0">
                        {pasal.pasal}
                      </span>
                      <span className="text-sm font-semibold text-slate-100">{pasal.nama}</span>
                    </div>
                    {expandedPasal === idx
                      ? <ChevronUp className="w-4 h-4 text-slate-500" />
                      : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {expandedPasal === idx && (
                    <div className="px-4 pb-4 pt-1 bg-slate-800/30 text-sm text-slate-300 leading-relaxed border-t border-slate-800/50">
                      {pasal.penjelasan}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 3: Rekomendasi */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 dark:bg-slate-950/50">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Langkah yang Direkomendasikan
            </h3>
          </div>
          <div className="p-5 space-y-5">
            {result.rekomendasi.map((rek, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-sm border border-emerald-200">
                  {rek.urutan}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{rek.langkah}</h4>
                  <p className="text-sm text-slate-700">{rek.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Risiko */}
        {result.risiko && result.risiko.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-amber-200/50">
              <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Risiko yang Perlu Diantisipasi
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {result.risiko.map((r, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 font-medium">{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card 5: Timeline */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2 bg-slate-200 rounded-lg shrink-0">
            <Clock className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Estimasi Timeline</h3>
            <p className="text-sm text-slate-700">{result.estimasi_timeline}</p>
          </div>
        </div>

        {/* Card 6: Disclaimer */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex gap-3 items-start">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            {result.disclaimer}
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Page (orchestrator) ──────────────────────────────────────────────────────

export default function LegalRadarPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({ view: 'loading_cases' });
  // track if user had multiple cases (so result page can show "back" btn)
  const [hadMultiple, setHadMultiple] = useState(false);

  // ── Fetch analysis ──────────────────────────────────────────────────────────
  const runAnalysis = async (caseData: Case) => {
    setState({ view: 'analyzing', caseData });
    try {
      const response = await fetch('/api/legal-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData }),
      });
      const resultData = await response.json();
      if (!response.ok) throw new Error(resultData.error || 'Gagal menganalisis kasus');
      setState({ view: 'result', caseData, result: resultData });
    } catch (err: any) {
      setState({
        view: 'error',
        caseData,
        message: err.message || 'Terjadi kesalahan saat menghubungi server AI',
      });
    }
  };

  // ── Initial load — collect ALL cases then decide ────────────────────────────
  useEffect(() => {
    const loadCases = async () => {
      try {
        const { supabaseClient } = await import('@/lib/supabase');
        const { data: { session } } = await supabaseClient.auth.getSession();

        let allCases: Case[] = [];

        // 1. Logged-in user: fetch all cases from API
        if (session?.access_token) {
          const res = await fetch('/api/cases', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              allCases = data
                .filter((c: Case) => c.description?.trim())
                .sort(
                  (a: Case, b: Case) =>
                    new Date(b.created_at || b.updated_at).getTime() -
                    new Date(a.created_at || a.updated_at).getTime()
                );
            }
          }
        }

        // 2. Fallback: session_id (guest / just finished interview)
        if (allCases.length === 0) {
          const sessionId = sessionStorage.getItem('sessionId');
          if (sessionId) {
            const headers: HeadersInit = {};
            if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
            const res = await fetch(`/api/cases?session_id=${sessionId}`, { headers });
            if (res.ok) {
              const data = await res.json();
              if (data?.description?.trim()) allCases = [data];
            }
          }
        }

        // 3. Last resort: localStorage (legacy)
        if (allCases.length === 0) {
          const storedData = localStorage.getItem('wc_case_data');
          if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed?.description?.trim()) allCases = [parsed];
          }
        }

        // ── Decide which state to enter ───────────────────────────────────────
        if (allCases.length === 0) {
          setState({ view: 'no_case' });
        } else if (allCases.length === 1) {
          // Single case → auto-analyze
          setHadMultiple(false);
          runAnalysis(allCases[0]);
        } else {
          // Multiple cases → let user pick
          setHadMultiple(true);
          setState({ view: 'select_case', cases: allCases });
        }
      } catch (e) {
        console.error('Failed to load cases for legal radar', e);
        setState({ view: 'no_case' });
      }
    };

    loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  switch (state.view) {
    case 'loading_cases':
      return <LoadingCases />;

    case 'no_case':
      return <NoCasePage onStart={() => router.push('/interview')} />;

    case 'select_case':
      return (
        <SelectCasePage
          cases={state.cases}
          onSelect={(c) => runAnalysis(c)}
        />
      );

    case 'analyzing':
      return <AnalyzingPage />;

    case 'error':
      return (
        <ErrorPage
          message={state.message}
          onRetry={() => runAnalysis(state.caseData)}
        />
      );

    case 'result':
      return (
        <ResultPage
          result={state.result}
          hasMultiple={hadMultiple}
          onBack={() => {
            // We don't re-fetch; re-enter select with already-loaded cases isn't stored.
            // Simplest: reload the page so the useEffect runs again.
            window.location.reload();
          }}
        />
      );
  }
}