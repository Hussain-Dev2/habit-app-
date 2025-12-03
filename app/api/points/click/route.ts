import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';
import { calculateClickReward, getDailyBonus, checkAchievements } from '@/lib/points-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { dailyStats: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get or create today's stats
    let dailyStat = user.dailyStats.find(
      (stat) =>
        new Date(stat.date).toDateString() === today.toDateString()
    );

    if (!dailyStat) {
      // Check if previous day exists to maintain streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdaysStat = user.dailyStats.find(
        (stat) =>
          new Date(stat.date).toDateString() === yesterday.toDateString()
      );

      const newStreakDays = yesterdaysStat ? user.streakDays + 1 : 1;

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
      });

      // Update user streak
      await prisma.user.update({
        where: { id: user.id },
        data: { streakDays: newStreakDays },
      });
    }

    // Calculate reward with bonuses
    const clickReward = calculateClickReward(user.streakDays, dailyStat.clicksToday);
    const dailyBonus = dailyStat.clicksToday === 99 ? getDailyBonus(100) : 0;
    const totalReward = clickReward + dailyBonus;

    // Update user and daily stats
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        clicks: user.clicks + 1,
        points: user.points + totalReward,
        dailyEarnings: dailyStat.pointsEarned + totalReward,
        lifetimePoints: user.lifetimePoints + totalReward,
        lastClick: now,
        lastActivityAt: now,
      },
    });

    await prisma.dailyStats.update({
      where: { id: dailyStat.id },
      data: {
        clicksToday: dailyStat.clicksToday + 1,
        pointsEarned: dailyStat.pointsEarned + totalReward,
      },
    });

    // Record in points history
    await prisma.pointsHistory.create({
      data: {
        userId: user.id,
        amount: totalReward,
        source: 'click',
        description: `Earned ${clickReward} points from click${dailyBonus > 0 ? ` + ${dailyBonus} daily bonus` : ''}`,
      },
    });

    // Check for achievement unlocks
    const achievementIds = checkAchievements(
      updatedUser.clicks,
      updatedUser.lifetimePoints,
      updatedUser.streakDays
    );

    const newAchievements = [];
    for (const achievementId of achievementIds) {
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId: user.id,
            achievementId,
          },
        },
      });

      if (!existing) {
        // Get achievement for reward
        const achievement = await prisma.achievement.findUnique({
          where: { name: achievementId },
        });

        if (achievement) {
          await prisma.userAchievement.create({
            data: {
              userId: user.id,
              achievementId: achievement.id,
            },
          });

          // Award points for achievement
          await prisma.user.update({
            where: { id: user.id },
            data: {
              points: { increment: achievement.reward },
              lifetimePoints: { increment: achievement.reward },
            },
          });

          newAchievements.push({
            id: achievement.id,
            name: achievement.name,
            reward: achievement.reward,
          });
        }
      }
    }

    return Response.json({
      message: 'Click recorded successfully',
      user: {
        id: updatedUser.id,
        points: updatedUser.points,
        clicks: updatedUser.clicks,
        dailyEarnings: updatedUser.dailyEarnings,
        lifetimePoints: updatedUser.lifetimePoints,
      },
      clickReward,
      dailyBonus,
      newAchievements,
      streakDays: updatedUser.streakDays,
    });
  } catch (error) {
    console.error('Error recording click:', error);
    return Response.json(
      { error: 'Failed to record click' },
      { status: 500 }
    );
  }
}
