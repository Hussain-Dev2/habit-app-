'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/client';
import Toast from '@/components/Toast';
import Loader from '@/components/Loader';

interface DailyData {
  date: string;
  completions: number;
  label: string;
}

interface WeeklyData {
  week: string;
  completions: number;
  xpEarned: number;
  startDate: string;
}

interface Analytics {
  daily: DailyData[];
  weekly: WeeklyData[];
  monthly: {
    completions: number;
    xpEarned: number;
    startDate: string;
  };
  categories: Array<{
    category: string;
    completions: number;
    habits: number;
  }>;
  difficulty: Array<{
    difficulty: string;
    completions: number;
    xp: number;
    habitsCount: number;
  }>;
  topHabits: Array<{
    id: string;
    name: string;
    category: string;
    completions: number;
    streak: number;
    totalCompleted: number;
  }>;
  stats: {
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
    avgStreak: number;
    totalXpMonth: number;
  };
}

export default function HabitAnalyticsDashboard() {
  const { status } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'performance' | 'daily' | 'weekly' | 'monthly'>('performance');
  const [toast, setToast] = useState<{ message: string; type: 'error' } | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalytics();
    } else if (status === 'unauthenticated') {
        setLoading(false);
    }
  }, [status]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Analytics>('/habits/analytics');
      setAnalytics(data);
    } catch (error) {
      setToast({
        message: 'Failed to load analytics',
        type: 'error',
      });
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader size="lg" color="cyan" />
      </div>
    );
  }

  if (!analytics) {
    return null; // Or a placeholder
  }

  const maxDaily = Math.max(...analytics.daily.map((d) => d.completions));
  const maxWeekly = Math.max(...analytics.weekly.map((w) => w.completions));

  // Calculate performance insights
  const completionTrend = analytics.daily.length >= 2 
    ? analytics.daily[analytics.daily.length - 1].completions > analytics.daily[0].completions 
      ? 'up' 
      : 'down'
    : 'stable';
  
  const avgCompletions = Math.round(
    analytics.daily.reduce((sum, d) => sum + d.completions, 0) / analytics.daily.length
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start gap-2 sm:gap-3 mb-2">
          <span className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">📈</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-aurora bg-clip-text text-transparent break-words">
              Habit Analytics
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Deep dive into your habit performance
            </p>
          </div>
        </div>
      </div>

      {/* Performance Highlights - Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
        {[
          { label: 'Completion Rate', value: `${analytics.stats.completionRate}%`, icon: '📈', color: 'blue' },
          { label: 'Avg Daily', value: avgCompletions, icon: '⚡', color: 'cyan' },
          { label: 'Current Streak', value: analytics.stats.avgStreak, icon: '🔥', color: 'orange' },
          { label: 'Active Habits', value: analytics.stats.completedHabits, icon: '✅', color: 'green' },
          { label: 'This Month XP', value: analytics.stats.totalXpMonth, icon: '⭐', color: 'yellow' },
          { label: 'Total Habits', value: analytics.stats.totalHabits, icon: '📌', color: 'purple' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-blue-200/50 dark:border-blue-700/50 hover:border-blue-400 transition-all hover:shadow-lg"
          >
            <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{stat.icon}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
            <p className="text-base sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 sm:mb-8">
        <div className="flex gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 overflow-x-auto">
          {[
            { id: 'performance', label: '🎯 Performance', icon: '🎯' },
            { id: 'daily', label: '📅 Daily', icon: '📅' },
            { id: 'weekly', label: '📆 Weekly', icon: '📆' },
            { id: 'monthly', label: '📊 Monthly', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all capitalize text-xs sm:text-base whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-ocean text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Dashboard Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Performance Overview */}
          <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">🎯 Performance Overview</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Completion Trend */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Completion Trend</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {completionTrend === 'up' ? '📈 Improving' : completionTrend === 'down' ? '📉 Declining' : '➡️ Stable'}
                    </p>
                  </div>
                  <span className="text-4xl">{completionTrend === 'up' ? '📈' : completionTrend === 'down' ? '📉' : '➡️'}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {completionTrend === 'up' 
                    ? 'Great job! Your completion rate is improving.' 
                    : completionTrend === 'down'
                    ? 'Keep pushing! Try to increase daily completions.'
                    : 'Your performance is consistent. Maintain this momentum!'}
                </p>
              </div>

              {/* Consistency Score */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Consistency Score</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {Math.min(100, Math.round((analytics.stats.completionRate * analytics.stats.avgStreak) / 10))}%
                    </p>
                  </div>
                  <span className="text-4xl">🎖️</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((analytics.stats.completionRate * analytics.stats.avgStreak) / 10))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Top Insights */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">💡 Insights</h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0">🏆</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Best Performing Habit</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analytics.topHabits[0]?.name || 'No data'} with {analytics.topHabits[0]?.completions || 0} completions
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0">📈</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Most Completed Category</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analytics.categories.length > 0 
                        ? `${analytics.categories.reduce((max, cat) => cat.completions > max.completions ? cat : max).category} with ${analytics.categories.reduce((max, cat) => cat.completions > max.completions ? cat : max).completions} completions`
                        : 'No data'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0">🎯</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Daily Average</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {avgCompletions} habit completions per day
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Performance */}
            <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">📊 Category Performance</h3>
              <div className="space-y-3">
                {analytics.categories.map((cat, idx) => {
                  const totalCompletions = analytics.categories.reduce((sum, c) => sum + c.completions, 0);
                  const percentage = totalCompletions > 0 ? Math.round((cat.completions / totalCompletions) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{cat.category}</p>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{percentage}%</p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-ocean h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">💪 By Difficulty</h3>
              <div className="space-y-3">
                {analytics.difficulty.map((diff, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{diff.difficulty}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {diff.habitsCount} habit{diff.habitsCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">{diff.completions}x</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">+{diff.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Habits */}
          <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">🏆 Top Performing Habits</h3>
            <div className="space-y-3">
              {analytics.topHabits.slice(0, 5).map((habit, idx) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{habit.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{habit.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-blue-600 dark:text-blue-400">{habit.completions}x</p>
                        <p className="text-xs text-gray-500">this month</p>
                      </div>
                      <div>
                        <p className="font-bold text-orange-600 dark:text-orange-400">{habit.streak}🔥</p>
                        <p className="text-xs text-gray-500">streak</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily View */}
      {activeTab === 'daily' && (
        <div className="space-y-8 animate-fade-in">
          <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">📅 Last 7 Days</h3>

            {/* Bar Chart */}
            <div className="mb-6">
              <div className="flex items-end gap-2 h-40 mb-4">
                {analytics.daily.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-ocean rounded-t-lg transition-all hover:shadow-lg"
                      style={{
                        height: maxDaily > 0 ? `${(day.completions / maxDaily) * 100}%` : '0%',
                      }}
                    />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {day.completions}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-semibold">Date</th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-semibold">Day</th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-semibold">Completions</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.daily.map((day, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="py-3 text-gray-900 dark:text-white">{day.date}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{day.label}</td>
                      <td className="py-3">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                          {day.completions} completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Weekly View */}
      {activeTab === 'weekly' && (
        <div className="space-y-8 animate-fade-in">
          <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">📆 Last 4 Weeks</h3>

            {/* Bar Chart */}
            <div className="mb-6">
              <div className="flex items-end gap-3 h-40 mb-4">
                {analytics.weekly.map((week, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full space-y-1">
                      <div
                        className="w-full bg-gradient-ocean rounded-t-lg transition-all hover:shadow-lg"
                        style={{
                          height: maxWeekly > 0 ? `${(week.completions / maxWeekly) * 100}%` : '0%',
                        }}
                        title={`${week.completions} completions, ${week.xpEarned} XP`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {week.completions}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">{week.week}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-semibold">Week</th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-semibold">Period</th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-semibold">Completions</th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-semibold">XP Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.weekly.map((week, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="py-3 text-gray-900 dark:text-white font-semibold">{week.week}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 text-xs">from {week.startDate}</td>
                      <td className="py-3">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                          {week.completions}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                          +{week.xpEarned}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Monthly View */}
      {activeTab === 'monthly' && (
        <div className="space-y-8 animate-fade-in">
          <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">📊 This Month</h3>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Completions</p>
                <p className="text-5xl font-bold text-green-600 dark:text-green-400">
                  {analytics.monthly.completions}
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total XP Earned</p>
                <p className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analytics.monthly.xpEarned}
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Category Breakdown</h3>
              <div className="space-y-3">
                {analytics.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{cat.category}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cat.habits} habit{cat.habits !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 dark:text-blue-400">{cat.completions}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">completions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">By Difficulty</h3>
              <div className="space-y-3">
                {analytics.difficulty.map((diff, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{diff.difficulty}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {diff.habitsCount} habit{diff.habitsCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">{diff.completions}x</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">+{diff.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}