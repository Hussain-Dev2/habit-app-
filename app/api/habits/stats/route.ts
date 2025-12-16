/**
 * API Route: Get Habit Statistics
 * GET /api/habits/stats
 */

import { getServerSession } from 'next-auth';
import { getHabitStats } from '@/lib/habit-service';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getHabitStats(session.user.id);

    return Response.json(stats);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 400 }
    );
  }
}
