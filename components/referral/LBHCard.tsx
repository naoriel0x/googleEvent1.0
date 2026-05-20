'use client';

import type { LBH } from '@/types';
import { formatDistance } from '@/lib/maps';
import {
  Building2,
  MapPin,
  Phone,
  Navigation,
  ExternalLink,
  Scale,
} from 'lucide-react';

interface LBHCardProps {
  lbh: LBH;
  distance?: number;
}

const specLabels: Record<string, string> = {
  penggusuran: 'Penggusuran',
  sengketa_lahan: 'Sengketa Lahan',
  pencemaran_lingkungan: 'Pencemaran Lingkungan',
  pelanggaran_hak: 'Pelanggaran HAM',
};

export function LBHCard({ lbh, distance }: LBHCardProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lbh.lat},${lbh.lng}`;
  const telHref = lbh.phone.replace(/\s/g, '');

  return (
    <article className="group flex flex-col h-full bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-lg hover:border-emerald-200/80 dark:hover:border-emerald-600/40 transition-all duration-300 overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700/80 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
              {lbh.name}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{lbh.city}</p>
          </div>
          {distance !== undefined && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
              <Navigation className="w-3 h-3" />
              {formatDistance(distance)}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3.5 flex-1">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{lbh.address}</p>
        </div>

        <a
          href={`tel:${telHref}`}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/15">
            <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{lbh.phone}</span>
        </a>

        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Scale className="w-3 h-3" />
            Spesialisasi
          </p>
          <div className="flex flex-wrap gap-1.5">
            {lbh.specialization.map((spec) => (
              <span
                key={spec}
                className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-600/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
              >
                {specLabels[spec] || spec.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0 flex gap-2">
        <a
          href={`tel:${telHref}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
        >
          <Phone className="w-4 h-4" />
          Hubungi LBH
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
          title="Buka di Google Maps"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </article>
  );
}
