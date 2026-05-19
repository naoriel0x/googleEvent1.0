'use client';

import { useState, useEffect } from 'react';
import { Flame, Shield, FileText, Users, Camera, ClipboardList } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  description: string;
  type: 'incident' | 'document' | 'witness' | 'authority' | 'evidence' | 'report';
  isCritical?: boolean;
}

interface Props {
  events: TimelineEvent[];
}

export function TimelineVisualizer({ events }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 border border-slate-200 rounded-2xl border-dashed">
        <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-600 font-bold mb-1">Belum ada kronologi yang tercatat</p>
        <p className="text-sm text-slate-400">Kronologi akan muncul setelah proses wawancara selesai</p>
      </div>
    );
  }

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getConfig = (type: string) => {
    switch (type) {
      case 'incident': return { icon: Flame, bg: 'bg-red-500', border: 'border-l-red-400', cardBg: 'bg-red-50' };
      case 'authority': return { icon: Shield, bg: 'bg-orange-500', border: 'border-l-orange-400', cardBg: 'bg-orange-50' };
      case 'document': return { icon: FileText, bg: 'bg-blue-500', border: 'border-l-blue-400', cardBg: 'bg-blue-50' };
      case 'witness': return { icon: Users, bg: 'bg-purple-500', border: 'border-l-purple-400', cardBg: 'bg-purple-50' };
      case 'evidence': return { icon: Camera, bg: 'bg-emerald-500', border: 'border-l-emerald-400', cardBg: 'bg-emerald-50' };
      case 'report': default: return { icon: ClipboardList, bg: 'bg-slate-500', border: 'border-l-slate-400', cardBg: 'bg-slate-50' };
    }
  };

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
      {sortedEvents.map((event, index) => {
        const config = getConfig(event.type);
        const Icon = config.icon;
        
        return (
          <div 
            key={event.id}
            className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            {/* Dot */}
            <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white ${config.bg} shadow-sm z-10`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>

            {/* Card */}
            <div className={`w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 ${config.border} ${config.cardBg}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {event.time && ` • ${event.time}`}
                </span>
                {event.isCritical && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">KRITIS</span>
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">{event.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
