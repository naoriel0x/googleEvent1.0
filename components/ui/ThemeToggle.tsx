'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { isDark, toggle, init } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    init()
    setMounted(true)
  }, [init])

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-all duration-200 hover:scale-110"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 animate-spin" style={{ animationDuration: '3s' }} />
      )}
    </button>
  )
}
