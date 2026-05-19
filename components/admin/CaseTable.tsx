import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { Case } from '@/types';

interface CaseTableProps {
  cases: Case[];
  onViewDetail: (caseId: string) => void;
}

export function CaseTable({ cases, onViewDetail }: CaseTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="neutral">Draft</Badge>;
      case 'in_progress':
        return <Badge variant="warning">Dalam Proses</Badge>;
      case 'completed':
        return <Badge variant="success">Selesai</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score < 50) return <Badge variant="danger">{score}%</Badge>;
    if (score < 80) return <Badge variant="warning">{score}%</Badge>;
    return <Badge variant="success">{score}%</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Belum ada kasus yang masuk</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left font-semibold text-slate-900">
              No. Kasus
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-900">
              Jenis
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-900">
              Status
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-900">
              Skor
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-900">
              Dibuat
            </th>
            <th className="px-4 py-3 text-center font-semibold text-slate-900">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem) => (
            <tr key={caseItem.id} className="border-b border-slate-200 hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {caseItem.id.substring(0, 8)}...
              </td>
              <td className="px-4 py-3 text-slate-900">
                {caseItem.violation_type
                  ?.replace(/_/g, ' ')
                  .toUpperCase() || '-'}
              </td>
              <td className="px-4 py-3">{getStatusBadge(caseItem.status)}</td>
              <td className="px-4 py-3">{getScoreBadge(caseItem.completeness_score)}</td>
              <td className="px-4 py-3 text-slate-600">
                {formatDate(caseItem.created_at)}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onViewDetail(caseItem.id)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                >
                  Lihat Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
