import { getServerSession } from 'next-auth';
import { updateHabit } from '@/lib/habit-service';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habitId, data } = await req.json();

    if (!habitId || !data) {
      return NextResponse.json({ error: 'Habit ID and data required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedHabit = await updateHabit(user.id, habitId, data);

    return NextResponse.json(updatedHabit);
  } catch (error: any) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update habit' },
      { status: 500 }
    );
  }
}
