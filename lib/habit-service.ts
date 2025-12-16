/**
 * Habit Service
 * 
 * Core business logic for habit management:
 * - Creating habits
 * - Completing habits
 * - Calculating XP rewards
 * - Level up detection
 * - Habit statistics
 */

import { prisma } from '@/lib/prisma';
import knockClient from '@/lib/knock';
import { 
  HABIT_DIFFICULTY_REWARDS, 
  DIFFICULTY_BONUS_CHANCE, 
  CRITICAL_SUCCESS_MULTIPLIER,
  HabitDifficulty 
} from '@/lib/habit-constants';
import { calculateLevel } from '@/lib/level-system';

export async function completeHabit(userId: string, habitId: string) {
  try {
    // 1. Fetch the habit with validation
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        completions: {
          where: {
            completedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });

    if (!habit) {
      throw new Error('Habit not found');
    }

    if (habit.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Check if already completed today
    if (habit.completions.length > 0) {
      throw new Error('Already completed today');
    }

    // 2. Calculate XP reward based on difficulty with Variable Bonus
    const difficulty = (habit.difficulty as HabitDifficulty) || 'easy';
    const baseXp = HABIT_DIFFICULTY_REWARDS[difficulty];
    
    // Variable Reward Logic: Critical Success Check
    const bonusChance = DIFFICULTY_BONUS_CHANCE[difficulty] || 0.05;
    const isCritical = Math.random() < bonusChance;
    
    const finalXp = isCritical 
      ? Math.round(baseXp * CRITICAL_SUCCESS_MULTIPLIER) 
      : baseXp;

    // 3. Create completion record
    const completion = await prisma.habitCompletion.create({
      data: {
        habitId,
        userId,
        pointsEarned: finalXp,
      },
    });

    // 4. Update user points
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: finalXp },
        lifetimePoints: { increment: finalXp },
      },
    });

    // 5. Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    
    // Check if streak is continuous (completed yesterday OR today via freeze)
    // We check 'today' as well because if a user froze the habit today, lastCompletedAt is today.
    // If they then complete it, we shouldn't reset the streak.
    let isContinuous = false;
    if (habit.lastCompletedAt) {
      const lastCompletedTime = new Date(habit.lastCompletedAt).getTime();
      if (lastCompletedTime >= startOfYesterday.getTime()) {
        isContinuous = true;
      }
    }

    const newStreak = isContinuous ? habit.streak + 1 : 1;

    await prisma.habit.update({
      where: { id: habitId },
      data: {
        streak: newStreak,
        lastCompletedAt: new Date(),
        isCurrentlyFrozen: false, // Unfreeze if it was frozen
      },
    });

    // 6. Check for level up
    const oldLevel = calculateLevel(user.lifetimePoints - finalXp).level;
    const newLevel = calculateLevel(user.lifetimePoints).level;

    if (newLevel > oldLevel) {
      // Level up! Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'level_up',
          title: '🎉 Level Up!',
          message: `Congratulations! You reached Level ${newLevel}!`,
        },
      });

      // Trigger Knock workflow
      try {
        await knockClient.workflows.trigger('f_app', {
          recipients: [userId],
          data: {
            type: 'level-up',
            level: newLevel,
            message: `Congratulations! You reached Level ${newLevel}!`,
          },
        });
      } catch (error) {
        console.error('Error triggering Knock workflow:', error);
      }
    }

    // 7. Check Achievements
    const newAchievements = await checkAchievements(userId, newStreak);

    return {
      completion,
      newStreak,
      pointsEarned: finalXp,
      isCritical,
      leveledUp: newLevel > oldLevel,
      newLevel,
      newAchievements,
    };
  } catch (error) {
    console.error('Error completing habit:', error);
    throw error;
  }
}

