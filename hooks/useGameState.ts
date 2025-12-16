/**
 * Game State Hook
 * 
 * Central hook for managing all game state:
 * - User data (points, level)
 * - Rewards (shop inventory)
 * - Habits (user's habits and completions)
 * 
 * Usage:
 * const { user, rewards, habits, loading, error, updateUser, addHabit, completeHabit } = useGameState();
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  User,
  Reward,
  Habit,
  HabitCompletion,
  GameState,
  INITIAL_GAME_STATE,
  HABIT_DIFFICULTY_POINTS,
} from '@/lib/data-structures';

export interface UseGameStateReturn {
  // State
  user: User | null;
  rewards: Reward[];
  habits: Habit[];
  completions: HabitCompletion[];
  loading: boolean;
  error: string | null;

  // User Actions
  updateUser: (updates: Partial<User>) => void;
  addPoints: (amount: number) => void;

  // Habit Actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  completeHabit: (habitId: string) => HabitCompletion | null;

  // Reward Actions
  addReward: (reward: Omit<Reward, 'id' | 'createdAt'>) => void;
  purchaseReward: (rewardId: string) => boolean; // Returns true if successful
  setRewards: (rewards: Reward[]) => void;

  // Fetch Actions
  fetchUser: () => Promise<void>;
  fetchRewards: () => Promise<void>;
  fetchHabits: () => Promise<void>;
}

/**
 * Main game state hook
 * Manages user, rewards, and habits in a single source of truth
 */
