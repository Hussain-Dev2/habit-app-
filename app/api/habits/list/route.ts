/**
 * API Route: Get User's Habits
 * GET /api/habits/list
 */

import { getServerSession } from 'next-auth';
import { getUserHabits } from '@/lib/habit-service';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const habits = await getUserHabits(user.id);

    // Add isCompleted flag for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habitsWithStatus = await Promise.all(
      habits.map(async (habit: any) => {
        const completedToday = await prisma.habitCompletion.findFirst({
          where: {
            habitId: habit.id,
            userId: user.id,
            completedAt: {
              gte: today,
            },
          },
        });

        return {
          ...habit,
          isCompleted: !!completedToday,
        };
      })
    );

    return Response.json({ habits: habitsWithStatus });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch habits';
    console.error('Error fetching habits:', error);
    return Response.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
