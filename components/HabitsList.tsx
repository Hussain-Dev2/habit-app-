'use client';

/**
 * Habits List Component
 * 
 * Displays user's habits as cards with completion tracking.
 * Each habit shows:
 * - Title and description
 * - Difficulty level with color coding
 * - Current streak and personal best
 * - XP reward value
 * - Complete button
 * - Completion status
 */

import { useState, useEffect } from 'react';
import { useGameState, calculateHabitPoints } from '@/hooks/useGameState';
import { Habit, HABIT_DIFFICULTY_POINTS } from '@/lib/data-structures';
import { useLanguage } from '@/contexts/LanguageContext';

interface HabitsListProps {
  onHabitComplete?: (habitId: string, pointsEarned: number) => void;
  onError?: (message: string) => void;
  filter?: 'active' | 'completed' | 'all';
}

// Color mapping for difficulty levels
const DIFFICULTY_COLORS = {
  easy: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-300 dark:border-green-700',
    badge: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
    text: 'text-green-700 dark:text-green-400',
    icon: '🟢',
  },
  medium: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-300 dark:border-yellow-700',
    badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
    text: 'text-yellow-700 dark:text-yellow-400',
    icon: '🟡',
  },
  hard: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-300 dark:border-red-700',
    badge: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
    text: 'text-red-700 dark:text-red-400',
    icon: '🔴',
  },
  extreme: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-300 dark:border-purple-700',
    badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
    text: 'text-purple-700 dark:text-purple-400',
    icon: '🟣',
  },
};

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
  fitness: '🏃',
  health: '🏥',
  learning: '📚',
  productivity: '💼',
  mindfulness: '🧘',
  social: '👥',
  creative: '🎨',
  other: '📌',
};

export default function HabitsList({
  onHabitComplete,
  onError,
  filter = 'active',
}: HabitsListProps) {
  const { user, habits, completeHabit, loading, error } = useGameState();
  const { t } = useLanguage();
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<{
    habitId: string;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Filter habits based on status
  const filteredHabits = habits.filter((habit) => {
    if (filter === 'active') return habit.isActive && !habit.completed;
    if (filter === 'completed') return habit.completed;
    return habit.isActive;
  });

  const handleCompleteHabit = async (habit: Habit) => {
    if (!user) {
      onError?.('Please sign in to complete habits');
      return;
    }

    if (habit.completed) {
      setCompletionMessage({
        habitId: habit.id,
        message: 'Already completed today!',
        type: 'error',
      });
      return;
    }

    setCompletingHabitId(habit.id);

    try {
      // Calculate points that will be earned
      const today = new Date().toDateString();
      const lastCompletedDate = habit.completedAt
        ? new Date(habit.completedAt).toDateString()
        : null;
      const isFirstToday = lastCompletedDate !== today;

      const pointsInfo = calculateHabitPoints(
        habit.difficulty,
        habit.currentStreak,
        isFirstToday
      );

      // Complete the habit (this updates state and adds points)
      const completion = completeHabit(habit.id);

      if (completion) {
        setCompletionMessage({
          habitId: habit.id,
          message: `✓ Completed! +${completion.totalPoints} XP`,
          type: 'success',
        });

        onHabitComplete?.(habit.id, completion.totalPoints);

        // Clear message after 3 seconds
        setTimeout(() => {
          setCompletionMessage(null);
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete habit';
      setCompletionMessage({
        habitId: habit.id,
        message: errorMessage,
        type: 'error',
      });
      onError?.(errorMessage);
    } finally {
      setCompletingHabitId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500 dark:text-slate-400">Loading habits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4 text-red-700 dark:text-red-300">
        Error: {error}
      </div>
    );
  }

  if (filteredHabits.length === 0) {
    return (
      <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {filter === 'completed'
            ? 'No completed habits yet!'
            : 'Create your first habit to get started!'}
        </p>
        <a
          href="/habits"
          className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Create Habit
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredHabits.map((habit) => {
        const colors = DIFFICULTY_COLORS[habit.difficulty as keyof typeof DIFFICULTY_COLORS];
        const icon = CATEGORY_ICONS[habit.category] || '📌';
        const isCompletingThis = completingHabitId === habit.id;
        const message = completionMessage?.habitId === habit.id ? completionMessage : null;

        return (
          <div
            key={habit.id}
            className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 sm:p-5 transition-all duration-200 hover:shadow-md`}
          >
            {/* Header with title and difficulty */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg sm:text-xl">{icon}</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate">
                    {habit.title}
                  </h3>
                </div>
                {habit.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {habit.description}
                  </p>
                )}
              </div>
              <span className={`${colors.badge} px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0`}>
                {colors.icon} {habit.difficulty}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              {/* Streak */}
              <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Streak</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                  🔥 {habit.currentStreak}
                </p>
              </div>

              {/* Best Streak */}
              <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Best</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                  👑 {habit.longestStreak}
                </p>
              </div>

              {/* XP Value */}
              <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">XP</p>
                <p className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400">
                  ⭐ {habit.xpValue}
                </p>
              </div>
            </div>

            {/* Complete Button or Completed Badge */}
            <div className="flex gap-2 items-center">
              {habit.completed ? (
                <div className="flex-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-center font-semibold text-sm">
                  ✓ Completed Today
                </div>
              ) : (
                <button
                  onClick={() => handleCompleteHabit(habit)}
                  disabled={isCompletingThis || !user}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isCompletingThis
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-wait'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isCompletingThis ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚙️</span> Completing...
                    </span>
                  ) : (
                    '✓ Complete Habit'
                  )}
                </button>
              )}
            </div>

            {/* Completion message */}
            {message && (
              <div
                className={`mt-3 px-3 py-2 rounded-lg text-sm font-semibold text-center ${
                  message.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                }`}
              >
                {message.message}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
