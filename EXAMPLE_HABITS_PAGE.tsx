'use client';

/**
 * Habits Dashboard Page
 * 
 * Main page for users to view, create, and manage habits
 * Replace or use as template for app/habits/page.tsx
 */

import { useEffect, useState } from 'react';
import { HabitCard } from '@/components/HabitCard';
import { HabitStats } from '@/components/HabitStats';
import { CreateHabitForm } from '@/components/CreateHabitForm';

interface Habit {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  difficulty: string;
  xpReward: number;
  streak: number;
  completions: Array<{ completedAt: string }>;
  freezeCount: number;
  isCurrentlyFrozen: boolean;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/habits/list');
      if (!res.ok) throw new Error('Failed to load habits');
      const data = await res.json();
      setHabits(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTodayCompletedSet = () => {
    const today = new Date().toDateString();
    return new Set(
      habits
        .filter((h) =>
          h.completions.some(
            (c) => new Date(c.completedAt).toDateString() === today
          )
        )
        .map((h) => h.id)
    );
  };

  const todayCompletedIds = getTodayCompletedSet();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Loading your habits...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              📌 My Habits
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Complete your daily habits to earn points and level up! Each habit completed brings you closer to amazing rewards.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-700">
            <p className="font-semibold">⚠️ Error: {error}</p>
          </div>
        )}

        {/* Statistics Section */}
        <div className="mb-8">
          <HabitStats />
        </div>

        {/* Main Content */}
        <div className="mb-8">
          {/* Header with Create Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Active Habits
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              + Create New Habit
            </button>
          </div>

          {/* Create Habit Form */}
          {showCreateForm && (
            <div className="mb-8">
              <CreateHabitForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  fetchHabits();
                }}
              />
            </div>
          )}

          {/* Habits Grid or Empty State */}
          {habits.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">📌</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Habits Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Create your first habit to start earning points and building better routines!
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                🎯 Create First Habit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={fetchHabits}
                  isCompletedToday={todayCompletedIds.has(habit.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rewards Marketplace CTA */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg p-8 shadow-lg border border-green-200 dark:border-green-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Ready to Claim Your Rewards?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                You've earned points! Head to the Rewards Marketplace to redeem them for amazing prizes and gift cards.
              </p>
            </div>
            <a
              href="/shop"
              className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              🎁 Visit Rewards Store
            </a>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">💡 Tips for Success</h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>✅ Complete your habits consistently to build streaks</li>
            <li>✅ Mix easy, medium, and hard habits for balanced growth</li>
            <li>✅ Complete habits early in the day for motivation</li>
            <li>✅ Harder habits earn more XP - challenge yourself!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
