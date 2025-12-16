/**
 * API Route: Create a New Habit
 * POST /api/habits/create
 */

import { getServerSession } from 'next-auth';
import { createHabit } from '@/lib/habit-service';
import { authOptions } from '@/lib/auth-config';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const habit = await createHabit((session!.user as any).id, data);

    return Response.json(habit);
  } catch (error: any) {
    console.error('Error creating habit:', error);
    return Response.json(
      { error: error.message || 'Failed to create habit' },
      { status: 400 }
    );
  }
}
