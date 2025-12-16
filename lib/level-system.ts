/**
 * Leveling System
 * Defines level-based benefits and progression
 */

export interface LevelBenefits {
  level: number;
  name: string;
  icon: string;
  minPoints: number;
  xpMultiplier: number; // 1.0 = 1x, 1.5 = 1.5x
  adReward: number;
  dailyBonusMultiplier: number;
  description: string;
}

export const LEVEL_SYSTEM: LevelBenefits[] = [
  {
    level: 1,
    name: 'Novice',
    icon: '🌱',
    minPoints: 0,
    xpMultiplier: 1.0,
    adReward: 50,
    dailyBonusMultiplier: 1.0,
    description: 'Start your productivity journey',
  },
  {
    level: 2,
    name: 'Apprentice',
    icon: '📚',
    minPoints: 100,
    xpMultiplier: 1.1,
    adReward: 55,
    dailyBonusMultiplier: 1.1,
    description: '+10% XP rewards',
  },
  {
    level: 3,
    name: 'Consistent',
    icon: '⚒️',
    minPoints: 250,
    xpMultiplier: 1.2,
    adReward: 65,
    dailyBonusMultiplier: 1.2,
    description: '+20% XP rewards',
  },
  {
    level: 4,
    name: 'Disciplined',
    icon: '🎯',
    minPoints: 500,
    xpMultiplier: 1.3,
    adReward: 75,
    dailyBonusMultiplier: 1.3,
    description: '+30% XP rewards',
  },
  {
    level: 5,
    name: 'Proficient',
    icon: '💎',
    minPoints: 1000,
    xpMultiplier: 1.4,
    adReward: 90,
    dailyBonusMultiplier: 1.4,
    description: '+40% XP rewards',
  },
  {
    level: 6,
    name: 'Expert',
    icon: '⚡',
    minPoints: 2500,
    xpMultiplier: 1.5,
    adReward: 110,
    dailyBonusMultiplier: 1.5,
    description: '+50% XP rewards',
  },
  {
    level: 7,
    name: 'Master',
    icon: '👑',
    minPoints: 5000,
    xpMultiplier: 1.75,
    adReward: 140,
    dailyBonusMultiplier: 1.75,
    description: '+75% XP rewards',
  },
  {
    level: 8,
    name: 'Grandmaster',
    icon: '🔥',
    minPoints: 10000,
    xpMultiplier: 2.0,
    adReward: 200,
    dailyBonusMultiplier: 2.0,
    description: 'Double XP rewards!',
  },
  {
    level: 9,
    name: 'Legend',
    icon: '🌟',
    minPoints: 25000,
    xpMultiplier: 2.5,
    adReward: 250,
    dailyBonusMultiplier: 2.5,
    description: '2.5x XP rewards!',
  },
  {
    level: 10,
    name: 'Mythic',
    icon: '✨',
    minPoints: 50000,
    xpMultiplier: 3.0,
    adReward: 350,
    dailyBonusMultiplier: 3.0,
    description: '3x XP rewards!',
  },
  {
    level: 11,
    name: 'Celestial',
    icon: '🌙',
    minPoints: 100000,
    xpMultiplier: 3.5,
    adReward: 500,
    dailyBonusMultiplier: 3.5,
    description: '3.5x XP rewards!',
  },
  {
    level: 12,
    name: 'Divine',
    icon: '🔱',
    minPoints: 250000,
    xpMultiplier: 4.5,
    adReward: 750,
    dailyBonusMultiplier: 4.5,
    description: '4.5x XP rewards!',
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
