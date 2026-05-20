'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CaseTable } from '@/components/admin/CaseTable';
import type { Case } from '@/types';

import { Shield } from 'lucide-react';

export default function AdminPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    avgScore: 0,
  });

  useEffect(() => {
    const loadCases = async () => {
      try {
        const response = await fetch('/api/cases');
        const data = await response.json();
        setCases(data);

        // Calculate stats
        const total = data.length;
        const completed = data.filter((c: Case) => c.status === 'completed').length;
        const inProgress = data.filter((c: Case) => c.status === 'in_progress' || c.status === 'draft').length;
        const avgScore = data.length > 0
          ? Math.round(data.reduce((sum: number, c: Case) => sum + c.completeness_score, 0) / data.length)
          : 0;

        setStats({ total, completed, inProgress, avgScore });
      } catch (error) {
        console.error('Load cases error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  const handleViewDetail = (caseId: string) => {
    // In a real app, navigate to detail page
    window.open(`/result/${caseId}`, '_blank');
  };

  return (
    <div className="flex-1 min-h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500">


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard Admin
          </h1>
          <p className="text-slate-600">
            Monitor dan kelola semua kasus yang masuk ke WitnessChain.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm text-slate-600 mb-2">Total Kasus</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm text-slate-600 mb-2">Selesai</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm text-slate-600 mb-2">Dalam Proses</p>
                <p className="text-3xl font-bold text-amber-600">{stats.inProgress}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-sm text-slate-600 mb-2">Skor Rata-rata</p>
                <p className="text-3xl font-bold text-slate-900">{stats.avgScore}%</p>
              </div>
            </div>

            {/* Cases Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Daftar Kasus</h2>
              </div>
              <div className="p-6">
                <CaseTable cases={cases} onViewDetail={handleViewDetail} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
