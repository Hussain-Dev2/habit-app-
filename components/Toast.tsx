'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      border: 'border-green-400',
      icon: '✅',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-600',
      border: 'border-red-400',
      icon: '❌',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-purple-600',
      border: 'border-blue-400',
      icon: 'ℹ️',
    },
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 ${styles.bg} text-white px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${styles.border} z-50 animate-fade-in flex items-center gap-3 min-w-[300px]`}>
      <span className="text-2xl drop-shadow-lg">{styles.icon}</span>
      <span className="font-semibold text-base flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors ml-2 text-xl font-bold"
      >
        ×
      </button>
    </div>
  );
}