/**
 * Smart Points System Utilities
 * Handles all point calculations and transformations
 */

export const POINTS_CONFIG = {
  CLICK_BASE_REWARD: 1,
  AD_REWARD: 50,
  TASK_BASE_REWARD: 25,
  DAILY_BONUS_THRESHOLD: 100, // clicks needed for daily bonus
  DAILY_BONUS_MULTIPLIER: 1.5,
  STREAK_BONUS_MULTIPLIER: 1.1, // per day of streak
  MAX_STREAK_BONUS: 2.0, // cap at 2x
};

export const ACHIEVEMENTS = {
  FIRST_CLICK: {
    id: 'first_click',
    name: 'First Click',
    description: 'Complete your first click',
    requirement: 1,
    reward: 100,
  },
  HUNDRED_CLICKS: {
    id: 'hundred_clicks',
    name: 'Century',
    description: 'Reach 100 clicks',
    requirement: 100,
    reward: 500,
  },
  THOUSAND_CLICKS: {
    id: 'thousand_clicks',
    name: 'Millionaire Clicker',
    description: 'Reach 1,000 clicks',
    requirement: 1000,
    reward: 2000,
  },
  THOUSAND_POINTS: {
    id: 'thousand_points',
    name: 'Big Earner',
    description: 'Earn 1,000 lifetime points',
    requirement: 1000,
    reward: 500,
  },
  FIVE_THOUSAND_POINTS: {
    id: 'five_thousand_points',
    name: 'Rich',
    description: 'Earn 5,000 lifetime points',
    requirement: 5000,
    reward: 1000,
  },
  STREAK_7_DAYS: {
    id: 'streak_7_days',
    name: '7-Day Streak',
    description: 'Maintain a 7-day streak',
    requirement: 7,
    reward: 300,
  },
  STREAK_30_DAYS: {
    id: 'streak_30_days',
    name: 'Monthly Warrior',
    description: 'Maintain a 30-day streak',
    requirement: 30,
    reward: 1500,
  },
};

/**
 * Calculate points earned from a click
 * Takes into account streak bonus and daily multiplier
 */
export function calculateClickReward(
  streakDays: number = 0,
  dailyClicks: number = 0
): number {
  let reward = POINTS_CONFIG.CLICK_BASE_REWARD;

  // Apply streak bonus
  const streakMultiplier = Math.min(
    1 + (streakDays * (POINTS_CONFIG.STREAK_BONUS_MULTIPLIER - 1)),
    POINTS_CONFIG.MAX_STREAK_BONUS
  );
  reward = Math.floor(reward * streakMultiplier);

  // Apply daily bonus if threshold met
  if (dailyClicks >= POINTS_CONFIG.DAILY_BONUS_THRESHOLD) {
    reward = Math.floor(reward * POINTS_CONFIG.DAILY_BONUS_MULTIPLIER);
  }

  return reward;
}

/**
 * Calculate daily bonus if user has reached click threshold
 */
export function getDailyBonus(dailyClicks: number): number {
  if (dailyClicks >= POINTS_CONFIG.DAILY_BONUS_THRESHOLD) {
    return 100; // 100 bonus points
  }
  return 0;
}

/**
 * Format points with commas
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Get achievement by ID
 */
export function getAchievement(id: string) {
  return Object.values(ACHIEVEMENTS).find((a) => a.id === id);
}

/**
 * Check if user should unlock achievement
 */
export function checkAchievements(
  clicks: number,
  lifetimePoints: number,
  streakDays: number
): string[] {
  const unlockedAchievements: string[] = [];

  if (clicks >= 1) unlockedAchievements.push('first_click');
  if (clicks >= 100) unlockedAchievements.push('hundred_clicks');
  if (clicks >= 1000) unlockedAchievements.push('thousand_clicks');
  if (lifetimePoints >= 1000) unlockedAchievements.push('thousand_points');
  if (lifetimePoints >= 5000) unlockedAchievements.push('five_thousand_points');
  if (streakDays >= 7) unlockedAchievements.push('streak_7_days');
  if (streakDays >= 30) unlockedAchievements.push('streak_30_days');

  return unlockedAchievements;
}

/**
 * Format time in seconds to readable format
 */
export function formatSessionTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
