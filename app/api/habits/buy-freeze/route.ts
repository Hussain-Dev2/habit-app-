/**
 * API Route: Buy Streak Freeze
 * POST /api/habits/buy-freeze
 * 
 * Purchase a Streak Freeze using spendable points.
 * Freezes can be accumulated and used to preserve a streak by skipping one day.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

const STREAK_FREEZE_COST = 50; // Points required to purchase

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

    // Get the habit
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { user: true },
    });

    if (!habit) {
      return Response.json({ error: 'Habit not found' }, { status: 404 });
    }

    if (habit.userId !== habit.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Limit: User can only hold 1 freeze at a time
    if (habit.freezeCount >= 1) {
      return Response.json(
        { error: 'You already have a Streak Freeze! Use it before buying another.' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has enough points
    if (user.points < STREAK_FREEZE_COST) {
      return Response.json(
        {
          error: `Insufficient points. Need ${STREAK_FREEZE_COST} points, you have ${user.points}`,
        },
        { status: 400 }
      );
    }

    // Deduct points and add freeze count
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        points: { decrement: STREAK_FREEZE_COST },
      },
    });

    // Update habit with freeze (use raw SQL for Prisma client limitation)
    await prisma.$executeRaw`
      UPDATE "Habit" 
      SET "freezeCount" = "freezeCount" + 1 
      WHERE "id" = ${habitId}
    `;

    // Fetch updated habit
    const finalHabit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    // Log the purchase
    await prisma.pointsHistory.create({
      data: {
        userId: user.id,
        amount: -STREAK_FREEZE_COST,
        source: 'streak_freeze_purchase',
        description: `Purchased Streak Freeze for "${habit.name}"`,
      },
    });

    return Response.json({
      success: true,
      message: `✨ Purchased Streak Freeze for "${habit.name}"!`,
      habit: finalHabit,
      user: {
        points: updatedUser.points,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to buy freeze';
    console.error('Error buying freeze:', error);
    return Response.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
