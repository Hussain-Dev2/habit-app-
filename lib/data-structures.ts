/**
 * Data Structures for Gamified Habit Tracker SaaS
 * 
 * Central definitions for all core data objects:
 * - User: Player profile with points and level
 * - Reward: Previously called "Product" - redeemable items
 * - Habit: Daily/weekly habits to complete for points
 */

// ============================================================================
// USER DATA STRUCTURE
// ============================================================================

export interface User {
  id: string;
  email?: string;
  name?: string | null;
  image?: string | null;
  
  // Points & Level System
  points: number; // Current spendable points
  lifetimePoints: number; // Total points earned (used for level calculation)
  level?: number; // Current level (calculated from lifetimePoints)
  
  // Tracking
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Lightweight user display object for components
 */
export interface UserDisplay {
  id: string;
  points: number;
  lifetimePoints: number;
  clicks?: number; // Legacy support
  isAdmin?: boolean;
}

// ============================================================================
// REWARD DATA STRUCTURE (Previously "Product")
// ============================================================================

export type RewardCategory = 
  | 'Google Play'
  | 'iTunes'
  | 'Steam'
  | 'Game Codes'
  | 'Subscription'
  | 'Other';

export type RewardRegion = 
  | 'USA'
  | 'EU'
  | 'UK'
  | 'Global'
  | 'Asia';

export interface Reward {
  id: string;
  title: string;
  description?: string | null;
  costPoints: number; // Points required to redeem
  stock?: number | null; // null = unlimited
  imageUrl?: string | null;
  category?: RewardCategory | null;
  value?: string | null; // e.g., "$10", "$25", "100 Coins"
  region?: RewardRegion | null;
  isDigital: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Sample rewards data for development/seeding
 */
export const SAMPLE_REWARDS: Reward[] = [
  {
    id: 'reward-1',
    title: 'Google Play Gift Card ($10)',
    description: 'Digital gift card for Google Play Store',
    costPoints: 100,
    stock: null, // Unlimited
    imageUrl: 'https://via.placeholder.com/150?text=Google+Play',
    category: 'Google Play',
    value: '$10',
    region: 'Global',
    isDigital: true,
    createdAt: new Date(),
  },
  {
    id: 'reward-2',
    title: 'iTunes Gift Card ($15)',
    description: 'Apple iTunes Store credit',
    costPoints: 150,
    stock: null,
    imageUrl: 'https://via.placeholder.com/150?text=iTunes',
    category: 'iTunes',
    value: '$15',
    region: 'Global',
    isDigital: true,
    createdAt: new Date(),
  },
  {
    id: 'reward-3',
    title: 'Steam Wallet Code ($20)',
    description: 'Steam platform game credit',
    costPoints: 200,
    stock: null,
    imageUrl: 'https://via.placeholder.com/150?text=Steam',
    category: 'Steam',
    value: '$20',
    region: 'Global',
    isDigital: true,
    createdAt: new Date(),
  },
];

// ============================================================================
// HABIT DATA STRUCTURE
// ============================================================================

export type HabitDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type HabitCategory = 
  | 'health'
  | 'fitness'
  | 'learning'
  | 'productivity'
  | 'mindfulness'
  | 'social'
  | 'creative'
  | 'other';

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

/**
 * Base points awarded per habit completion
 * Different difficulties award different base points
 */
export const HABIT_DIFFICULTY_POINTS: Record<HabitDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  extreme: 100,
};

/**
 * Difficulty descriptions for UI
 */
export const HABIT_DIFFICULTY_DESCRIPTIONS: Record<HabitDifficulty, string> = {
  easy: 'Quick task (5-15 mins)',
  medium: 'Regular task (15-30 mins)',
  hard: 'Challenging task (30-60 mins)',
  extreme: 'Major commitment (60+ mins)',
};

export interface Habit {
  id: string;
  userId: string;
  
  // Basic Info
  title: string;
  description?: string | null;
  category: HabitCategory;
  
  // Reward Configuration
  difficulty: HabitDifficulty;
  xpValue: number; // Points awarded per completion (auto-calculated from difficulty)
  frequency: HabitFrequency;
  
  // Status Tracking
  completed: boolean; // Completed today?
  completedAt?: Date | null; // Last completion timestamp
  