export function useGameState(): UseGameStateReturn {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);

  // ============================================================================
  // USER ACTIONS
  // ============================================================================

  const updateUser = useCallback((updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  }, []);

  const addPoints = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      user: prev.user
        ? {
            ...prev.user,
            points: prev.user.points + amount,
            lifetimePoints: prev.user.lifetimePoints + amount,
          }
        : null,
    }));
  }, []);

  // ============================================================================
  // HABIT ACTIONS
  // ============================================================================

  const addHabit = useCallback(
    (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newHabit: Habit = {
        ...habitData,
        id: `habit-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setState((prev) => ({
        ...prev,
        habits: [...prev.habits, newHabit],
      }));
    },
    []
  );

  const updateHabit = useCallback((habitId: string, updates: Partial<Habit>) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              ...updates,
              updatedAt: new Date(),
            }
          : habit
      ),
    }));
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
  }, []);

  /**
   * Complete a habit and award points
   * Returns the completion record with points earned
   */
  const completeHabit = useCallback(
    (habitId: string): HabitCompletion | null => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return null;

      const now = new Date();
      
      // Calculate points earned
      const basePoints = HABIT_DIFFICULTY_POINTS[habit.difficulty];
      
      // Streak multiplier: 1.0 + (0.1 × streak), capped at 2.0
      const streakMultiplier = Math.min(1 + habit.currentStreak * 0.1, 2.0);
      const streakBonus = Math.floor(basePoints * (streakMultiplier - 1));
      
      // First completion today bonus: +20%
      const isFirstToday = !habit.completedAt || 
        habit.completedAt.toDateString() !== now.toDateString();
      const difficultyBonus = isFirstToday 
        ? Math.floor(basePoints * 0.2) 
        : 0;
      
      const totalPoints = basePoints + streakBonus + difficultyBonus;

      // Create completion record
      const completion: HabitCompletion = {
        id: `completion-${Date.now()}`,
        habitId,
        userId: state.user?.id || '',
        basePoints,
        streakBonus,
        difficultyBonus,
        totalPoints,
        completedAt: now,
      };

      // Update habit
      const newStreak = isFirstToday ? habit.currentStreak + 1 : habit.currentStreak;
      const newLongestStreak = Math.max(habit.longestStreak, newStreak);

      updateHabit(habitId, {
        completed: true,
        completedAt: now,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
      });

      // Award points to user
      addPoints(totalPoints);

      // Add completion to history
      setState((prev) => ({
        ...prev,
        completions: [...prev.completions, completion],
      }));

      return completion;
    },
    [state.habits, state.user?.id, updateHabit, addPoints]
  );

  // ============================================================================
  // REWARD ACTIONS
  // ============================================================================

  const addReward = useCallback(
    (rewardData: Omit<Reward, 'id' | 'createdAt'>) => {
      const newReward: Reward = {
        ...rewardData,
        id: `reward-${Date.now()}`,
        createdAt: new Date(),
      };

      setState((prev) => ({
        ...prev,
        rewards: [...prev.rewards, newReward],
      }));
    },
    []
  );

  const purchaseReward = useCallback(
    (rewardId: string): boolean => {
      const reward = state.rewards.find((r) => r.id === rewardId);
      const currentUser = state.user;

      if (!reward || !currentUser) return false;

      // Check if user has enough points
      if (currentUser.points < reward.costPoints) {
        return false;
      }

      // Check if reward is in stock
      if (reward.stock !== null && reward.stock <= 0) {
        return false;
      }

      // Deduct points from user
      addPoints(-reward.costPoints);

      // Reduce stock if limited
      if (reward.stock !== null) {
        setState((prev) => ({
          ...prev,
          rewards: prev.rewards.map((r) =>
            r.id === rewardId
              ? { ...r, stock: (r.stock || 0) - 1 }
              : r
          ),
        }));
      }

      return true;
    },
    [state.rewards, state.user, addPoints]
  );

  const setRewards = useCallback((rewards: Reward[]) => {
    setState((prev) => ({
      ...prev,
      rewards,
    }));
  }, []);

  // ============================================================================
  // FETCH ACTIONS (for API calls)
  // ============================================================================

  const fetchUser = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      // Replace with your API endpoint
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (response.ok) {
        setState((prev) => ({
          ...prev,
          user: data.user,
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: data.message || 'Failed to fetch user',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchRewards = useCallback(async () => {
    try {
      // Replace with your API endpoint
      const response = await fetch('/api/store/rewards');
      const data = await response.json();
      
      if (response.ok) {
        setState((prev) => ({
          ...prev,
          rewards: data.rewards || [],
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: data.message || 'Failed to fetch rewards',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch rewards',
      }));
    }
  }, []);

  const fetchHabits = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      // Replace with your API endpoint
      const response = await fetch('/api/habits');
      const data = await response.json();
      
      if (response.ok) {
        setState((prev) => ({
          ...prev,
          habits: data.habits || [],
          completions: data.completions || [],
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: data.message || 'Failed to fetch habits',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch habits',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    // State
    user: state.user,
    rewards: state.rewards,
    habits: state.habits,
    completions: state.completions,
    loading: state.loading,
    error: state.error,

    // User actions
    updateUser,
    addPoints,

    // Habit actions
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,

    // Reward actions
    addReward,
    purchaseReward,
    setRewards,

    // Fetch actions
    fetchUser,
    fetchRewards,
    fetchHabits,
  };
}

// ============================================================================
// UTILITY FUNCTIONS FOR CALCULATIONS
// ============================================================================

/**
 * Calculate points earned from completing a habit
 */
export function calculateHabitPoints(
  difficulty: string,
  currentStreak: number,
  isFirstCompletionToday: boolean
): { basePoints: number; streakBonus: number; difficultyBonus: number; total: number } {
  const basePoints = HABIT_DIFFICULTY_POINTS[difficulty as keyof typeof HABIT_DIFFICULTY_POINTS] || 25;
  
  // Streak multiplier
  const streakMultiplier = Math.min(1 + currentStreak * 0.1, 2.0);
  const streakBonus = Math.floor(basePoints * (streakMultiplier - 1));
  
  // First completion bonus
  const difficultyBonus = isFirstCompletionToday
    ? Math.floor(basePoints * 0.2)
    : 0;
  
  const total = basePoints + streakBonus + difficultyBonus;

  return {
    basePoints,
    streakBonus,
    difficultyBonus,
    total,
  };
}

/**
 * Get habit status for a specific date
 */
export function getHabitStatus(habit: Habit, date: Date): 'completed' | 'in-progress' | 'missed' {
  if (!habit.completedAt) return 'missed';
  
  const completedDate = new Date(habit.completedAt).toDateString();
  const checkDate = new Date(date).toDateString();
  
  if (completedDate === checkDate) return 'completed';
  return 'missed';
}

/**
 * Calculate completion percentage for a habit
 */
export function getCompletionRate(
  habit: Habit,
  completions: HabitCompletion[],
  daysToCheck: number = 30
): number {
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  return (habitCompletions.length / daysToCheck) * 100;
}
