'use client';

/**
 * HabitStats Component
 * 
 * Displays user's habit statistics at a glance
 */

import { useEffect, useState } from 'react';

interface Stats {
  totalHabits: number;
  activeHabits: number;
  todayCompletions: number;
  weekCompletions: number;
  longestStreak: number;
  habitsCompleted: number;
}

export function HabitStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/habits/stats');
        if (res.ok) {
          setStats(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>;
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    { label: 'Total Habits', value: stats.totalHabits, icon: '📌', color: 'blue' },
    { label: 'Active Habits', value: stats.activeHabits, icon: '✓', color: 'green' },
    { label: 'Completed Today', value: stats.habitsCompleted, icon: '📅', color: 'purple' },
    { label: 'This Week', value: stats.weekCompletions, icon: '📊', color: 'orange' },
    { label: 'Longest Streak', value: stats.longestStreak, icon: '🔥', color: 'red' },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
    green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700',
    red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg p-4 border text-center ${colorClasses[card.color as keyof typeof colorClasses]}`}
        >
          <div className="text-2xl mb-2">{card.icon}</div>
          <div className="text-3xl font-bold">{card.value}</div>
          <div className="text-sm font-semibold mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
