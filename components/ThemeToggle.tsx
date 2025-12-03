'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="relative inline-flex items-center justify-center w-11 h-11 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200 shadow-lg hover:shadow-xl"
      aria-label="Toggle theme"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`absolute text-lg transition-all duration-300 ${dark ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        🌙
      </span>
      <span className={`absolute text-lg transition-all duration-300 ${dark ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
        ☀️
      </span>
    </button>
  );
}