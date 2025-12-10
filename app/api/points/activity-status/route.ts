import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

const ACTIVITIES = {
  daily_bonus: { cooldown: 86400 },
  watch_ad: { cooldown: 300 },
  spin_wheel: { cooldown: 21600 }, // 6 hours
  complete_task: { cooldown: 600 },
  share_reward: { cooldown: 1800 },
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all activity completions for this user
    const completions = await prisma.activityCompletion.findMany({
      where: { userId: user.id },
      select: {
        activityId: true,
        completedAt: true,
      },
    });

    // Calculate cooldown status for each activity
    const now = Date.now();
    const activityStatus: Record<string, { canComplete: boolean; remainingSeconds: number }> = {};

    for (const [activityId, config] of Object.entries(ACTIVITIES)) {
      const completion = completions.find(c => c.activityId === activityId);
      
      if (!completion) {
        // Never completed - available
        activityStatus[activityId] = { canComplete: true, remainingSeconds: 0 };
      } else {
        const lastTime = completion.completedAt.getTime();
        const cooldownMs = config.cooldown * 1000;
        const timeRemaining = cooldownMs - (now - lastTime);

        if (timeRemaining > 0) {
          activityStatus[activityId] = {
            canComplete: false,
            remainingSeconds: Math.ceil(timeRemaining / 1000),
          };
        } else {
          activityStatus[activityId] = { canComplete: true, remainingSeconds: 0 };
        }
      }
    }

    return Response.json({ activityStatus });
  } catch (error) {
    console.error('Error fetching activity status:', error);
    return Response.json(
      { error: 'Failed to fetch activity status' },
      { status: 500 }
    );
  }
}
