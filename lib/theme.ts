'use client';

import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('wc_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return 'system';
}

function resolveTheme(): ThemeMode {
  const pref = getStoredPreference();
  if (pref === 'system') return getSystemTheme();
  return pref;
}

function applyTheme(mode: ThemeMode, animate = true) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 500);
  }
  if (mode === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

interface ThemeStore {
  isDark: boolean;
  preference: ThemePreference;
  initialized: boolean;
  init: () => () => void;
  setTheme: (dark: boolean) => void;
  toggle: () => void;
  syncFromSystem: () => void;
}

export const useTheme = create<ThemeStore>((set, get) => ({
  isDark: false,
  preference: 'system',
  initialized: false,

  init: () => {
    const pref = getStoredPreference();
    const mode = resolveTheme();
    applyTheme(mode, false);
    set({ isDark: mode === 'dark', preference: pref, initialized: true });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if (getStoredPreference() === 'system') {
        const next = getSystemTheme();
        applyTheme(next, true);
        set({ isDark: next === 'dark', preference: 'system' });
      }
    };

    mq.addEventListener('change', onSystemChange);
    return () => mq.removeEventListener('change', onSystemChange);
  },

  syncFromSystem: () => {
    if (getStoredPreference() !== 'system') return;
    const mode = getSystemTheme();
    applyTheme(mode, true);
    set({ isDark: mode === 'dark', preference: 'system' });
  },

  setTheme: (dark: boolean) => {
    const mode: ThemeMode = dark ? 'dark' : 'light';
    applyTheme(mode, true);
    localStorage.setItem('wc_theme', mode);
    set({ isDark: dark, preference: mode });
  },

  toggle: () => {
    const next = !get().isDark;
    get().setTheme(next);
  },
}));

export { applyTheme, resolveTheme, getSystemTheme, getStoredPreference };
