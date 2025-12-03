import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

const ACTIVITIES = {
  daily_bonus: { reward: 100, cooldown: 86400 },
  watch_ad: { reward: 50, cooldown: 300 },
  spin_wheel: { reward: 200, cooldown: 3600 },
  complete_task: { reward: 75, cooldown: 600 },
  share_reward: { reward: 30, cooldown: 1800 },
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { activityId } = await request.json();

    if (!activityId || !ACTIVITIES[activityId as keyof typeof ACTIVITIES]) {
      return Response.json({ error: 'Invalid activity' }, { status: 400 });
    }

    const activity = ACTIVITIES[activityId as keyof typeof ACTIVITIES];
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, points: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Award points
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        points: user.points + activity.reward,
        lifetimePoints: { increment: activity.reward },
        lastActivityAt: new Date(),
      },
      select: { id: true, points: true },
    });

    // Record activity (non-blocking)
    prisma.pointsHistory.create({
      data: {
        userId: user.id,
        amount: activity.reward,
        source: activityId,
        description: `Earned ${activity.reward} points from ${activityId}`,
      },
    }).catch(console.error);

    return Response.json({
      success: true,
      reward: activity.reward,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error processing activity:', error);
    return Response.json(
      { error: 'Failed to process activity' },
      { status: 500 }
    );
  }
}
