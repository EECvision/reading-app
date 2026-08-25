'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Theme } from '@/types';
import { getSettings, saveTheme } from '@/lib/localStorage';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start with 'dark' so server and client render identically on the
  // first pass. The real saved theme is applied after mount (see effect below).
  const [theme, setTheme] = useState<Theme>('dark');

  // Apply saved theme from localStorage after mount
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const saved = getSettings().theme;
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } catch {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
