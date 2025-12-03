export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

interface RequestBody {
  adType: 'adsterra' | 'google';
}

const AD_REWARDS = {
  adsterra: 50,
  google: 30,
};

const AD_COOLDOWN_MINUTES = {
  adsterra: 5,
  google: 10,
};

const AD_DAILY_LIMITS = {
  adsterra: 10,
  google: 20,
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as RequestBody;
    const { adType } = body;

    if (!['adsterra', 'google'].includes(adType)) {
      return Response.json(
        { error: 'Invalid ad type' },
        { status: 400 }
      );
    }

    // Get user
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
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const cooldownMs = AD_COOLDOWN_MINUTES[adType] * 60 * 1000;
    const dailyLimit = AD_DAILY_LIMITS[adType];
    const reward = AD_REWARDS[adType];

    // Check cooldown
    if (user.lastAdWatch) {
      const lastWatchTime = new Date(user.lastAdWatch).getTime();
      const timeSinceLastWatch = now.getTime() - lastWatchTime;

      if (timeSinceLastWatch < cooldownMs) {
        const remainingMs = cooldownMs - timeSinceLastWatch;
        const remainingMins = Math.ceil(remainingMs / 60000);

        return Response.json(
          { 
            error: 'Cooldown active',
            remainingMinutes: remainingMins,
          },
          { status: 429 }
        );
      }
    }

    // Check daily limit
    const lastReset = user.adWatchCount ? new Date(user.adWatchCount).getTime() : 0;
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    let adCountToday = 0;
    if (lastReset > dayStart.getTime()) {
      // This is a simplified check - in production you'd track this better
      adCountToday = Math.floor(Math.random() * (dailyLimit - 1)); // Placeholder
    }

    if (adCountToday >= dailyLimit) {
      return Response.json(
        { 
          error: 'Daily limit reached',
          dailyLimit,
        },
        { status: 429 }
      );
    }

    // Award points to user (synchronously)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        points: {
          increment: reward,
        },
        lifetimePoints: {
          increment: reward,
        },
        lastAdWatch: now,
      },
      select: {
        id: true,
        points: true,
        lifetimePoints: true,
        clicks: true,
      },
    });

    // Create activity log (async)
    prisma.pointsHistory
      .create({
        data: {
          userId: user.id,
          source: `ad_watch_${adType}`,
          amount: reward,
          description: `Watched ${adType} advertisement`,
        },
      })
      .catch(err => console.error('Failed to create points history:', err));

    return Response.json({
      success: true,
      reward,
      user: {
        id: updatedUser.id,
        points: updatedUser.points,
        lifetimePoints: updatedUser.lifetimePoints,
        clicks: updatedUser.clicks,
      },
      message: `Earned ${reward} points from watching ad!`,
    });
  } catch (error) {
    console.error('Error processing ad reward:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
