import React from 'react';
import type { Evidence } from '@/types';
import { Camera, Video, FileText } from 'lucide-react';

interface EvidenceTimelineProps {
  evidence: Evidence[];
}

export function EvidenceTimeline({ evidence }: EvidenceTimelineProps) {
  const sortedEvidence = [...evidence].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (evidence.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-xl">
        <p className="text-sm font-medium text-slate-400">Belum ada bukti yang diupload</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedEvidence.map((item) => (
        <div
          key={item.id}
          className="border border-slate-200 bg-white rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100/50 shadow-sm">
              {item.type === 'photo' ? (
                <Camera className="w-6 h-6" />
              ) : item.type === 'video' ? (
                <Video className="w-6 h-6" />
              ) : (
                <FileText className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  {item.type === 'photo' ? 'Foto' : item.type === 'video' ? 'Video' : 'Dokumen'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {new Date(item.timestamp).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                {item.name || `${item.type === 'photo' ? 'Foto' : item.type === 'video' ? 'Video' : 'Dokumen'} Kasus`}
              </p>
              {item.description && (
                <p className="text-sm text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                  &ldquo;{item.description}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
