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
    <div className="group backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-8 hover:border-blue-300/50 dark:hover:border-white/40 transition-all duration-300 hover:shadow-2xl">
      {/* Points Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">⭐ Total Points</p>
          <span className="text-xs bg-purple-100 dark:bg-purple-500/30 border border-purple-300 dark:border-purple-400/50 px-2 py-1 rounded-full text-purple-700 dark:text-purple-300">
            Level {Math.floor(points / 1000) + 1}
          </span>
        </div>
        <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          {points.toLocaleString()}
        </p>
      </div>

      {/* Clicks Section */}
      <div className="mb-8 pb-8 border-b border-blue-200/50 dark:border-white/10\">
        <div className="flex items-center justify-between mb-3\">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium\">🔥 Total Clicks</p>
          <span className="text-xs bg-pink-100 dark:bg-pink-500/30 border border-pink-300 dark:border-pink-400/50 px-2 py-1 rounded-full text-pink-700 dark:text-pink-300\">
            {milestonesReached} 🏆
          </span>
        </div>
        <p className="text-4xl font-bold text-cyan-400 mb-4">
          {clicks.toLocaleString()}
        </p>

        {/* Progress to next milestone */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-600 dark:text-slate-400\">Milestone Progress</span>
            <span className="text-xs text-slate-700 dark:text-slate-300\">{clicks % 100}/100</span>
          </div>
          <div className="w-full h-2 bg-blue-100 dark:bg-white/10 border border-blue-200 dark:border-white/20 rounded-full overflow-hidden\">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
              style={{ width: `${pointsPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3\">
        <div className="bg-blue-50/50 dark:bg-white/5 border border-blue-200/50 dark:border-white/10 rounded-lg p-3\">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1\">Earnings</p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400\">{(points / 10).toLocaleString()} clicks</p>
        </div>
        <div className="bg-blue-50/50 dark:bg-white/5 border border-blue-200/50 dark:border-white/10 rounded-lg p-3\">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1\">Next Milestone</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400\">{nextMilestone} clicks</p>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-6 text-center leading-relaxed\">
        ⚡ You earn <span className="text-yellow-400 font-semibold">10 points</span> per click | 🏆 Milestone every <span className="text-pink-400 font-semibold">100 clicks</span>
      </p>
    </div>
  );
}