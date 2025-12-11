import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';
import { calculateLevel } from '@/lib/level-system';

export const dynamic = 'force-dynamic';

const ACTIVITIES = {
  daily_bonus: { reward: 50, cooldown: 86400 },
  watch_ad: { reward: 25, cooldown: 300 },
  spin_wheel: { reward: 100, cooldown: 21600 }, // 6 hours
  complete_task: { reward: 40, cooldown: 600 },
  share_reward: { reward: 20, cooldown: 1800 },
};

// Spin wheel possible rewards with weighted probabilities
// Smaller rewards have higher chances (duplicated more in array)
const SPIN_REWARDS = [
  10, 10, 10, 10, 10,  // 25% chance (5/20)
  15, 15, 15, 15,      // 20% chance (4/20)
  20, 20, 20,          // 15% chance (3/20)
  25, 25, 25,          // 15% chance (3/20)
  30, 30,              // 10% chance (2/20)
  35, 35,              // 10% chance (2/20)
  40,                  // 5% chance (1/20)
  50                   // 5% chance (1/20)
];

function getRandomSpinReward(): number {
  return SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)];
}

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
      select: { id: true, points: true, lifetimePoints: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if activity was recently completed (cooldown check)
    const lastCompletion = await prisma.activityCompletion.findUnique({
      where: {
        userId_activityId: {
          userId: user.id,
          activityId: activityId,
        },
      },
    });

    if (lastCompletion) {
      const now = Date.now();
      const lastTime = lastCompletion.completedAt.getTime();
      const cooldownMs = activity.cooldown * 1000;
      const timeRemaining = cooldownMs - (now - lastTime);

      if (timeRemaining > 0) {
        const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
        return Response.json(
          { 
            error: `Activity on cooldown. Available in ${hoursRemaining}h`,
            cooldownRemaining: Math.floor(timeRemaining / 1000),
          },
          { status: 429 }
        );
      }
    }

    // Calculate level and apply multipliers
    const level = calculateLevel(user.lifetimePoints);
    let finalReward = activity.reward;

    // Apply level multipliers based on activity type
    if (activityId === 'daily_bonus') {
      finalReward = Math.floor(activity.reward * level.dailyBonusMultiplier);
    } else if (activityId === 'watch_ad') {
      finalReward = level.adReward;
    } else if (activityId === 'spin_wheel') {
      // Random reward for spin wheel
      const randomReward = getRandomSpinReward();
      finalReward = Math.floor(randomReward * level.clickMultiplier);
    } else {
      // For other activities, apply click multiplier as general bonus
      finalReward = Math.floor(activity.reward * level.clickMultiplier);
    }

    // Award points
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        points: user.points + finalReward,
        lifetimePoints: { increment: finalReward },
        lastActivityAt: new Date(),
      },
      select: { id: true, points: true, lifetimePoints: true },
    });

    // Update or create activity completion record
    await prisma.activityCompletion.upsert({
      where: {
        userId_activityId: {
          userId: user.id,
          activityId: activityId,
        },
      },
      update: {
        completedAt: new Date(),
        reward: finalReward,
      },
      create: {
        userId: user.id,
        activityId: activityId,
        reward: finalReward,
      },
    });

    // Record activity (non-blocking)
    prisma.pointsHistory.create({
      data: {
        userId: user.id,
        amount: finalReward,
        source: activityId,
        description: `Earned ${finalReward} points from ${activityId} (Level ${level.level} bonus)`,
      },
    }).catch(console.error);

    return Response.json({
      success: true,
      reward: finalReward,
      baseReward: activity.reward,
      levelBonus: level.level,
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
