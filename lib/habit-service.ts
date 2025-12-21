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

import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/web-push';
import { 
  HABIT_DIFFICULTY_REWARDS, 
  DIFFICULTY_BONUS_CHANCE, 
  CRITICAL_SUCCESS_MULTIPLIER,
  HabitDifficulty 
} from '@/lib/habit-constants';
import { calculateLevel } from '@/lib/level-system';

export async function completeHabit(userId: string, habitId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch the habit with validation
      const habit = await tx.habit.findUnique({
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
      const completion = await tx.habitCompletion.create({
        data: {
          habitId,
          userId,
          pointsEarned: finalXp,
        },
      });

      // 4. Update user points
      const user = await tx.user.update({
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
      
      let isContinuous = false;
      if (habit.lastCompletedAt) {
        const lastCompletedTime = new Date(habit.lastCompletedAt).getTime();
        if (lastCompletedTime >= startOfYesterday.getTime()) {
          isContinuous = true;
        }
      }

      const newStreak = isContinuous ? habit.streak + 1 : 1;

      await tx.habit.update({
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
        await tx.notification.create({
          data: {
            userId,
            type: 'level_up',
            title: '🎉 Level Up!',
            message: `Congratulations! You reached Level ${newLevel}!`,
          },
        });

        // Send Push Notification (Async / Fire-and-forget)
        try {
          const subscriptions = await tx.pushSubscription.findMany({
            where: { userId },
          });

          const payload = {
            title: '🎉 Level Up!',
            body: `Congratulations! You reached Level ${newLevel}!`,
            url: '/stats',
          };

          Promise.all(subscriptions.map(sub => sendPushNotification({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          }, payload))).catch(console.error);
        } catch (error) {
          console.error('Error scheduling push notification:', error);
        }
      }

      // 7. Check Achievements (passing tx)
      const newAchievements = await checkAchievements(userId, newStreak, tx);

      return {
        completion,
        newStreak,
        pointsEarned: finalXp,
        isCritical,
        leveledUp: newLevel > oldLevel,
        newLevel,
        newAchievements,
      };
    });
  } catch (error) {
    console.error('Error completing habit:', error);
    throw error;
  }
}

// Optimized achievement check using aggregations to avoid loading full history
async function checkAchievements(userId: string, currentStreak: number, tx: Prisma.TransactionClient | PrismaClient = prisma) {
  try {
    // 1. Get user's unlocked achievements (Lightweight)
    const userAchievements = await tx.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true }
    });
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
    
    // 2. Get aggregated stats (Fast)
    const totalCompletions = await tx.habitCompletion.count({
      where: { userId }
    });

    // 3. Get all available achievements
    const allAchievements = await tx.achievement.findMany();
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
        await tx.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          }
        });
        
        // Award points
        await tx.user.update({
          where: { id: userId },
          data: { points: { increment: achievement.reward } }
        });

        // Notify
        await tx.notification.create({
          data: {
            userId,
            type: 'achievement',
            title: '🏆 Achievement Unlocked!',
            message: `You unlocked: ${achievement.name} (+${achievement.reward} XP)`,
          }
        });

        // Send Push Notification (Async - non-blocking)
        // We fetch subs inside safe try/catch block
        try {
           const subscriptions = await tx.pushSubscription.findMany({
             where: { userId },
           });

           const payload = {
             title: '🏆 Achievement Unlocked!',
             body: `You unlocked: ${achievement.name} (+${achievement.reward} XP)`,
             url: '/achievements',
           };

           // Fire and forget push notifications
           Promise.all(subscriptions.map(sub => sendPushNotification({
             endpoint: sub.endpoint,
             keys: { p256dh: sub.p256dh, auth: sub.auth }
           }, payload))).catch(console.error);
        } catch (error) {
           console.error('Error sending push notification:', error);
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
  const habits = await prisma.habit.findMany({
    where: activeOnly ? { userId, isActive: true } : { userId },
    include: {
      completions: {
        orderBy: { completedAt: 'desc' },
        take: 30, // Last 30 completions
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Dynamic Streak Calculation
  // If lastCompletedAt is older than yesterday, the streak is broken (0) for display purposes.
  // We don't update the DB on read to avoid perf hits, but the UI will show correct state.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return habits.map(habit => {
    let effectiveStreak = habit.streak;
    
    // Check if streak is broken
    if (habit.lastCompletedAt) {
      const lastCompletedDate = new Date(habit.lastCompletedAt);
      lastCompletedDate.setHours(0, 0, 0, 0);
      
      // If last completed was before yesterday, streak is broken
      // (Unless the habit is frozen, which is a feature not yet fully implemented in service but present in schema)
      if (lastCompletedDate < yesterday && !habit.isCurrentlyFrozen) {
        effectiveStreak = 0;
      }
    } else {
      // Never completed
      effectiveStreak = 0;
    }

    return {
      ...habit,
      streak: effectiveStreak
    };
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
