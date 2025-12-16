/**
 * Habit Analytics Service
 * 
 * Provides:
 * - Daily habit tracking
 * - Weekly analytics
 * - Monthly statistics
 * - Completion trends
 * - Category breakdown
 */

import { prisma } from '@/lib/prisma';

export async function getHabitAnalytics(userId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Calculate date ranges
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all habits for user
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      completions: {
        where: {
          completedAt: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: { completedAt: 'desc' },
      },
    },
  });

  // Calculate daily stats (last 7 days)
  const dailyStats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const completions = await prisma.habitCompletion.count({
      where: {
        userId,
        completedAt: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    dailyStats.push({
      date: date.toISOString().split('T')[0],
      completions,
      label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
    });
  }

  // Calculate weekly stats (last 4 weeks)
  const weeklyStats = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const completions = await prisma.habitCompletion.count({
      where: {
        userId,
        completedAt: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    const xpEarned = await prisma.habitCompletion.aggregate({
      where: {
        userId,
        completedAt: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      _sum: {
        pointsEarned: true,
      },
    });

    weeklyStats.push({
      week: `Week ${4 - i}`,
      completions,
      xpEarned: xpEarned._sum.pointsEarned || 0,
      startDate: weekStart.toISOString().split('T')[0],
    });
  }

  // Calculate monthly stats
  const monthCompletions = await prisma.habitCompletion.count({
    where: {
      userId,
      completedAt: {
        gte: monthStart,
      },
    },
  });

  const monthXP = await prisma.habitCompletion.aggregate({
    where: {
      userId,
      completedAt: {
        gte: monthStart,
      },
    },
    _sum: {
      pointsEarned: true,
    },
  });

  // Category breakdown
  const categoryStats = await Promise.all(
    ['Health', 'Fitness', 'Learning', 'Productivity', 'Social'].map(
      async (category) => {
        const habitIds = habits
          .filter((h) => h.category === category)
          .map((h) => h.id);

        const completions = await prisma.habitCompletion.count({
          where: {
            userId,
            habitId: { in: habitIds },
            completedAt: { gte: monthStart },
          },
        });

        return {
          category,
          completions,
          habits: habits.filter((h) => h.category === category).length,
        };
      }
    )
  );

  // Difficulty breakdown
  const difficultyStats = await Promise.all(
    ['easy', 'medium', 'hard'].map(async (difficulty) => {
      const habitIds = habits
        .filter((h) => h.difficulty === difficulty)
        .map((h) => h.id);

      const completions = await prisma.habitCompletion.count({
        where: {
          userId,
          habitId: { in: habitIds },
          completedAt: { gte: monthStart },
        },
      });

      const xp = await prisma.habitCompletion.aggregate({
        where: {
          userId,
          habitId: { in: habitIds },
          completedAt: { gte: monthStart },
        },
        _sum: {
          pointsEarned: true,
        },
      });

      const xpPerDifficulty = {
        easy: 10,
        medium: 25,
        hard: 50,
      };

      return {
        difficulty,
        completions,
        xp: xp._sum.pointsEarned || 0,
        habitsCount: habits.filter((h) => h.difficulty === difficulty).length,
      };
    })
  );

  // Top performing habits
  const topHabits = habits
    .map((habit) => ({
      id: habit.id,
      name: habit.name,
      category: habit.category,
      difficulty: habit.difficulty,
      completions: habit.completions.length,
      streak: habit.streak,
      maxStreak: habit.maxStreak || 0,
      totalCompleted: habit.totalCompleted || 0,
    }))
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 5);

  // Completion rate
  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.totalCompleted > 0).length;
  const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  // Average streak
  const avgStreak = habits.length > 0
    ? habits.reduce((sum, h) => sum + h.streak, 0) / habits.length
    : 0;

  return {
    daily: dailyStats,
    weekly: weeklyStats,
    monthly: {
      completions: monthCompletions,
      xpEarned: monthXP._sum.pointsEarned || 0,
      startDate: monthStart.toISOString().split('T')[0],
    },
    categories: categoryStats.filter((c) => c.habits > 0),
    difficulty: difficultyStats,
    topHabits,
    stats: {
      totalHabits,
      completedHabits,
      completionRate: Math.round(completionRate),
      avgStreak: Math.round(avgStreak * 10) / 10,
      totalXpMonth: monthXP._sum.pointsEarned || 0,
    },
  };
}

// Get habit completion history for a specific habit
export async function getHabitHistory(userId: string, habitId: string, days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit || habit.userId !== userId) {
    throw new Error('Habit not found');
  }

  const completions = await prisma.habitCompletion.findMany({
    where: {
      habitId,
      completedAt: { gte: cutoffDate },
    },
    orderBy: { completedAt: 'desc' },
  });

  return {
    habit,
    completions,
    totalCompleted: completions.length,
    currentStreak: habit.streak,
    bestStreak: habit.maxStreak || 0,
  };
}

// Get daily breakdown for habits
export async function getDailyHabitBreakdown(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const completions = await prisma.habitCompletion.findMany({
    where: {
      userId,
      completedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      habit: true,
    },
    orderBy: { completedAt: 'desc' },
  });

  // Group by category
  const byCategory: { [key: string]: any[] } = {};
  completions.forEach((completion) => {
    const category = completion.habit.category || 'Other';
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(completion);
  });

  return {
    date: startOfDay.toISOString().split('T')[0],
    totalCompletions: completions.length,
    totalXp: completions.reduce((sum, c) => sum + c.pointsEarned, 0),
    byCategory,
  };
}
