'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/client';
import { formatPoints } from '@/lib/points-utils';

interface HistoryEntry {
  id: string;
  amount: number;
  source: string;
  description?: string;
  createdAt: string;
}

const SOURCE_ICONS: Record<string, string> = {
  click: '👆',
  ad: '📺',
  task: '✅',
  purchase: '🛒',
  achievement: '🏆',
  bonus: '🎁',
};

export default function PointsHistoryComponent() {
  const { status } = useSession();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchHistory = async () => {
      try {
        const response = await apiFetch<{ history: HistoryEntry[] }>(
          '/points/history?limit=20'
        );
        setHistory(response.history);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [status]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-blue-200/50 dark:bg-white/10 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">📜 Points History</h2>

      {history.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No points history yet.</p>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl">
                  {SOURCE_ICONS[entry.source] || '💫'}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white capitalize">
                    {entry.source}
                  </p>
                  {entry.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {entry.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 dark:text-green-400">
                  +{formatPoints(entry.amount)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {new Date(entry.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
