/**
 * API Route: Complete a Habit
 * POST /api/habits/complete
 * 
 * Marks a habit as completed for today, awards XP, and checks for level up
 */

import { getServerSession } from 'next-auth';
import { completeHabit } from '@/lib/habit-service';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await completeHabit(user.id, habitId);

    return Response.json(result);
  } catch (error: any) {
    console.error('Error completing habit:', error);
    return Response.json(
      { error: error.message || 'Failed to complete habit' },
      { status: 400 }
    );
  }
}