  // Streak System
  currentStreak: number; // Current consecutive completions
  longestStreak: number; // Personal best streak
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  
  // Points Breakdown
  basePoints: number; // From difficulty
  streakBonus: number; // From streak multiplier
  difficultyBonus: number; // From first-completion-today bonus
  totalPoints: number; // Sum of all bonuses
  
  // Timestamp
  completedAt: Date;
}

/**
 * Habit display object for components (with calculated stats)
 */
export interface HabitDisplay extends Habit {
  pointsEarned?: number; // Total points earned from this habit
  completionRate?: number; // Percentage of days completed
  daysUntilNextStreak?: number; // Days needed for streak milestone
}

/**
 * Sample habits for development/seeding
 */
export const SAMPLE_HABITS: Habit[] = [
  {
    id: 'habit-1',
    userId: 'user-demo',
    title: 'Morning Run',
    description: '30-minute morning jog or run',
    category: 'fitness',
    difficulty: 'medium',
    xpValue: HABIT_DIFFICULTY_POINTS.medium,
    frequency: 'daily',
    completed: false,
    currentStreak: 5,
    longestStreak: 12,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: 'habit-2',
    userId: 'user-demo',
    title: 'Read 30 Pages',
    description: 'Read a book for at least 30 minutes',
    category: 'learning',
    difficulty: 'easy',
    xpValue: HABIT_DIFFICULTY_POINTS.easy,
    frequency: 'daily',
    completed: false,
    currentStreak: 8,
    longestStreak: 20,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: 'habit-3',
    userId: 'user-demo',
    title: 'Meditation',
    description: '10-minute meditation session',
    category: 'mindfulness',
    difficulty: 'easy',
    xpValue: HABIT_DIFFICULTY_POINTS.easy,
    frequency: 'daily',
    completed: false,
    currentStreak: 3,
    longestStreak: 10,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: 'habit-4',
    userId: 'user-demo',
    title: 'Complete Project Task',
    description: 'Work on main project for 1+ hour',
    category: 'productivity',
    difficulty: 'hard',
    xpValue: HABIT_DIFFICULTY_POINTS.hard,
    frequency: 'daily',
    completed: false,
    currentStreak: 2,
    longestStreak: 7,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date(),
    isActive: true,
  },
];

// ============================================================================
// GAME STATE STRUCTURE
// ============================================================================

/**
 * Complete game state object that combines user, rewards, and habits
 * This represents the full application state
 */
export interface GameState {
  // User Profile
  user: User | null;
  
  // Available Rewards (shop inventory)
  rewards: Reward[];
  
  // User's Habits
  habits: Habit[];
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // User's Habit Completions
  completions: HabitCompletion[];
}

/**
 * Initial game state
 */
export const INITIAL_GAME_STATE: GameState = {
  user: null,
  rewards: SAMPLE_REWARDS,
  habits: [],
  loading: true,
  error: null,
  completions: [],
};

// ============================================================================
// POINT CALCULATION CONSTANTS
// ============================================================================

export const HABIT_POINTS_CONFIG = {
  // Streak multiplier: 1.0 base + 0.1 per day, capped at 2.0
  STREAK_BONUS_MULTIPLIER: 0.1,
  MAX_STREAK_BONUS: 2.0,
  
  // First completion of the day bonus: +20%
  FIRST_COMPLETION_TODAY_BONUS: 0.2,
  
  // Consistency bonuses at specific streak milestones
  CONSISTENCY_BONUSES: {
    3: 30, // +30 points at 3-day streak
    7: 100, // +100 points at 7-day streak
    14: 250, // +250 points at 14-day streak
    30: 500, // +500 points at 30-day streak
  },
};

// ============================================================================
// TYPES & ENUMS
// ============================================================================

export type HabitStatus = 'completed' | 'in-progress' | 'missed';

export interface StreakMilestone {
  days: number;
  bonus: number;
  achievement: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, bonus: 30, achievement: '🔥 3-Day Streak' },
  { days: 7, bonus: 100, achievement: '🌟 Week Warrior' },
  { days: 14, bonus: 250, achievement: '💎 Fortnight Master' },
  { days: 30, bonus: 500, achievement: '👑 Monthly Legend' },
];
