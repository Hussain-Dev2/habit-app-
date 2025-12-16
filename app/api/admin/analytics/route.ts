import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get habit system analytics data
    const [
      totalUsers,
      totalHabits,
      totalCompletions,
      averageXpPerUser,
      totalXpDistributed,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total habits
      prisma.habit.count(),

      // Total completions
      prisma.habitCompletion.count(),

      // Average XP per user
      prisma.user.aggregate({
        _avg: { points: true },
      }),

      // Total XP distributed
      prisma.user.aggregate({
        _sum: { points: true },
      }),
    ]);

    // Calculate active users in last 24 hours by counting distinct users with completions
    const activeUsersToday = await prisma.habitCompletion.findMany({
      where: {
        completedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    // Calculate completion rate
    const totalUsersWithHabits = await prisma.user.count({
      where: {
        habits: {
          some: {},
        },
      },
    });

    const completionRate = totalHabits > 0 
      ? Math.round((totalCompletions / (totalHabits * Math.max(totalUsersWithHabits, 1))) * 100)
      : 0;

    return Response.json({
      totalUsers,
      totalHabits,
      totalCompletions,
      completionRate,
      averageXpPerUser: Math.round(averageXpPerUser._avg.points || 0),
      activeUsersToday: activeUsersToday.length,
      totalXpDistributed: totalXpDistributed._sum.points || 0,
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
