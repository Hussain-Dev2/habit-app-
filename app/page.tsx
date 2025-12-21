'use client';

/**
 * Gamified Habit Tracker - Main Dashboard
 * 
 * Welcome page for the Gamified Habit Tracker SaaS where users can:
 * - View their habit overview and create new habits
 * - Complete daily habits and earn XP points
 * - Track progression through levels and streaks
 * - Earn rewards for consistency and achievement
 * - Engage with the community leaderboard
 * 
 * Features:
 * - Real-time user data fetching
 * - Habit management (create, complete, track)
 * - XP reward system (10/25/50 based on difficulty)
 * - Level progression every 100 XP
 * - Streak tracking for motivation
 * - Multi-language support (EN/AR)
 * - Responsive design for all devices
 * - Toast notifications for user feedback
 * - Protected route requiring authentication
 * - Animated background and UI elements
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import UserCard from '@/components/UserCard';
import LevelCard from '@/components/LevelCard';
import Toast from '@/components/Toast';
import GoogleAdsense from '@/components/ads/GoogleAdsense';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import { apiFetch } from '@/lib/client';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * User data interface - represents the authenticated user's stats
 */
interface User {
  id: string;
  points: number; // Current spendable points
  lifetimePoints: number; // Total points earned (used for level calculation)
  isAdmin?: boolean; // Whether user is an admin
}

/**
 * Habit interface for displaying user habits
 */
interface Habit {
  id: string;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon?: string;
  streak: number;
  isCompleted: boolean;
}

interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  todayCompletions: number;
  weekCompletions: number;
  totalCompletions: number;
  longestStreak: number;
  habitsCompleted: number;
}

/**
 * Dashboard Component
 * Main habit tracking dashboard with stats, habit management, and progress tracking
 */
