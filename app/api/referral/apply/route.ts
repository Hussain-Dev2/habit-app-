import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * Apply referral code for a new user
 * POST /api/referral/apply
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referralCode } = await req.json();
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, referredBy: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a referrer
    if (user.referredBy) {
      return NextResponse.json(
        { error: 'Referral code already applied', success: false },
        { status: 400 }
      );
    }

    // Check if user is new (registered within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (user.createdAt < fiveMinutesAgo) {
      return NextResponse.json(
        { error: 'Referral code can only be applied to new accounts', success: false },
        { status: 400 }
      );
    }

    // Find referrer by code
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true, email: true },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code', success: false },
        { status: 404 }
      );
    }

    // Can't refer yourself
    if (referrer.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot use your own referral code', success: false },
        { status: 400 }
      );
    }

    // Apply referral bonus
    const REFERRAL_BONUS = 100; // Points for referrer
    const WELCOME_BONUS = 250;  // Points for new user

    await prisma.$transaction([
      // Update NEW USER
      prisma.user.update({
        where: { id: user.id },
        data: {
          points: { increment: WELCOME_BONUS },
          lifetimePoints: { increment: WELCOME_BONUS },
          referredBy: referralCode,
        },
      }),
      // Update REFERRER
      prisma.user.update({
        where: { id: referrer.id },
        data: {
          points: { increment: REFERRAL_BONUS },
          lifetimePoints: { increment: REFERRAL_BONUS },
          totalReferrals: { increment: 1 },
          referralEarnings: { increment: REFERRAL_BONUS },
        },
      }),
      // Create points history for NEW USER
      prisma.pointsHistory.create({
        data: {
          userId: user.id,
          amount: WELCOME_BONUS,
          source: 'referral',
          description: `Welcome bonus for using referral code ${referralCode}`,
        },
      }),
      // Create points history for REFERRER
      prisma.pointsHistory.create({
        data: {
          userId: referrer.id,
          amount: REFERRAL_BONUS,
          source: 'referral',
          description: `Referred new user`,
        },
      }),
      // Create notification for REFERRER
      prisma.notification.create({
        data: {
          userId: referrer.id,
          type: 'system',
          title: '🎉 Referral Bonus!',
          message: `You earned ${REFERRAL_BONUS} points for referring a new user!`,
        },
      }),
      // Create notification for NEW USER
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'system',
          title: '🎁 Welcome Bonus!',
          message: `You received ${WELCOME_BONUS} points for using a referral code!`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      bonusAwarded: WELCOME_BONUS,
      referrerBonusAwarded: REFERRAL_BONUS,
    });
  } catch (error) {
    console.error('Apply referral error:', error);
    return NextResponse.json(
      { error: 'Failed to apply referral code', success: false },
      { status: 500 }
    );
  }
}
