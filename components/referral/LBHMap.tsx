'use client';

import type { LBH } from '@/types';
import { MapPin, ExternalLink } from 'lucide-react';

interface LBHMapProps {
  center: { lat: number; lng: number };
  lbhList: LBH[];
}

function buildOsmEmbedUrl(lat: number, lng: number): string {
  const delta = 0.12;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function LBHMap({ center, lbhList }: LBHMapProps) {
  const embedUrl = buildOsmEmbedUrl(center.lat, center.lng);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm h-96 flex flex-col">
      <div className="flex-1 relative min-h-0">
        <iframe
          title="Peta lokasi LBH"
          width="100%"
          height="100%"
          className="absolute inset-0 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {lbhList.length} LBH di area peta
        </p>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          Buka di Google Maps
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