export default function Dashboard() {
  // NextAuth session management
  const { data: session, status } = useSession();
  
  // Internationalization hook for multi-language support
  const { t } = useLanguage();
  
  // User state management
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);
  
  // Toast notification state for user feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  /**
   * Effect: Fetch user data when authentication status changes
   */
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUser();
      fetchHabits();
      fetchStats();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  /**
   * Fetch current user data from the API
   */
  const fetchUser = async () => {
    try {
      const data = await apiFetch<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setToast({
        message: 'Failed to load user data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch user's habits
   */
  const fetchHabits = async () => {
    try {
      const data = await apiFetch<{ habits: Habit[] }>('/habits/list');
      setHabits(data.habits || []);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    }
  };

  /**
   * Fetch habit stats
   */
  const fetchStats = async () => {
    try {
      const data = await apiFetch<HabitStats>('/habits/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  /**
   * Complete a habit and award XP
   */
  /*
   * Complete a habit and award XP (Optimistic UI)
   */
  const handleCompleteHabit = async (habitId: string) => {
    if (completingHabit) return;

    // 1. Snapshot previous state for rollback
    const previousHabits = [...habits];
    const previousUser = user ? { ...user } : null;
    const previousStats = stats ? { ...stats } : null;
    
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    const habit = habits[habitIndex];

    // 2. Optimistic Update
    setCompletingHabit(habitId);
    
    // Calculate predicted XP
    const pointsMap: Record<string, number> = { easy: 10, medium: 25, hard: 50 };
    const xpEarned = pointsMap[habit.difficulty] || 10;
    
    // Update Habits List
    const newHabits = [...habits];
    newHabits[habitIndex] = {
      ...habit,
      isCompleted: true,
      streak: habit.streak + 1
    };
    setHabits(newHabits);

    // Update User Points
    if (user) {
      setUser({
        ...user,
        points: user.points + xpEarned,
        lifetimePoints: user.lifetimePoints + xpEarned
      });
    }

    // Update Stats (Estimate)
    if (stats) {
      setStats({
        ...stats,
        todayCompletions: stats.todayCompletions + 1,
        totalCompletions: stats.totalCompletions + 1,
        activeHabits: stats.activeHabits, // unchanged
        totalHabits: stats.totalHabits, // unchanged
        weekCompletions: stats.weekCompletions + 1,
        longestStreak: Math.max(stats.longestStreak, habit.streak + 1),
        habitsCompleted: stats.habitsCompleted + 1
      });
    }

    // Show Immediate Feedback
    setToast({
      message: `✅ +${xpEarned} XP earned!`,
      type: 'success',
    });

    try {
      // 3. Perform Server Request in Background
      const response = await apiFetch<any>('/habits/complete', {
        method: 'POST',
        body: JSON.stringify({ habitId }),
      });

      // 4. Handle Level Up or corrections
      // If server returns different points or level up, update UI
      if (response.leveledUp) {
         setToast({
          message: `✅ +${response.pointsEarned} XP earned! 🎉 Level Up!`,
          type: 'success',
        });
        // If leveled up, we should probably fetchUser to make sure level cap/progress is correct
        fetchUser(); 
      }
      
      // We can skip the full re-fetch if we trust our math, 
      // but doing it silently doesn't hurt as long as UI is already unblocked.
      
    } catch (error: any) {
      // 5. Rollback on Error
      console.error('Optimistic update failed:', error);
      setHabits(previousHabits);
      if (previousUser) setUser(previousUser);
      if (previousStats) setStats(previousStats);
      
      setToast({
        message: error.message || 'Failed to complete habit',
        type: 'error',
      });
    } finally {
      setCompletingHabit(null);
    }
  };

  if (loading && status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader size="lg" color="cyan" />
          <p className="text-slate-300 text-lg font-semibold">Loading your habits...</p>
        </div>
      </main>
    );
  }

  // Show demo data for non-authenticated users
  const displayUser = user || { id: 'guest', points: 0, lifetimePoints: 0 };
  const isAuthenticated = status === 'authenticated';

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50/30 to-cyan-100 dark:from-gray-900 dark:via-cyan-950/50 dark:to-orange-950/50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-gradient-ocean rounded-full mix-blend-normal filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 sm:w-96 sm:h-96 bg-gradient-sunset rounded-full mix-blend-normal filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/3 left-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-gradient-tropical rounded-full mix-blend-normal filter blur-3xl opacity-25 dark:opacity-15 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 lg:py-8 relative z-10">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="text-2xl sm:text-4xl animate-float">📌</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-aurora bg-clip-text text-transparent animate-gradient">
                {t.dailyHabits}
              </h1>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">{t.dailyHabitsDesc}</p>
          </div>

          {/* User Stats Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 animate-fade-in">
            {/* Level Card */}
            <div style={{ animationDelay: '50ms' }}>
              <LevelCard lifetimePoints={displayUser.lifetimePoints || 0} />
            </div>

            {/* Points Card */}
            <div style={{ animationDelay: '100ms' }}>
              <UserCard points={displayUser.points} habitsCompleted={stats?.totalCompletions || 0} />
            </div>

            {/* Quick Stats */}
            <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-purple-200/50 dark:border-purple-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 card-lift" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">⭐</span>
                <h3 className="font-bold text-sm sm:text-lg">{t.xpProgress}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t.thisLevel}</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {(displayUser.lifetimePoints || 0) % 100}/100 XP
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-gradient-aurora rounded-full h-2 sm:h-3 transition-all duration-500"
                    style={{ width: `${((displayUser.lifetimePoints || 0) % 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Habits Section */}
          <div className="mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <span>✅</span>
                <span>{t.yourHabits}</span>
              </h2>
              {isAuthenticated && (
                <Link href="/habits" className="px-3 sm:px-4 py-2 bg-gradient-ocean text-white rounded-lg font-semibold hover:shadow-glow transition-all duration-300 text-xs sm:text-base w-full sm:w-auto text-center">
                  {t.createNewHabit} →
                </Link>
              )}
            </div>

            {habits.length === 0 ? (
              <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">{t.noHabitsYet}</p>
                <Link href="/habits" className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-ocean text-white rounded-lg font-semibold hover:shadow-glow transition-all duration-300 text-sm sm:text-base">
                  {t.createFirstHabit}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {habits.map((habit) => (
                  <div key={habit.id} className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-blue-200/50 dark:border-blue-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 card-lift hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{habit.icon || '📝'}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white truncate">{habit.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{habit.category}</p>
                        </div>
                      </div>
                      <span className={`px-2 sm:px-3 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                        habit.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' :
                        habit.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                      }`}>
                        {habit.difficulty === 'easy' ? '10 XP' : habit.difficulty === 'medium' ? '25 XP' : '50 XP'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-lg sm:text-xl">🔥</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-sm sm:text-base">{habit.streak} {t.dayStreak}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCompleteHabit(habit.id)}
                      disabled={habit.isCompleted || completingHabit === habit.id}
                      className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                        habit.isCompleted
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-ocean text-white hover:shadow-glow active:scale-95'
                      } ${completingHabit === habit.id ? 'opacity-50' : ''}`}
                    >
                      {completingHabit === habit.id ? t.completing : habit.isCompleted ? t.completedToday : t.completeNow}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA Section - Responsive Grid */}
          {habits.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <div className="glass backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-300 dark:border-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all">
                <h3 className="font-bold text-sm sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-lg sm:text-2xl">📊</span>
                  <span>{t.statsAndAnalytics}</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">{t.statsDesc}</p>
                <Link href="/stats" className="inline-block px-3 sm:px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 hover:shadow-lg">
                  {t.viewDashboard} →
                </Link>
              </div>

              <div className="glass backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all">
                <h3 className="font-bold text-sm sm:text-lg mb-2 flex items-center gap-2">
                  <span className="text-lg sm:text-2xl">🛍️</span>
                  <span>{t.rewards}</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">{t.rewardsPanelDesc}</p>
                <Link href="/shop" className="inline-block px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 hover:shadow-lg">
                  {t.viewRewards} →
                </Link>
              </div>
            </div>
          )}

          {/* Google AdSense - Separated Banner */}
          {!user?.isAdmin && (
            <div className="my-12 animate-fade-in flex justify-center" style={{ animationDelay: '300ms' }}>
              <GoogleAdsense 
                adSlot="1234567890" 
                adFormat="horizontal"
                style={{ height: '90px', width: '100%', maxWidth: '728px' }}
                className="bg-gray-100/50 dark:bg-gray-800/50 rounded-lg overflow-hidden"
              />
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
      </main>
    </ProtectedRoute>
  );
}