import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/challenges/claim
 * Claim reward for a completed challenge
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { challengeId } = await request.json();

    // Get the challenge and user's completion
    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeId },
      include: {
        completions: {
          where: { userId: user.id },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const completion = challenge.completions[0];

    if (!completion || completion.completed) {
      return NextResponse.json({ error: 'Challenge already claimed or not completed' }, { status: 400 });
    }

    // Check if challenge is actually completed
    if (completion.progress < challenge.target) {
      return NextResponse.json({ error: 'Challenge not completed yet' }, { status: 400 });
    }

    // Award points and mark as completed
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          points: { increment: challenge.reward },
          lifetimePoints: { increment: challenge.reward },
        },
      }),
      prisma.challengeCompletion.update({
        where: { id: completion.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      }),
      prisma.pointsHistory.create({
        data: {
          userId: user.id,
          amount: challenge.reward,
          source: 'daily_challenge',
          description: `Completed: ${challenge.title}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      pointsEarned: challenge.reward,
    });
  } catch (error) {
    console.error('Error claiming challenge reward:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
