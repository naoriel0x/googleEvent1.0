'use client';

import React from 'react';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface ProgressTrackerProps {
  score: number;
  hasReporterName: boolean;
  hasViolationType: boolean;
  hasIncidentDate: boolean;
  hasIncidentLocation: boolean;
  hasDescription: boolean;
  hasWitnesses: boolean;
  hasEvidence: boolean;
  isThinking?: boolean;
}

export function ProgressTracker({
  score,
  hasReporterName,
  hasViolationType,
  hasIncidentDate,
  hasIncidentLocation,
  hasDescription,
  hasWitnesses,
  hasEvidence,
  isThinking = false,
}: ProgressTrackerProps) {
  const items = [
    { label: 'Nama pelapor', checked: hasReporterName },
    { label: 'Jenis pelanggaran', checked: hasViolationType },
    { label: 'Tanggal kejadian', checked: hasIncidentDate },
    { label: 'Lokasi kejadian', checked: hasIncidentLocation },
    { label: 'Deskripsi kejadian', checked: hasDescription },
    { label: 'Saksi', checked: hasWitnesses },
    { label: 'Bukti fisik', checked: hasEvidence },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex flex-col items-center gap-4 mb-6">
        <ProgressRing score={score} size={120} isThinking={isThinking} />
        <div className="text-center">
          <p className="text-sm text-slate-600">Kelengkapan Data</p>
          <p className="text-xs text-slate-500 mt-1">
            {score < 50
              ? 'Perlu banyak dilengkapi'
              : score < 80
                ? 'Hampir selesai'
                : 'Siap untuk dokumen'}
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            {item.checked ? (
              <svg
                className="w-5 h-5 text-emerald-600 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-slate-300 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <circle cx="10" cy="10" r="8" stroke="currentColor" fill="none" strokeWidth="2" />
              </svg>
            )}
            <span
              className={`text-sm ${
                item.checked ? 'text-slate-900 font-medium' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
