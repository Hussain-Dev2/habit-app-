import { getServerSession } from 'next-auth';
import { deleteHabit } from '@/lib/habit-service';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habitId } = await req.json();

    if (!habitId) {
      return NextResponse.json({ error: 'Habit ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await deleteHabit(user.id, habitId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
