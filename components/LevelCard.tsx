'use client';

import { calculateLevel, getPointsToNextLevel } from '@/lib/level-system';
import { useLanguage } from '@/contexts/LanguageContext';

interface LevelCardProps {
  lifetimePoints: number;
}

export default function LevelCard({ lifetimePoints }: LevelCardProps) {
  const { t } = useLanguage();
  const level = calculateLevel(lifetimePoints);
  const progression = getPointsToNextLevel(lifetimePoints);
  const isMaxLevel = level.level === 12;

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-50/90 via-orange-50/70 to-emerald-50/90 dark:from-cyan-900/40 dark:via-orange-900/30 dark:to-emerald-900/40 border-2 border-cyan-300/60 dark:border-cyan-500/50 rounded-3xl p-6 hover:border-cyan-400/80 dark:hover:border-cyan-400/70 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/30 card-hover">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="font-extrabold text-2xl flex items-center gap-3 mb-2">
            <span className="text-6xl drop-shadow-lg animate-pulse">{level.icon}</span>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-cyan-600 via-orange-500 to-emerald-600 dark:from-cyan-400 dark:via-orange-400 dark:to-emerald-400 bg-clip-text text-transparent">
                {t.level} {level.level}
              </span>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{level.name}</p>
            </div>
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 font-medium bg-white/50 dark:bg-black/20 px-3 py-2 rounded-lg border border-cyan-200 dark:border-cyan-800">
            {level.description}
          </p>
        </div>
      </div>

      {/* Level Benefits Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gradient-to-br from-white/80 to-cyan-50/80 dark:from-white/5 dark:to-cyan-900/20 rounded-xl border-2 border-cyan-200/50 dark:border-cyan-500/20 shadow-lg">
        <div className="text-center p-3 bg-yellow-50/70 dark:bg-yellow-900/20 rounded-lg border border-yellow-300/50 dark:border-yellow-600/30 hover:scale-105 transition-transform">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">
            {(level.xpMultiplier * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">XP Boost</div>
        </div>
        <div className="text-center p-3 bg-green-50/70 dark:bg-green-900/20 rounded-lg border border-green-300/50 dark:border-green-600/30 hover:scale-105 transition-transform">
          <div className="text-2xl mb-1">🎁</div>
          <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
            {(level.dailyBonusMultiplier * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">{t.dailyBonus}</div>
        </div>
        <div className="text-center p-3 bg-orange-50/70 dark:bg-orange-900/20 rounded-lg border border-orange-300/50 dark:border-orange-600/30 hover:scale-105 transition-transform">
          <div className="text-2xl mb-1">📺</div>
          <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
            +{level.adReward}
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">{t.adReward}</div>
        </div>
      </div>

      {/* Progress Bar */}
      {!isMaxLevel ? (
        <div className="mb-6 p-4 bg-gradient-to-br from-cyan-50/70 to-emerald-50/70 dark:from-cyan-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-cyan-300/50 dark:border-cyan-600/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="text-lg">🎯</span>
              {t.next}: <span className="text-cyan-600 dark:text-cyan-400">{t.level} {level.level + 1}</span>
            </span>
            <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400 bg-white/60 dark:bg-black/30 px-3 py-1 rounded-full">
              {progression.progress}%
            </span>
          </div>
          <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-5 overflow-hidden shadow-inner border-2 border-slate-400 dark:border-slate-600">
            <div
              className="bg-gradient-to-r from-cyan-500 via-orange-500 to-emerald-500 h-full transition-all duration-700 shadow-lg relative overflow-hidden"
              style={{ width: `${progression.progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 mt-3 font-semibold flex items-center justify-between bg-white/50 dark:bg-black/20 px-3 py-2 rounded-lg">
            <span>📊 {progression.current.toLocaleString()}</span>
            <span className="text-slate-500 dark:text-slate-400">/</span>
            <span>🎯 {progression.next.toLocaleString()}</span>
          </div>
          <div className="text-xs text-center text-cyan-700 dark:text-cyan-300 mt-2 font-bold">
            {(progression.next - progression.current).toLocaleString()} {t.pointsToGo}! 🚀
          </div>
        </div>
      ) : (
        <div className="text-center p-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 dark:from-yellow-500 dark:via-orange-500 dark:to-pink-500 rounded-2xl shadow-2xl mb-6 border-4 border-yellow-300 dark:border-yellow-600 animate-pulse">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-xl font-extrabold text-white drop-shadow-lg">{t.maxLevelAchieved}</div>
          <div className="text-base text-white/95 font-semibold mt-2">{t.youAreLegend}</div>
        </div>
      )}

      {/* Total Points */}
      <div className="pt-6 border-t-2 border-cyan-300/40 dark:border-cyan-500/30">
        <div className="text-center bg-gradient-to-br from-white/60 to-emerald-50/60 dark:from-white/5 dark:to-emerald-900/20 p-4 rounded-xl border border-emerald-300/50 dark:border-emerald-600/30">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">✨ {t.lifetimePoints} ✨</div>
          <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-orange-600 to-emerald-600 dark:from-cyan-400 dark:via-orange-400 dark:to-emerald-400 tracking-tight">
            {lifetimePoints.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
