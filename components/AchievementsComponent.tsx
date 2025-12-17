'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/client';

interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  reward: number;
  unlockedAt: string;
}

export default function AchievementsComponent() {
  const { status } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchAchievements = async () => {
      try {
        const response = await apiFetch<{ achievements: Achievement[] }>(
          '/points/achievements'
        );
        setAchievements(response.achievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [status]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-blue-200/50 dark:bg-white/10 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">🏆 Achievements</h2>
      
      {achievements.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">
          No achievements unlocked yet. Keep completing habits and tasks!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-4 hover:border-blue-300/50 dark:hover:border-white/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                    {achievement.name}
                  </h3>
                  {achievement.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {achievement.description}
                    </p>
                  )}
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                    +{achievement.reward} points
                  </p>
                </div>
                <span className="text-2xl ml-4">{achievement.icon || '⭐'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
