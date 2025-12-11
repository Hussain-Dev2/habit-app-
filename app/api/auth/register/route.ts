import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, referralCode } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Validate referral code if provided
    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash,
        username: email.split('@')[0],
        referredBy: referrer ? referralCode : null,
      },
    });

    // Award referral bonus to BOTH referrer and new user
    if (referrer) {
      const REFERRAL_BONUS = 100; // Points for referrer
      const WELCOME_BONUS = 250;  // Points for new user
      
      await prisma.$transaction([
        // Update NEW USER's points (welcome bonus)
        prisma.user.update({
          where: { id: user.id },
          data: {
            points: { increment: WELCOME_BONUS },
            lifetimePoints: { increment: WELCOME_BONUS },
          },
        }),
        // Update REFERRER's points and stats
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
            description: `Referred ${user.email}`,
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
    }

    const token = generateToken(user.id);

    return NextResponse.json(
      {
        message: 'User created successfully',
        token,
        user: { id: user.id, email: user.email, points: user.points },
        referralApplied: !!referrer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}