import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'ai' | 'user';
  content: string;
  timestamp?: string;
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
          <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}

      <div
        className={`
          max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl shadow-sm
          ${
            isUser
              ? 'bg-emerald-600 text-white rounded-br-md'
              : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md'
          }
        `}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        {timestamp && (
          <p
            className={`text-[10px] mt-2 font-medium ${
              isUser ? 'text-emerald-100/80' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {isUser && (
        <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 border border-slate-300/80 dark:border-slate-600 flex items-center justify-center">
          <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </div>
      )}
    </div>
  );
}
