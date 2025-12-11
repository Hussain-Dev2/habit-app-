import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';
import { calculateClickReward, getDailyBonus, checkAchievements } from '@/lib/points-utils';
import { calculateLevel } from '@/lib/level-system';
import { detectVPN, getRiskLevel } from '@/lib/vpn-detection';

export const dynamic = 'force-dynamic';

/**
 * Combo and Lucky Click tracking (in-memory)
 * In production, use Redis
 */
const comboTracking = new Map<string, { lastClick: number; comboCount: number }>();

/**
 * Lucky Click Constants
 */
const LUCKY_CLICK_CHANCE = 0.01; // 1% chance
const LUCKY_CLICK_MULTIPLIER = 10; // 10x points

/**
 * VPN Settings
 */
const BLOCK_VPN = false; // Set to true to block VPN users
const REDUCE_VPN_REWARDS = true; // Reduce rewards by 50% for VPN users

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // VPN Detection
    const vpnResult = await detectVPN(request as any);
    let vpnPenalty = 1; // Default no penalty
    
    if (vpnResult.riskScore >= 50) {
      console.warn(`🚨 VPN/Proxy detected:`, {
        email: session.user.email,
        ip: vpnResult.ipAddress,
        riskScore: vpnResult.riskScore,
        riskLevel: getRiskLevel(vpnResult.riskScore),
        provider: vpnResult.provider
      });
      
      if (BLOCK_VPN) {
        return Response.json(
          { error: '🚫 VPN/Proxy detected. Please disable to continue.' },
          { status: 403 }
        );
      }
      
      if (REDUCE_VPN_REWARDS) {
        vpnPenalty = 0.5; // 50% reduction
      }
    }

    // Minimal user fetch - only needed fields
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        clicks: true,
        points: true,
        streakDays: true,
        lifetimePoints: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate user's level
    const level = calculateLevel(user.lifetimePoints);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // === COMBO SYSTEM ===
    const userId = user.id;
    const nowMs = Date.now();
    const combo = comboTracking.get(userId) || { lastClick: 0, comboCount: 0 };
    
    // Check if combo is still active (clicks within 3 seconds)
    const timeSinceLastClick = nowMs - combo.lastClick;
    let comboCount = 0;
    let comboBonus = 0;
    
    if (timeSinceLastClick < 3000 && timeSinceLastClick > 50) { // Between 50ms and 3s
      combo.comboCount++;
      comboCount = combo.comboCount;
      
      // Apply combo bonus (level.comboBonus is % bonus per combo)
      if (comboCount >= 5) {
        comboBonus = level.comboBonus || 0; // e.g., 5% bonus
      }
    } else {
      combo.comboCount = 0;
      comboCount = 0;
    }
    
    combo.lastClick = nowMs;
    comboTracking.set(userId, combo);
    
    // === LUCKY CLICK ===
    const isLuckyClick = Math.random() < LUCKY_CLICK_CHANCE;
    const luckyMultiplier = isLuckyClick ? LUCKY_CLICK_MULTIPLIER : 1;

    // Get today's stats separately (minimal fields)
    let dailyStat = await prisma.dailyStats.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        clicksToday: true,
        pointsEarned: true,
      },
    });

    if (!dailyStat) {
      // Create new daily stat
      dailyStat = await prisma.dailyStats.create({
        data: {
          userId: user.id,
          date: today,
          clicksToday: 0,
          pointsEarned: 0,
          adsWatched: 0,
          tasksCompleted: 0,
          sessionTime: 0,
        },
        select: {
          id: true,
          clicksToday: true,
          pointsEarned: true,
        },
      });
    }

    // Calculate reward with level multiplier + combo bonus + lucky click + VPN penalty
    const baseClickReward = calculateClickReward(user.streakDays, dailyStat.clicksToday);
    let clickReward = Math.floor(baseClickReward * level.clickMultiplier);
    
    // Apply combo bonus
    if (comboBonus > 0) {
      clickReward = Math.floor(clickReward * (1 + comboBonus / 100));
    }
    
    // Apply lucky click multiplier
    clickReward = Math.floor(clickReward * luckyMultiplier);
    
    // Apply VPN penalty if detected
    clickReward = Math.floor(clickReward * vpnPenalty);
    
    const dailyBonus = dailyStat.clicksToday === 99 ? Math.floor(getDailyBonus(100) * level.dailyBonusMultiplier * vpnPenalty) : 0;
    const totalReward = clickReward + dailyBonus;

    // Update user - minimal fields
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        clicks: user.clicks + 1,
        points: user.points + totalReward,
        lifetimePoints: { increment: totalReward },
        lastClick: now,
      },
      select: {
        id: true,
        points: true,
        clicks: true,
        lifetimePoints: true,
      },
    });

    // Everything after this is background (fire and forget)
    // Update daily stats
    prisma.dailyStats.update({
      where: { id: dailyStat.id },
      data: {
        clicksToday: dailyStat.clicksToday + 1,
        pointsEarned: dailyStat.pointsEarned + totalReward,
      },
    }).catch(console.error);

    // Update daily challenges progress
    updateChallengeProgress(user.id, 'click_count', 1).catch(console.error);
    updateChallengeProgress(user.id, 'earn_points', totalReward).catch(console.error);

    // Check achievements
    const achievementIds = checkAchievements(
      updatedUser.clicks,
      user.points + totalReward,
      user.streakDays
    );

    if (achievementIds.length > 0) {
      processAchievements(user.id, achievementIds).catch(console.error);
    }

    return Response.json({
      user: {
        id: updatedUser.id,
        points: updatedUser.points,
        clicks: updatedUser.clicks,
        lifetimePoints: updatedUser.lifetimePoints,
      },
      clickReward,
      dailyBonus,
      newAchievements: [],
      streakDays: user.streakDays,
      comboCount, // Send combo count to client
      comboBonus, // Send combo bonus % to client
      isLuckyClick, // Send lucky click status
      luckyMultiplier, // Send lucky multiplier
    });
  } catch (error) {
    console.error('Error recording click:', error);
    return Response.json(
      { error: 'Failed to record click' },
      { status: 500 }
    );
  }
}

// Process achievements asynchronously
async function processAchievements(userId: string, achievementIds: string[]) {
  try {
    for (const achievementId of achievementIds) {
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId,
          },
        },
      });

      if (!existing) {
        const achievement = await prisma.achievement.findUnique({
          where: { name: achievementId },
        });

        if (achievement) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: {
              points: { increment: achievement.reward },
              lifetimePoints: { increment: achievement.reward },
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing achievements:', error);
  }
}

// Update daily challenge progress
async function updateChallengeProgress(userId: string, challengeType: string, increment: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await prisma.dailyChallenge.findFirst({
      where: {
        type: challengeType,
        date: { gte: today },
      },
      include: {
        completions: {
          where: { userId },
        },
      },
    });

    if (!challenge) return;

    const completion = challenge.completions[0];

    if (completion && !completion.completed) {
      await prisma.challengeCompletion.update({
        where: { id: completion.id },
        data: {
          progress: { increment },
        },
      });
    } else if (!completion) {
      await prisma.challengeCompletion.create({
        data: {
          userId,
          challengeId: challenge.id,
          progress: increment,
          reward: challenge.reward,
        },
      });
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
  }
}

