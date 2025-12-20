'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminProductManager from '@/components/AdminProductManager';
import AdminUserManager from '@/components/AdminUserManager';
import AdminCodesManager from '@/components/AdminCodesManager';
import AdminNotificationManager from '@/components/AdminNotificationManager';
import Toast from '@/components/Toast';

type TabType = 'overview' | 'habits' | 'shop' | 'users' | 'categories' | 'analytics' | 'announcements';

interface AdminStats {
  totalUsers: number;
  totalHabits: number;
  totalCompletions: number;
  completionRate: number;
  averageXpPerUser: number;
  activeUsersToday: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [habitData, setHabitData] = useState<{
    mostPopularHabits: any[];
    recentCompletions: any[];
  } | null>(null);
  const [habitsLoading, setHabitsLoading] = useState(false);
  const [categories, setCategories] = useState<{ name: string; icon: string; count: number }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const checkAdminStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/check', { method: 'GET' });
      const data = await response.json();
      setIsAdmin(data.isAdmin);
      if (!data.isAdmin) {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
      router.push('/');
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchHabitData = useCallback(async () => {
    setHabitsLoading(true);
    try {
      const response = await fetch('/api/admin/habits');
      const data = await response.json();
      if (response.ok) {
        setHabitData(data);
      }
    } catch (error) {
      console.error('Error fetching habit data:', error);
    } finally {
      setHabitsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      checkAdminStatus().finally(() => setLoading(false));
    }
  }, [session, status, router, checkAdminStatus]);

  useEffect(() => {
    if (isAdmin && activeTab === 'habits') {
      fetchHabitData();
    }
  }, [isAdmin, activeTab, fetchHabitData]);

  useEffect(() => {
    if (isAdmin && activeTab === 'categories') {
      fetchCategories();
    }
  }, [isAdmin, activeTab, fetchCategories]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Admin Dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const tabItems = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'habits', label: '📌 Habits', icon: '📌' },
    { id: 'shop', label: '🛒 Shop Products', icon: '🛒' },
    { id: 'categories', label: '🏷️ Categories', icon: '🏷️' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'announcements', label: '📢 Announcements', icon: '📢' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Enhanced Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">📌 Habit System Admin</h1>
              <p className="text-slate-400">Manage habits, users, and track system analytics</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Welcome back</p>
              <p className="text-white font-semibold">{session?.user?.name || 'Admin'}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue' },
              { label: 'Total Habits', value: stats.totalHabits, icon: '📌', color: 'green' },
              { label: 'Completions', value: stats.totalCompletions, icon: '✅', color: 'purple' },
              { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: '📊', color: 'yellow' },
              { label: 'Avg XP/User', value: stats.averageXpPerUser, icon: '⭐', color: 'pink' },
              { label: 'Active Today', value: stats.activeUsersToday, icon: '🔥', color: 'red' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="mb-8 animate-fade-in">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide p-1 bg-slate-800/30 rounded-lg backdrop-blur border border-slate-700">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold whitespace-nowrap rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">📊 System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Active Users (24h)</span>
                      <span className="text-2xl font-bold text-green-400">{stats?.activeUsersToday || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Habits Created</span>
                      <span className="text-2xl font-bold text-blue-400">{stats?.totalHabits || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Total Users</span>
                      <span className="text-2xl font-bold text-purple-400">{stats?.totalUsers || 0}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Total Completions</span>
                      <span className="text-2xl font-bold text-orange-400">{stats?.totalCompletions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Completion Rate</span>
                      <span className="text-2xl font-bold text-yellow-400">{stats?.completionRate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Avg XP/User</span>
                      <span className="text-2xl font-bold text-pink-400">{stats?.averageXpPerUser || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools Section */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🛠️ Admin Tools</h3>
                <div className="flex gap-4">
                  <button
                     onClick={async () => {
                        try {
                            setToast({ message: 'Sending test notification...', type: 'success' });
                            const res = await fetch('/api/notifications/test', { method: 'POST' });
                            const data = await res.json();
                            if (res.ok) {
                                setToast({ message: `Success! ${data.message}`, type: 'success' });
                            } else {
                                setToast({ message: `Error: ${data.error}`, type: 'error' });
                            }
                        } catch (e) {
                            setToast({ message: 'Failed to send request', type: 'error' });
                        }
                     }}
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg flex items-center gap-2"
                  >
                    <span>🔔</span>
                    Test Notification (To Me)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">🎯 Habit Categories</h3>
                  <div className="space-y-3">
                    {['Health', 'Fitness', 'Learning', 'Productivity', 'Social'].map((cat) => (
                      <div key={cat} className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">{cat}</span>
                        <span className="text-white font-semibold">--</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">💪 Difficulty Breakdown</h3>
                  <div className="space-y-3">
                    {['Easy (10 XP)', 'Medium (25 XP)', 'Hard (50 XP)'].map((diff) => (
                      <div key={diff} className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">{diff}</span>
                        <span className="text-white font-semibold">--</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'habits' && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">📌 Habit Management</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Popular Habits */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">⭐ Most Popular Habits</h3>
                  {habitsLoading ? (
                    <div className="p-4 bg-slate-700/30 rounded-lg text-slate-400">Loading...</div>
                  ) : habitData?.mostPopularHabits && habitData.mostPopularHabits.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {habitData.mostPopularHabits.map((habit, idx) => (
                        <div key={habit.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-semibold">{idx + 1}. {habit.name}</p>
                              <p className="text-slate-400 text-sm">{habit.user?.name || 'Anonymous'}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              habit.difficulty === 'easy' ? 'bg-green-500/30 text-green-300' :
                              habit.difficulty === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                              'bg-red-500/30 text-red-300'
                            }`}>
                              {habit.difficulty}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">📌 Category:</span>
                              <span className="text-white">{habit.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">✅ Completed:</span>
                              <span className="text-white font-semibold">{habit.totalCompleted}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">🔥 Streak:</span>
                              <span className="text-orange-400 font-semibold">{habit.streak}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-700/30 rounded-lg text-slate-400">No habits found</div>
                  )}
                </div>

                {/* Recent Completions */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">✅ Recent Completions</h3>
                  {habitsLoading ? (
                    <div className="p-4 bg-slate-700/30 rounded-lg text-slate-400">Loading...</div>
                  ) : habitData?.recentCompletions && habitData.recentCompletions.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {habitData.recentCompletions.map((completion, idx) => (
                        <div key={completion.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-semibold">{completion.habit?.name || 'Unknown'}</p>
                              <p className="text-slate-400 text-sm">by {completion.user?.name || 'Anonymous'}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold bg-green-500/30 text-green-300`}>
                              +{completion.pointsEarned || 0} XP
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">📌 Category:</span>
                              <span className="text-white">{completion.habit?.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">⏰ Time:</span>
                              <span className="text-white text-xs">
                                {new Date(completion.completedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-700/30 rounded-lg text-slate-400">No completions found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shop' && (
            <div>
              <AdminProductManager />
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">🏷️ Habit Categories</h2>
              {categoriesLoading ? (
                <div className="text-center py-10 text-slate-400">Loading categories...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.name} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 text-center hover:border-slate-500 transition-all">
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <p className="text-white font-semibold">{cat.name}</p>
                      <p className="text-slate-400 text-sm mt-1">{cat.count} habits</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <AdminUserManager />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">📈 Habit System Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <p className="text-slate-300 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-blue-400 mt-2">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <p className="text-slate-300 text-sm">Active Users (24h)</p>
                      <p className="text-3xl font-bold text-green-400 mt-2">{stats?.activeUsersToday || 0}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <p className="text-slate-300 text-sm">Total Habits</p>
                      <p className="text-3xl font-bold text-purple-400 mt-2">{stats?.totalHabits || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <p className="text-slate-300 text-sm">Total Completions</p>
                      <p className="text-3xl font-bold text-yellow-400 mt-2">{stats?.totalCompletions || 0}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <p className="text-slate-300 text-sm">Completion Rate</p>
                      <p className="text-3xl font-bold text-orange-400 mt-2">{stats?.completionRate || 0}%</p>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <p className="text-slate-300 text-sm">Avg XP Per User</p>
                      <p className="text-3xl font-bold text-pink-400 mt-2">{stats?.averageXpPerUser || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Analytics Section */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">📊 System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/50">
                    <p className="text-slate-300 text-sm mb-2">User Engagement</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-blue-400">
                        {stats?.totalUsers ? Math.round((stats.activeUsersToday / stats.totalUsers) * 100) : 0}%
                      </p>
                      <span className="text-3xl">👥</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/50">
                    <p className="text-slate-300 text-sm mb-2">System Completion Rate</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-green-400">{stats?.completionRate || 0}%</p>
                      <span className="text-3xl">✅</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* XP Distribution */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">⭐ XP Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg text-center border border-slate-600">
                    <p className="text-slate-400 text-sm mb-2">Total Users</p>
                    <p className="text-4xl font-bold text-yellow-400">{stats?.totalUsers || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg text-center border border-slate-600">
                    <p className="text-slate-400 text-sm mb-2">Avg XP/User</p>
                    <p className="text-4xl font-bold text-orange-400">{stats?.averageXpPerUser || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg text-center border border-slate-600">
                    <p className="text-slate-400 text-sm mb-2">Total XP Distributed</p>
                    <p className="text-4xl font-bold text-red-400">
                      {stats?.totalUsers && stats?.averageXpPerUser ? stats.totalUsers * stats.averageXpPerUser : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <AdminNotificationManager />
            </div>
          )}
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
