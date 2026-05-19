import React from 'react';
import { Card } from '@/components/ui/Card';
import type { LBH } from '@/types';

interface LBHCardProps {
  lbh: LBH;
  distance?: number;
}

export function LBHCard({ lbh, distance }: LBHCardProps) {
  const specializations = lbh.specialization.map((s) =>
    s.replace(/_/g, ' ').toLowerCase()
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-2">{lbh.name}</h3>

      <div className="space-y-3 mb-4 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <span className="shrink-0 mt-0.5">📍</span>
          <div>
            <p>{lbh.address}</p>
            <p className="text-xs text-slate-500">{lbh.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>📞</span>
          <a
            href={`tel:${lbh.phone}`}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {lbh.phone}
          </a>
        </div>

        {distance !== undefined && (
          <div className="flex items-center gap-2">
            <span>📏</span>
            <p>
              <strong>{distance < 1 ? `${(distance * 1000).toFixed(0)}` : distance.toFixed(1)}</strong>
              {distance < 1 ? ' m' : ' km'} dari lokasi Anda
            </p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-slate-500 mb-2">SPESIALISASI:</p>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => (
            <span
              key={spec}
              className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      <a
        href={`tel:${lbh.phone}`}
        className="inline-block w-full px-4 py-2 bg-emerald-600 text-white text-center rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
      >
        Hubungi LBH
      </a>
    </Card>
  );
}
