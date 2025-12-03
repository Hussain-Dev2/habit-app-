/**
 * Leveling System
 * Defines level-based benefits and progression
 */

export interface LevelBenefits {
  level: number;
  name: string;
  icon: string;
  minPoints: number;
  clickMultiplier: number; // 1.0 = 1x, 1.5 = 1.5x
  adReward: number;
  dailyBonusMultiplier: number;
  comboBonus: number; // Extra % per combo
  description: string;
}

export const LEVEL_SYSTEM: LevelBenefits[] = [
  {
    level: 1,
    name: 'Beginner',
    icon: '🌱',
    minPoints: 0,
    clickMultiplier: 1.0,
    adReward: 50,
    dailyBonusMultiplier: 1.0,
    comboBonus: 0,
    description: 'Just starting your journey',
  },
  {
    level: 2,
    name: 'Rising',
    icon: '📈',
    minPoints: 500,
    clickMultiplier: 1.1,
    adReward: 60,
    dailyBonusMultiplier: 1.1,
    comboBonus: 5,
    description: '+10% click reward, +10% daily bonus, +5% combo',
  },
  {
    level: 3,
    name: 'Climber',
    icon: '⛏️',
    minPoints: 1500,
    clickMultiplier: 1.2,
    adReward: 75,
    dailyBonusMultiplier: 1.2,
    comboBonus: 10,
    description: '+20% click reward, +20% daily bonus, +10% combo',
  },
  {
    level: 4,
    name: 'Achiever',
    icon: '🎯',
    minPoints: 3500,
    clickMultiplier: 1.35,
    adReward: 100,
    dailyBonusMultiplier: 1.35,
    comboBonus: 15,
    description: '+35% click reward, +35% daily bonus, +15% combo',
  },
  {
    level: 5,
    name: 'Expert',
    icon: '⚡',
    minPoints: 7000,
    clickMultiplier: 1.5,
    adReward: 125,
    dailyBonusMultiplier: 1.5,
    comboBonus: 20,
    description: '+50% click reward, +50% daily bonus, +20% combo',
  },
  {
    level: 6,
    name: 'Master',
    icon: '👑',
    minPoints: 12000,
    clickMultiplier: 1.75,
    adReward: 150,
    dailyBonusMultiplier: 1.75,
    comboBonus: 25,
    description: '+75% click reward, +75% daily bonus, +25% combo',
  },
  {
    level: 7,
    name: 'Legend',
    icon: '🌟',
    minPoints: 20000,
    clickMultiplier: 2.0,
    adReward: 200,
    dailyBonusMultiplier: 2.0,
    comboBonus: 30,
    description: '2x click reward, 2x daily bonus, +30% combo',
  },
  {
    level: 8,
    name: 'Mythic',
    icon: '✨',
    minPoints: 35000,
    clickMultiplier: 2.5,
    adReward: 250,
    dailyBonusMultiplier: 2.5,
    comboBonus: 40,
    description: '2.5x click reward, 2.5x daily bonus, +40% combo',
  },
  {
    level: 9,
    name: 'Divine',
    icon: '🔱',
    minPoints: 60000,
    clickMultiplier: 3.0,
    adReward: 300,
    dailyBonusMultiplier: 3.0,
    comboBonus: 50,
    description: '3x click reward, 3x daily bonus, +50% combo',
  },
  {
    level: 10,
    name: 'Godlike',
    icon: '👹',
    minPoints: 100000,
    clickMultiplier: 4.0,
    adReward: 500,
    dailyBonusMultiplier: 4.0,
    comboBonus: 100,
    description: '4x click reward, 4x daily bonus, +100% combo!!!',
  },
];

/**
 * Calculate user level based on lifetime points
 */
export function calculateLevel(lifetimePoints: number): LevelBenefits {
  let level = LEVEL_SYSTEM[0];
  for (const lvl of LEVEL_SYSTEM) {
    if (lifetimePoints >= lvl.minPoints) {
      level = lvl;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Get points needed to reach next level
 */
export function getPointsToNextLevel(lifetimePoints: number): { current: number; next: number; progress: number } {
  const currentLevel = calculateLevel(lifetimePoints);
  const nextLevelIndex = LEVEL_SYSTEM.findIndex(l => l.level === currentLevel.level) + 1;

  if (nextLevelIndex >= LEVEL_SYSTEM.length) {
    return {
      current: lifetimePoints,
      next: currentLevel.minPoints,
      progress: 100,
    };
  }

  const nextLevel = LEVEL_SYSTEM[nextLevelIndex];
  const pointsInCurrentLevel = lifetimePoints - currentLevel.minPoints;
  const pointsNeededForNext = nextLevel.minPoints - currentLevel.minPoints;
  const progress = Math.round((pointsInCurrentLevel / pointsNeededForNext) * 100);

  return {
    current: pointsInCurrentLevel,
    next: pointsNeededForNext,
    progress: Math.min(progress, 100),
  };
}
