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
    <div className="backdrop-blur-xl bg-gradient-to-br from-purple-100/70 to-pink-100/60 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-300/60 dark:border-purple-500/50 rounded-3xl p-8 hover:border-purple-400/80 dark:hover:border-purple-400/70 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 card-hover">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-2xl flex items-center gap-3 mb-2">
            <span className="text-5xl drop-shadow-lg">{level.icon}</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Level {level.level}
            </span>
          </h3>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{level.name}</p>
          <p className="text-xs text-slate-700 dark:text-slate-400 mt-1 font-medium">
            {level.description}
          </p>
        </div>
      </div>

      {/* Level Benefits Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/60 dark:bg-white/5 rounded-xl border border-purple-200/50 dark:border-purple-500/20">
        <div className="text-center p-2">
          <div className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">
            {(level.clickMultiplier * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-400 font-semibold mt-1">Click Reward</div>
        </div>
        <div className="text-center p-2">
          <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
            {(level.dailyBonusMultiplier * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-400 font-semibold mt-1">Daily Bonus</div>
        </div>
        <div className="text-center p-2">
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            +{level.comboBonus}%
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-400 font-semibold mt-1">Combo Bonus</div>
        </div>
        <div className="text-center p-2">
          <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
            +{level.adReward}
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-400 font-semibold mt-1">Ad Reward</div>
        </div>
      </div>

      {/* Progress Bar */}
      {!isMaxLevel ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Progress to Level {level.level + 1}
            </span>
            <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
              {progression.progress}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner border-2 border-slate-300 dark:border-slate-600">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 h-full transition-all duration-500 shadow-lg"
              style={{ width: `${progression.progress}%` }}
            />
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-400 mt-2 font-medium">
            {progression.current.toLocaleString()} / {progression.next.toLocaleString()} points
          </div>
        </div>
      ) : (
        <div className="text-center p-4 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500 rounded-xl shadow-lg mb-6">
          <div className="text-base font-extrabold text-white">🎉 Max Level Reached!</div>
          <div className="text-sm text-white/95 font-semibold mt-1">You are a true legend!</div>
        </div>
      )}

      {/* Total Points */}
      <div className="pt-6 border-t-2 border-purple-300/40 dark:border-purple-500/30">
        <div className="text-center">
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400">
            {lifetimePoints.toLocaleString()}
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-400 mt-1 font-semibold">Lifetime Points</div>
        </div>
      </div>
    </div>
  );
}
