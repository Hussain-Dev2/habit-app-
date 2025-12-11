import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/challenges/update-progress
 * Update challenge progress (called from other endpoints like clicks, ad watches, etc.)
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

    const { challengeType, increment = 1 } = await request.json();

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the challenge
    const challenge = await prisma.dailyChallenge.findFirst({
      where: {
        type: challengeType,
        date: { gte: today },
      },
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

    if (completion && !completion.completed) {
      // Update existing completion
      await prisma.challengeCompletion.update({
        where: { id: completion.id },
        data: {
          progress: { increment },
        },
      });
    } else if (!completion) {
      // Create new completion
      await prisma.challengeCompletion.create({
        data: {
          userId: user.id,
          challengeId: challenge.id,
          progress: increment,
          reward: challenge.reward,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
