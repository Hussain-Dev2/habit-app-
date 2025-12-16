/**
 * API Route: Use Streak Freeze
 * POST /api/habits/freeze-streak
 * 
 * Allows user to use a Streak Freeze to skip a day without losing their streak
 */

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habitId } = await req.json();

    if (!habitId) {
      return Response.json({ error: 'Habit ID required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Get habit
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: {
        id: true,
        userId: true,
        freezeCount: true,
        streak: true,
        lastCompletedAt: true,
        isCurrentlyFrozen: true,
      },
    });

    if (!habit) {
      return Response.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Check ownership
    if (habit.userId !== user.id) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check if user has freezes available
    if (habit.freezeCount <= 0) {
      return Response.json(
        { error: 'No Streak Freezes available. Buy one from the shop!' },
        { status: 400 }
      );
    }

    // Check if already frozen today
    if (habit.isCurrentlyFrozen) {
      const lastFrozen = habit.lastCompletedAt
        ? new Date(habit.lastCompletedAt).toDateString()
        : null;
      const today = new Date().toDateString();

      if (lastFrozen === today) {
        return Response.json(
          { error: 'Already used a freeze today!' },
          { status: 400 }
        );
      }
    }

    // Use the freeze
    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        freezeCount: habit.freezeCount - 1,
        lastCompletedAt: new Date(), // Update to today to prevent streak loss
        isCurrentlyFrozen: true,
      },
      select: {
        id: true,
        name: true,
        streak: true,
        freezeCount: true,
        isCurrentlyFrozen: true,
      },
    });

    return Response.json({
      success: true,
      message: `✨ Streak saved! ${habit.freezeCount - 1} freezes remaining`,
      habit: updatedHabit,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to use freeze';
    console.error('Error using streak freeze:', error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
