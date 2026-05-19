'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AlertModalProps {
  isOpen: boolean
  title: string
  message: string
  icon?: React.ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function AlertModal({
  isOpen,
  title,
  message,
  icon,
  primaryAction,
  secondaryAction
}: AlertModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95">
        <div className="p-6 md:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {icon || <AlertCircle className="w-12 h-12 text-amber-500" />}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-300 text-center text-sm leading-relaxed mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm"
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
