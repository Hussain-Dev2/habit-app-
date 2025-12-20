'use client';

import { useEffect, useState } from 'react';

interface BannedViewProps {
  expiresAt: string | null;
}

export default function BannedView({ expiresAt }: BannedViewProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft('Forever');
      return;
    }

    const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(expiresAt);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) {
            window.location.reload(); // Reload to check for unban
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-slate-800 border-2 border-red-600 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
          🚫
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Account Suspended</h1>
        <p className="text-slate-400 mb-6">
          Your account has been restricted due to violations of our community guidelines.
        </p>

        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-8">
          <p className="text-red-400 text-sm uppercase tracking-wider font-semibold mb-1">
            Suspension Lifted In
          </p>
          <p className="text-3xl font-mono font-bold text-white">
            {timeLeft || '---'}
          </p>
        </div>

        <div className="text-sm text-slate-500 p-4 border-t border-slate-700">
          <p>Think this is a mistake?</p>
          <a href="mailto:support@reckon.com" className="text-blue-400 hover:text-blue-300 font-medium">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
