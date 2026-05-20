'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Scale, AlertTriangle, Clock, Info, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

export default function LegalRadarPage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<LegalAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [expandedPasal, setExpandedPasal] = useState<number | null>(null);

  const fetchAnalysis = async (data: Case) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/legal-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData: data }),
      });
      
      const resultData = await response.json();
      
      if (!response.ok) {
        throw new Error(resultData.error || 'Gagal menganalisis kasus');
      }
      
      setAnalysisResult(resultData);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghubungi server AI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('wc_case_data');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setCaseData(parsed);
        if (parsed.description) {
          fetchAnalysis(parsed);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error('Failed to parse case data', e);
      setLoading(false);
    }
  }, []);

  if (!loading && (!caseData || !caseData.description)) {
    return (
      <div className="flex-1 min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="max-w-2xl w-full flex flex-col items-center">
        <Scale className="w-24 h-24 text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Belum Ada Kasus untuk Dianalisis</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          Mulai dokumentasi kasusmu terlebih dahulu agar AI kami dapat menganalisis dan memberikan pandangan hukum awal.
        </p>
        <Button variant="primary" size="lg" onClick={() => router.push('/interview')}>
          Mulai Dokumentasi
        </Button>
      </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-emerald-700 font-semibold animate-pulse">AI sedang menganalisis kasusmu...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-32 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="max-w-2xl w-full flex flex-col items-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Analisis Gagal</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <Button variant="primary" onClick={() => caseData && fetchAnalysis(caseData)}>
          Coba Lagi
        </Button>
      </div>
      </div>
    );
  }

  if (!analysisResult) return null;

  const scoreLabel = 
    analysisResult.kekuatan_kasus <= 2 ? 'Lemah' : 
    analysisResult.kekuatan_kasus === 3 ? 'Cukup' : 
    analysisResult.kekuatan_kasus === 4 ? 'Kuat' : 'Sangat Kuat';
    
  const scoreGradient = 
    analysisResult.kekuatan_kasus <= 2 ? 'bg-linear-to-r from-red-50 to-red-100 border-red-200' : 
    analysisResult.kekuatan_kasus === 3 ? 'bg-linear-to-r from-amber-50 to-amber-100 border-amber-200' : 
    'bg-linear-to-r from-emerald-50 to-emerald-100 border-emerald-200';

  return (
    <div className="flex-1 min-h-full bg-slate-50 dark:bg-slate-950">
    <div className="max-w-2xl mx-auto px-4 py-6 pb-8 space-y-6">
      
      {/* Card 1: Kekuatan Kasus */}
      <div className={`p-6 rounded-2xl border shadow-sm ${scoreGradient}`}>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Kekuatan Kasus</h3>
        <div className="flex items-center gap-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={`text-3xl ${star <= analysisResult.kekuatan_kasus ? (analysisResult.kekuatan_kasus <= 2 ? 'text-red-500' : analysisResult.kekuatan_kasus === 3 ? 'text-amber-500' : 'text-emerald-500') : 'text-slate-300'}`}>
                ★
              </span>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-slate-900">{scoreLabel}</span>
            <span className="text-xs text-slate-600 font-medium">{analysisResult.pasal_dilanggar.length} pasal teridentifikasi</span>
          </div>
        </div>
      </div>

      {/* Card 2: Pasal yang Dilanggar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 dark:bg-slate-950/50">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            Pasal yang Berpotensi Dilanggar
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {analysisResult.pasal_dilanggar.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              Tidak ada pasal spesifik yang teridentifikasi dari informasi yang diberikan.
            </div>
          ) : (
            analysisResult.pasal_dilanggar.map((pasal, idx) => (
              <div key={idx} className="flex flex-col">
                <button 
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:bg-slate-950 transition-colors w-full text-left"
                  onClick={() => setExpandedPasal(expandedPasal === idx ? null : idx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md shrink-0">
                      {pasal.pasal}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{pasal.nama}</span>
                  </div>
                  {expandedPasal === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedPasal === idx && (
                  <div className="px-4 pb-4 pt-1 bg-slate-50 dark:bg-slate-950/50 text-sm text-slate-600 leading-relaxed border-t border-slate-100/50">
                    {pasal.penjelasan}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Card 3: Rekomendasi Langkah */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 dark:bg-slate-950/50">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Langkah yang Direkomendasikan
          </h3>
        </div>
        <div className="p-5 space-y-5">
          {analysisResult.rekomendasi.map((rek, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-sm border border-emerald-200">
                {rek.urutan}
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">{rek.langkah}</h4>
                <p className="text-sm text-slate-600">{rek.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card 4: Risiko */}
      {analysisResult.risiko && analysisResult.risiko.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-amber-200/50">
            <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Risiko yang Perlu Diantisipasi
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {analysisResult.risiko.map((r, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 font-medium">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card 5: Estimasi Timeline */}
      <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
        <div className="p-2 bg-slate-200 rounded-lg shrink-0">
          <Clock className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Estimasi Timeline</h3>
          <p className="text-sm text-slate-600">{analysisResult.estimasi_timeline}</p>
        </div>
      </div>

      {/* Card 6: Disclaimer */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          {analysisResult.disclaimer}
        </p>
      </div>

    </div>
    </div>
  );
}
