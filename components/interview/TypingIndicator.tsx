import React from 'react';

interface TypingIndicatorProps {
  status?: string;
}

export function TypingIndicator({ status = 'Asisten sedang memikirkan respons...' }: TypingIndicatorProps) {
  return (
    <div className="flex flex-col gap-1.5 animate-fadeIn">
      <div className="flex gap-2.5 items-center">
        <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm">
          WC
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-3.5 rounded-2xl flex gap-1.5 shadow-sm border border-slate-200/50">
          <div
            className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-extrabold ml-10 animate-pulse tracking-wider uppercase">
        {status}
      </p>
    </div>
  );
}
