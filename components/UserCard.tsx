'use client';

interface UserCardProps {
  points: number;
  clicks: number;
}

export default function UserCard({ points, clicks }: UserCardProps) {
  const pointsPercentage = Math.min((clicks / 100) * 100, 100); // Progress to next milestone at 100 clicks
  const nextMilestone = Math.ceil((clicks + 1) / 100) * 100;
  const milestonesReached = Math.floor(clicks / 100);

  return (
    <div className="group backdrop-blur-xl bg-white/70 dark:bg-white/10 border-2 border-blue-200/50 dark:border-white/20 rounded-3xl p-8 hover:border-purple-400/70 dark:hover:border-purple-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 card-hover">
      {/* Points Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-700 dark:text-slate-400 text-sm font-semibold flex items-center gap-2">
            <span className="text-lg">⭐</span>
            Total Points
          </p>
          <span className="text-xs bg-purple-100 dark:bg-purple-500/30 border-2 border-purple-300 dark:border-purple-400/50 px-3 py-1.5 rounded-full text-purple-700 dark:text-purple-300 font-bold shadow-sm">
            Level {Math.floor(points / 1000) + 1}
          </span>
        </div>
        <p className="text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
          {points.toLocaleString()}
        </p>
      </div>

      {/* Clicks Section */}
      <div className="mb-8 pb-8 border-b border-blue-200/50 dark:border-white/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-700 dark:text-slate-400 text-sm font-semibold flex items-center gap-2">
            <span className="text-lg">🔥</span>
            Total Clicks
          </p>
          <span className="text-xs bg-pink-100 dark:bg-pink-500/30 border-2 border-pink-300 dark:border-pink-400/50 px-3 py-1.5 rounded-full text-pink-700 dark:text-pink-300 font-bold shadow-sm">
            {milestonesReached} 🏆
          </span>
        </div>
        <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-5">
          {clicks.toLocaleString()}
        </p>

        {/* Progress to next milestone */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-700 dark:text-slate-400 font-semibold">Milestone Progress</span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">{clicks % 100}/100</span>
          </div>
          <div className="w-full h-3 bg-blue-100 dark:bg-white/10 border-2 border-blue-200/50 dark:border-white/20 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-500 shadow-lg"
              style={{ width: `${pointsPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-800/10 border-2 border-green-200/60 dark:border-green-500/30 rounded-xl p-4 hover:border-green-400/70 dark:hover:border-green-400/50 transition-all duration-200 hover:shadow-md">
          <p className="text-xs text-slate-700 dark:text-slate-400 mb-2 font-semibold">💰 Earnings</p>
          <p className="text-base font-extrabold text-green-600 dark:text-green-400">{(points / 10).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-800/10 border-2 border-blue-200/60 dark:border-blue-500/30 rounded-xl p-4 hover:border-blue-400/70 dark:hover:border-blue-400/50 transition-all duration-200 hover:shadow-md">
          <p className="text-xs text-slate-700 dark:text-slate-400 mb-2 font-semibold">🎯 Next Goal</p>
          <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">{nextMilestone}</p>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-slate-700 dark:text-slate-400 mt-6 text-center leading-relaxed font-medium px-2">
        ⚡ Earn <span className="text-yellow-500 dark:text-yellow-400 font-bold">10 points</span> per click | 🏆 Milestones at <span className="text-pink-500 dark:text-pink-400 font-bold">100 clicks</span>
      </p>
    </div>
  );
}