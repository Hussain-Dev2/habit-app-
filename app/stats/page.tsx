'use client';

import PointsStatsCard from '@/components/PointsStatsCard';
import AchievementsComponent from '@/components/AchievementsComponent';
import PointsHistoryComponent from '@/components/PointsHistoryComponent';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StatsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-orange-50 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">📊</span>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent">
                Performance Dashboard
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg">Monitor your earnings and achievements</p>
          </div>

          {/* Stats Section */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <PointsStatsCard />
          </div>

          {/* Achievements and History Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <AchievementsComponent />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <PointsHistoryComponent />
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
