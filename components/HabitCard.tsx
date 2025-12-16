'use client';

/**
 * HabitCard Component
 * 
 * Displays a single habit with difficulty badge, XP reward, streak info,
 * and a "Complete" button
 */

import { useState } from 'react';
import { DIFFICULTY_COLORS } from '@/lib/habit-constants';

interface HabitCompletionData {
  completedAt: string;
}

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    difficulty: string;
    xpReward: number;
    streak: number;
    completions: HabitCompletionData[];
    freezeCount: number;
    isCurrentlyFrozen: boolean;
  };
  onComplete: () => Promise<void>;
  isCompletedToday: boolean;
}

export function HabitCard({ habit, onComplete, isCompletedToday }: HabitCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFreeezing, isFreezing] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/habits/complete', {
        method: 'POST',
        body: JSON.stringify({ habitId: habit.id }),
      });

      if (res.ok) {
        await onComplete();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to complete habit');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseFreeze = async () => {
    isFreezing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/habits/freeze-streak', {
        method: 'POST',
        body: JSON.stringify({ habitId: habit.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || '✨ Streak saved!');
        await onComplete();
      } else {
        setError(data.error || 'Failed to use freeze');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      isFreezing(false);
    }
  };

  const handleBuyFreeze = async () => {
    setIsBuying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/habits/buy-freeze', {
        method: 'POST',
        body: JSON.stringify({ habitId: habit.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || '✨ Freeze purchased!');
        await onComplete();
      } else {
        setError(data.error || 'Failed to purchase freeze');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsBuying(false);
    }
  };

  const difficultyColor =
    DIFFICULTY_COLORS[habit.difficulty as keyof typeof DIFFICULTY_COLORS];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-3xl mb-2">{habit.icon}</div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {habit.description}
            </p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${difficultyColor.bg} ${difficultyColor.text}`}
        >
          {difficultyColor.label}
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-xl">⭐</span>
          <span className="text-gray-700 dark:text-gray-300 font-semibold">
            +{habit.xpReward} XP
          </span>
        </div>
        {habit.streak > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xl">🔥</span>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">
              {habit.streak} day streak
            </span>
          </div>
        )}
        {habit.freezeCount > 0 && (
          <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
            <span className="text-xl">🧊</span>
            <span className="text-blue-700 dark:text-blue-200 font-semibold text-xs">
              {habit.freezeCount} freeze{habit.freezeCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>
      )}

      {/* Success Message */}
      {successMessage && (
        <p className="text-green-600 dark:text-green-400 text-sm mb-3">{successMessage}</p>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        {/* Use Freeze Button */}
        {habit.freezeCount > 0 && !isCompletedToday && !habit.isCurrentlyFrozen && (
          <button
            onClick={handleUseFreeze}
            disabled={isFreeezing || isLoading}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
              isFreeezing
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
            }`}
          >
            <span>🧊</span>
            {isFreeezing ? 'Using...' : 'Use Freeze'}
          </button>
        )}

        {/* Buy Freeze Button */}
        {!isCompletedToday && (
          <button
            onClick={handleBuyFreeze}
            disabled={isBuying || isLoading}
            className={`py-2 px-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
              isBuying
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                : 'bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700'
            }`}
            title="Buy Streak Freeze - 50 points"
          >
            <span>🧊</span>
            {isBuying ? '...' : 'Buy'}
          </button>
        )}

        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={isLoading || isCompletedToday}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            isCompletedToday
              ? 'bg-green-100 text-green-800 cursor-not-allowed dark:bg-green-900 dark:text-green-200'
              : isLoading
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
          }`}
        >
          {isLoading ? '⏳ Processing...' : isCompletedToday ? '✓ Done Today!' : '✓ Complete'}
        </button>
      </div>
    </div>
  );
}
