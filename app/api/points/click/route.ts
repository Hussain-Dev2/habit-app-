import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';
import { calculateClickReward, getDailyBonus, checkAchievements } from '@/lib/points-utils';
import { calculateLevel } from '@/lib/level-system';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Minimal user fetch - only needed fields
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        clicks: true,
        points: true,
        streakDays: true,
        lifetimePoints: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate user's level
    const level = calculateLevel(user.lifetimePoints);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get today's stats separately (minimal fields)
    let dailyStat = await prisma.dailyStats.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        clicksToday: true,
        pointsEarned: true,
      },
    });

    if (!dailyStat) {
      // Create new daily stat
      dailyStat = await prisma.dailyStats.create({
        data: {
          userId: user.id,
          date: today,
          clicksToday: 0,
          pointsEarned: 0,
          adsWatched: 0,
          tasksCompleted: 0,
          sessionTime: 0,
        },
        select: {
          id: true,
          clicksToday: true,
          pointsEarned: true,
        },
      });
    }

    // Calculate reward with level multiplier
    const baseClickReward = calculateClickReward(user.streakDays, dailyStat.clicksToday);
    const clickReward = Math.floor(baseClickReward * level.clickMultiplier);
    const dailyBonus = dailyStat.clicksToday === 99 ? Math.floor(getDailyBonus(100) * level.dailyBonusMultiplier) : 0;
    const totalReward = clickReward + dailyBonus;

    // Update user - minimal fields
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        clicks: user.clicks + 1,
        points: user.points + totalReward,
        lifetimePoints: { increment: totalReward },
        lastClick: now,
      },
      select: {
        id: true,
        points: true,
        clicks: true,
        lifetimePoints: true,
      },
    });

    // Everything after this is background (fire and forget)
    // Update daily stats
    prisma.dailyStats.update({
      where: { id: dailyStat.id },
      data: {
        clicksToday: dailyStat.clicksToday + 1,
        pointsEarned: dailyStat.pointsEarned + totalReward,
      },
    }).catch(console.error);

    // Check achievements
    const achievementIds = checkAchievements(
      updatedUser.clicks,
      user.points + totalReward,
      user.streakDays
    );

    if (achievementIds.length > 0) {
      processAchievements(user.id, achievementIds).catch(console.error);
    }

    return Response.json({
      user: {
        id: updatedUser.id,
        points: updatedUser.points,
        clicks: updatedUser.clicks,
        lifetimePoints: updatedUser.lifetimePoints,
      },
      clickReward,
      dailyBonus,
      newAchievements: [],
      streakDays: user.streakDays,
    });
  } catch (error) {
    console.error('Error recording click:', error);
    return Response.json(
      { error: 'Failed to record click' },
      { status: 500 }
    );
  }
}

// Process achievements asynchronously
async function processAchievements(userId: string, achievementIds: string[]) {
  try {
    for (const achievementId of achievementIds) {
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId,
          },
        },
      });

      if (!existing) {
        const achievement = await prisma.achievement.findUnique({
          where: { name: achievementId },
        });

        if (achievement) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: {
              points: { increment: achievement.reward },
              lifetimePoints: { increment: achievement.reward },
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing achievements:', error);
  }
}
