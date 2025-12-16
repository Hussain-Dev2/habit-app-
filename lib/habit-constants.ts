/**
 * Habit System Constants
 * 
 * Defines the reward structure, categories, and frequency options
 * for the gamified habit tracker
 */

export const HABIT_DIFFICULTY_REWARDS = {
  easy: 15,
  medium: 40,
  hard: 80,
  very_hard: 150,
  epic: 300,
} as const;

export type HabitDifficulty = keyof typeof HABIT_DIFFICULTY_REWARDS;

export const HABIT_CATEGORIES = [
  'fitness',
  'learning',
  'health',
  'productivity',
  'mindfulness',
  'social',
  'creative',
  'other'
] as const;

export const HABIT_FREQUENCIES = [
  'daily',
  'weekly',
  'custom'
] as const;

export const HABIT_ICONS = {
  fitness: '💪',
  learning: '📚',
  health: '🏥',
  productivity: '⚡',
  mindfulness: '🧘',
  social: '👥',
  creative: '🎨',
  other: '📌',
};

export const DIFFICULTY_COLORS = {
  easy: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', label: 'Easy' },
  medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', label: 'Medium' },
  hard: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', label: 'Hard' },
  very_hard: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', label: 'Expert' },
  epic: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', label: 'Epic' },
} as const;

// Variable Reward System Configuration
export const DIFFICULTY_BONUS_CHANCE = {
  easy: 0.05,      // 5% chance of bonus
  medium: 0.10,    // 10% chance
  hard: 0.15,      // 15% chance
  very_hard: 0.20, // 20% chance
  epic: 0.25,      // 25% chance
};

export const CRITICAL_SUCCESS_MULTIPLIER = 2.0; // Double XP on critical success
