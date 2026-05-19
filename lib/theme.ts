'use client'

import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggle: () => void
  init: () => void
}

export const useTheme = create<ThemeStore>((set) => ({
  isDark: false,
  toggle: () => set((state) => {
    const newDark = !state.isDark
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('wc_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('wc_theme', 'light')
    }
    return { isDark: newDark }
  }),
  init: () => {
    const saved = localStorage.getItem('wc_theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    if (isDark) document.documentElement.classList.add('dark')
    set({ isDark })
  }
}))
