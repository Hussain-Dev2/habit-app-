'use client';

import { calculateLevel, getPointsToNextLevel } from '@/lib/level-system';

interface LevelCardProps {
  lifetimePoints: number;
}

export default function LevelCard({ lifetimePoints }: LevelCardProps) {
  const level = calculateLevel(lifetimePoints);
  const progression = getPointsToNextLevel(lifetimePoints);
  const isMaxLevel = level.level === 10;

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-300/50 dark:border-purple-500/50 rounded-2xl p-6 hover:border-purple-400/70 dark:hover:border-purple-400/70 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-2xl flex items-center gap-2 mb-1">
            <span className="text-4xl">{level.icon}</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Level {level.level}: {level.name}
            </span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {level.description}
          </p>
        </div>
      </div>

      {/* Level Benefits Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-white/50 dark:bg-white/5 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {(level.clickMultiplier * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Click Reward</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {(level.dailyBonusMultiplier * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Daily Bonus</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            +{level.comboBonus}%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Combo Bonus</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            +{level.adReward}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Ad Reward</div>
        </div>
      </div>

      {/* Progress Bar */}
      {!isMaxLevel ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Progress to Level {level.level + 1}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {progression.progress}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
              style={{ width: `${progression.progress}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {progression.current.toLocaleString()} / {progression.next.toLocaleString()} points
          </div>
        </div>
      ) : (
        <div className="text-center p-3 bg-gradient-to-r from-yellow-300 to-orange-300 dark:from-yellow-600 dark:to-orange-600 rounded-lg">
          <div className="text-sm font-bold text-white">🎉 Max Level Reached!</div>
          <div className="text-xs text-white/90">You are a true legend!</div>
        </div>
      )}

      {/* Total Points */}
      <div className="mt-4 pt-4 border-t border-purple-300/30 dark:border-purple-500/30">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {lifetimePoints.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Lifetime Points</div>
        </div>
      </div>
    </div>
  );
}
