/**
 * API Route: Admin Habit Management Data
 * GET /api/admin/habits
 * 
 * Returns most popular habits and recent completions for admin dashboard
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (implement your admin check here)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get most popular habits (by completion count)
    const mostPopularHabits = await prisma.habit.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        difficulty: true,
        streak: true,
        totalCompleted: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        totalCompleted: 'desc',
      },
      take: 10,
    });

    // Get recent completions
    const recentCompletions = await prisma.habitCompletion.findMany({
      select: {
        id: true,
        completedAt: true,
        pointsEarned: true,
        userId: true,
        habitId: true,
        habit: {
          select: {
            name: true,
            difficulty: true,
            category: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 20,
    });

    return Response.json({
      mostPopularHabits,
      recentCompletions,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch habit data';
    console.error('Error fetching admin habit data:', error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
