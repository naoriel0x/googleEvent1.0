import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface CompletenessDisplayProps {
  score: number;
}

export function CompletenessDisplay({ score }: CompletenessDisplayProps) {
  let statusLabel: string;
  let statusColor: 'danger' | 'warning' | 'success';

  if (score < 50) {
    statusLabel = 'Perlu Dilengkapi';
    statusColor = 'danger';
  } else if (score < 80) {
    statusLabel = 'Hampir Selesai';
    statusColor = 'warning';
  } else {
    statusLabel = 'Siap Diunduh';
    statusColor = 'success';
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8">
      <div className="flex flex-col items-center gap-6">
        <ProgressRing score={score} size={140} strokeWidth={10} />
        <div className="text-center">
          <Badge variant={statusColor}>{statusLabel}</Badge>
          <p className="mt-3 text-slate-600 text-sm">
            {score < 50
              ? 'Kasus masih memerlukan informasi tambahan untuk membuat dokumen yang kuat'
              : score < 80
                ? 'Hampir semua informasi penting sudah terkumpul'
                : 'Dokumen Anda siap untuk dibawa ke LBH atau institusi hak asasi manusia'}
          </p>
        </div>
      </div>
    </div>
  );
}