async function checkAchievements(userId: string, currentStreak: number) {
  try {
    // 1. Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        habits: {
          include: { completions: true }
        },
        achievements: true // UserAchievement[]
      }
    });

    if (!user) return [];

    const totalCompletions = user.habits.reduce((sum, h) => sum + h.completions.length, 0);
    const unlockedAchievementIds = new Set(user.achievements.map(ua => ua.achievementId));
    
    // 2. Get all achievements
    const allAchievements = await prisma.achievement.findMany();
    const newUnlocks = [];

    for (const achievement of allAchievements) {
      if (unlockedAchievementIds.has(achievement.id)) continue;

      let unlocked = false;
      
      if (achievement.requirement.startsWith('habit_count_')) {
        const count = parseInt(achievement.requirement.split('_')[2]);
        if (totalCompletions >= count) unlocked = true;
      } else if (achievement.requirement.startsWith('streak_')) {
        const count = parseInt(achievement.requirement.split('_')[1]);
        if (currentStreak >= count) unlocked = true;
      }

      if (unlocked) {
        // Unlock it
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          }
        });
        
        // Award points
        await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: achievement.reward } }
        });

        // Notify
        await prisma.notification.create({
          data: {
            userId,
            type: 'achievement',
            title: '🏆 Achievement Unlocked!',
            message: `You unlocked: ${achievement.name} (+${achievement.reward} XP)`,
          }
        });

        // Trigger Knock workflow
        try {
          await knockClient.workflows.trigger('f_app', {
            recipients: [userId],
            data: {
              type: 'achievement-unlocked',
              achievement: achievement.name,
              reward: achievement.reward,
              message: `You unlocked: ${achievement.name} (+${achievement.reward} XP)`,
            },
          });
        } catch (error) {
          console.error('Error triggering Knock workflow:', error);
        }

        newUnlocks.push(achievement);
      }
    }

    return newUnlocks;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

export async function createHabit(
  userId: string,
  data: {
    name: string;
    description?: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'very_hard' | 'epic';
    category?: string;
    frequency?: string;
    icon?: string;
    color?: string;
  }
) {
  // Extract only fields that exist in the Habit model
  const habitData = {
    name: data.name,
    description: data.description,
    difficulty: data.difficulty,
    category: data.category || 'Health',
    icon: data.icon,
    userId,
  };

  return prisma.habit.create({
    data: habitData,
  });
}

export async function getUserHabits(userId: string, activeOnly = true) {
  return prisma.habit.findMany({
    where: activeOnly ? { userId, isActive: true } : { userId },
    include: {
      completions: {
        orderBy: { completedAt: 'desc' },
        take: 30, // Last 30 completions
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getHabitStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const [
    totalHabits,
    activeHabits,
    todayCompletions,
    weekCompletions,
    habitsWithStreak
  ] = await Promise.all([
    prisma.habit.count({ where: { userId } }),
    prisma.habit.count({ where: { userId, isActive: true } }),
    prisma.habitCompletion.count({
      where: {
        userId,
        completedAt: { gte: today }
      }
    }),
    prisma.habitCompletion.count({
      where: {
        userId,
        completedAt: { gte: weekAgo }
      }
    }),
    prisma.habit.findMany({
      where: { userId },
      select: { streak: true }
    })
  ]);

  const longestStreak = Math.max(0, ...habitsWithStreak.map(h => h.streak));

  return {
    totalHabits,
    activeHabits,
    todayCompletions,
    weekCompletions,
    longestStreak,
    habitsCompleted: todayCompletions, // Assuming 1 completion per habit per day
  };
}

export async function updateHabit(
  userId: string,
  habitId: string,
  data: Partial<{
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'very_hard' | 'epic';
    isActive: boolean;
    icon: string;
    color: string;
    category: string;
  }>
) {
  // Verify ownership
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit || habit.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return prisma.habit.update({
    where: { id: habitId },
    data,
  });
}

export async function deleteHabit(userId: string, habitId: string) {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit || habit.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return prisma.habit.delete({
    where: { id: habitId },
  });
}
