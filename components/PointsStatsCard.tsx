'use client';

import React from 'react';
import { useSmartPoints } from '@/hooks/useSmartPoints';
import { formatPoints, formatSessionTime } from '@/lib/points-utils';

function PointsStatsCard() {
  const { pointsData, loading } = useSmartPoints();

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-6 animate-pulse">
        <div className="h-32 bg-blue-200/50 dark:bg-white/10 rounded-lg"></div>
      </div>
    );
  }

  if (!pointsData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Main Points Card */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-6 hover:border-blue-300/50 dark:hover:border-white/40 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-300">💰 Total Points</h3>
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatPoints(pointsData.points)}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Lifetime Earned:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatPoints(pointsData.lifetimePoints)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Today's Earnings:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              +{formatPoints(pointsData.dailyEarnings)}
            </span>
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-6 hover:border-blue-300/50 dark:hover:border-white/40 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-300">🔥 Current Streak</h3>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {pointsData.streakDays} {pointsData.streakDays === 1 ? 'day' : 'days'}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Session Time:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatSessionTime(pointsData.totalSessionTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-6 hover:border-blue-300/50 dark:hover:border-white/40 transition-all">
        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">📊 Points Sources</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span>✅ Habits & Activity</span>
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatPoints(pointsData.lifetimePoints - pointsData.pointsFromAds - pointsData.pointsFromTasks)}
            </span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span>📺 Ads</span>
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatPoints(pointsData.pointsFromAds)}
            </span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span>✅ Tasks</span>
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatPoints(pointsData.pointsFromTasks)}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Card */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-6 hover:border-blue-300/50 dark:hover:border-white/40 transition-all">
        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">⏰ Last Activity</h3>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {pointsData.lastActivityAt
            ? new Date(pointsData.lastActivityAt).toLocaleString()
            : 'No activity yet'}
        </div>
      </div>
    </div>
  );
}

export default React.memo(PointsStatsCard);
