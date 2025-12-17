'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/client';

export interface SmartPointsData {
  id: string;
  points: number;
  clicks: number;
  dailyEarnings: number;
  lifetimePoints: number;
  pointsFromAds: number;
  pointsFromTasks: number;
  lastActivityAt: Date | null;
  streakDays: number;
  totalSessionTime: number;
}

export interface DailyStat {
  date: string;
  clicksToday: number;
  pointsEarned: number;
  adsWatched: number;
  tasksCompleted: number;
}

export function useSmartPoints() {
  const { data: session, status } = useSession();
  const [pointsData, setPointsData] = useState<SmartPointsData | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch smart points data
  const fetchPointsData = useCallback(async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch<SmartPointsData>(
        '/points/stats'
      );
      setPointsData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch points data');
      console.error('Error fetching points data:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Fetch daily stats
  const fetchDailyStats = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      const response = await apiFetch<DailyStat[]>(
        '/points/daily-stats?days=7'
      );
      setDailyStats(response);
    } catch (err) {
      console.error('Error fetching daily stats:', err);
    }
  }, [status]);

  // Initial fetch
  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      Promise.all([fetchPointsData(), fetchDailyStats()]).finally(() => {
        setLoading(false);
      });
    }
  }, [status, fetchPointsData, fetchDailyStats]);

  // Refresh data periodically - increased interval to reduce server load
  useEffect(() => {
    if (status !== 'authenticated') return;

    const interval = setInterval(() => {
      fetchPointsData();
    }, 45000); // Refresh every 45 seconds instead of 30

    return () => clearInterval(interval);
  }, [status, fetchPointsData]);

  return {
    pointsData,
    dailyStats,
    loading,
    error,
    refetch: fetchPointsData,
    refetchDailyStats: fetchDailyStats,
  };
}
