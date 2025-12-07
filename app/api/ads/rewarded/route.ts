import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

const REWARD_POINTS = 150;
const COOLDOWN_SECONDS = 180; // 3 minutes between rewarded ads

function startOfUTCDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        points: true,
        lifetimePoints: true,
        clicks: true,
        lastAdWatch: true,
        adWatchCount: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const lastWatch = user.lastAdWatch ? new Date(user.lastAdWatch) : null;

    if (lastWatch) {
      const elapsedSeconds = (now.getTime() - lastWatch.getTime()) / 1000;
      const remaining = Math.ceil(COOLDOWN_SECONDS - elapsedSeconds);
      if (elapsedSeconds < COOLDOWN_SECONDS) {
        return Response.json(
          { error: 'Rewarded ad cooldown active', remainingSeconds: Math.max(remaining, 0) },
          { status: 429 }
        );
      }
    }

    const today = startOfUTCDate(now);

    const updatedUserPromise = prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: REWARD_POINTS },
        lifetimePoints: { increment: REWARD_POINTS },
        pointsFromAds: { increment: REWARD_POINTS },
        lastAdWatch: now,
        adWatchCount: { increment: 1 },
      },
      select: {
        id: true,
        points: true,
        clicks: true,
        lifetimePoints: true,
        adWatchCount: true,
      },
    });

    const dailyStatsPromise = prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        pointsEarned: { increment: REWARD_POINTS },
        adsWatched: { increment: 1 },
      },
      create: {
        userId: user.id,
        date: today,
        pointsEarned: REWARD_POINTS,
        adsWatched: 1,
      },
    });

    const historyPromise = prisma.pointsHistory.create({
      data: {
        userId: user.id,
        amount: REWARD_POINTS,
        source: 'ad_watch_adsterra',
        description: 'Adsterra rewarded ad completed',
      },
    });

    const [updatedUser] = await prisma.$transaction([
      updatedUserPromise,
      dailyStatsPromise,
      historyPromise,
    ]);

    return Response.json({
      success: true,
      reward: REWARD_POINTS,
      cooldownSeconds: COOLDOWN_SECONDS,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error processing rewarded ad:', error);
    return Response.json({ error: 'Failed to record rewarded ad' }, { status: 500 });
  }
}
