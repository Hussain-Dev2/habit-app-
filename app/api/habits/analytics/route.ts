/**
 * API Route: Get Habit Analytics
 * GET /api/habits/analytics
 */

import { getServerSession } from 'next-auth';
import { getHabitAnalytics } from '@/lib/habit-analytics';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analytics = await getHabitAnalytics(session.user.id);

    return Response.json(analytics);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 400 }
    );
  }
}
