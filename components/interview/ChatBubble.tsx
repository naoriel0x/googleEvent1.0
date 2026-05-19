import React from 'react';

interface ChatBubbleProps {
  role: 'ai' | 'user';
  content: string;
  timestamp?: string;
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`
        flex gap-3
        ${isUser ? 'justify-end' : 'justify-start'}
        mb-4
      `}
    >
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
          WC
        </div>
      )}

      <div
        className={`
          max-w-xs px-4 py-3 rounded-lg
          ${
            isUser
              ? 'bg-slate-900 text-white rounded-br-none'
              : 'bg-slate-100 text-slate-900 rounded-bl-none'
          }
        `}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </p>
        {timestamp && (
          <p
            className={`
              text-xs mt-1 opacity-70
              ${isUser ? 'text-slate-200' : 'text-slate-600'}
            `}
          >
            {new Date(timestamp).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold">
          U
        </div>
      )}
    </div>
  );
}
