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
    name: 'Novice',
    icon: '🌱',
    minPoints: 0,
    clickMultiplier: 1.0,
    adReward: 50,
    dailyBonusMultiplier: 1.0,
    comboBonus: 0,
    description: 'Welcome! Start your clicking journey',
  },
  {
    level: 2,
    name: 'Apprentice',
    icon: '📚',
    minPoints: 1000,
    clickMultiplier: 1.08,
    adReward: 55,
    dailyBonusMultiplier: 1.08,
    comboBonus: 3,
    description: '+8% rewards, +3% combo bonus',
  },
  {
    level: 3,
    name: 'Skilled',
    icon: '⚒️',
    minPoints: 2500,
    clickMultiplier: 1.15,
    adReward: 65,
    dailyBonusMultiplier: 1.15,
    comboBonus: 6,
    description: '+15% rewards, +6% combo bonus',
  },
  {
    level: 4,
    name: 'Adept',
    icon: '🎯',
    minPoints: 5000,
    clickMultiplier: 1.25,
    adReward: 75,
    dailyBonusMultiplier: 1.25,
    comboBonus: 10,
    description: '+25% rewards, +10% combo bonus',
  },
  {
    level: 5,
    name: 'Proficient',
    icon: '💎',
    minPoints: 10000,
    clickMultiplier: 1.35,
    adReward: 90,
    dailyBonusMultiplier: 1.35,
    comboBonus: 15,
    description: '+35% rewards, +15% combo bonus',
  },
  {
    level: 6,
    name: 'Expert',
    icon: '⚡',
    minPoints: 20000,
    clickMultiplier: 1.5,
    adReward: 110,
    dailyBonusMultiplier: 1.5,
    comboBonus: 20,
    description: '+50% rewards, +20% combo bonus',
  },
  {
    level: 7,
    name: 'Master',
    icon: '👑',
    minPoints: 40000,
    clickMultiplier: 1.7,
    adReward: 140,
    dailyBonusMultiplier: 1.7,
    comboBonus: 25,
    description: '+70% rewards, +25% combo bonus',
  },
  {
    level: 8,
    name: 'Grandmaster',
    icon: '🔥',
    minPoints: 75000,
    clickMultiplier: 2.0,
    adReward: 180,
    dailyBonusMultiplier: 2.0,
    comboBonus: 35,
    description: '2x rewards, +35% combo bonus',
  },
  {
    level: 9,
    name: 'Legend',
    icon: '🌟',
    minPoints: 150000,
    clickMultiplier: 2.5,
    adReward: 250,
    dailyBonusMultiplier: 2.5,
    comboBonus: 50,
    description: '2.5x rewards, +50% combo bonus',
  },
  {
    level: 10,
    name: 'Mythic',
    icon: '✨',
    minPoints: 300000,
    clickMultiplier: 3.0,
    adReward: 350,
    dailyBonusMultiplier: 3.0,
    comboBonus: 75,
    description: '3x rewards, +75% combo bonus',
  },
  {
    level: 11,
    name: 'Celestial',
    icon: '🌙',
    minPoints: 500000,
    clickMultiplier: 3.5,
    adReward: 500,
    dailyBonusMultiplier: 3.5,
    comboBonus: 100,
    description: '3.5x rewards, +100% combo bonus',
  },
  {
    level: 12,
    name: 'Divine',
    icon: '🔱',
    minPoints: 1000000,
    clickMultiplier: 4.5,
    adReward: 750,
    dailyBonusMultiplier: 4.5,
    comboBonus: 150,
    description: '4.5x rewards, +150% combo bonus',
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
