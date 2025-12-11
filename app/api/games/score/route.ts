import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/games/score
 * Submit a game score and earn points based on performance
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

    const { gameType, score } = await request.json();

    // Calculate points based on score
    let pointsEarned = 0;
    
    switch (gameType) {
      case 'memory':
        // Higher score is better (based on fewer moves)
        pointsEarned = Math.min(Math.floor(score / 10), 100);
        break;
      case 'reaction':
        // Higher score is better
        pointsEarned = Math.min(Math.floor(score / 10), 100);
        break;
      case 'number-guess':
        // Higher score is better (based on fewer attempts)
        pointsEarned = Math.min(Math.floor(score / 5), 100);
        break;
      case 'pattern':
        // Round number is the score
        pointsEarned = score * 20; // 20 points per round survived
        break;
      default:
        pointsEarned = 50; // Base points
    }

    // Ensure minimum points
    pointsEarned = Math.max(pointsEarned, 10);

    // Save game score and award points
    await prisma.$transaction([
      prisma.gameScore.create({
        data: {
          userId: user.id,
          gameType,
          score,
          pointsEarned,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          points: { increment: pointsEarned },
          lifetimePoints: { increment: pointsEarned },
        },
      }),
      prisma.pointsHistory.create({
        data: {
          userId: user.id,
          amount: pointsEarned,
          source: 'mini_game',
          description: `Played ${gameType} game - Score: ${score}`,
        },
      }),
    ]);

    // Update daily challenge progress if applicable
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const gameChallenge = await prisma.dailyChallenge.findFirst({
      where: {
        type: 'play_games',
        date: { gte: today },
      },
      include: {
        completions: {
          where: { userId: user.id },
        },
      },
    });

    if (gameChallenge) {
      const completion = gameChallenge.completions[0];
      if (completion && !completion.completed) {
        await prisma.challengeCompletion.update({
          where: { id: completion.id },
          data: {
            progress: { increment: 1 },
          },
        });
      } else if (!completion) {
        await prisma.challengeCompletion.create({
          data: {
            userId: user.id,
            challengeId: gameChallenge.id,
            progress: 1,
            reward: gameChallenge.reward,
          },
        });
      }
    }

    return NextResponse.json({
      score,
      pointsEarned,
    });
  } catch (error) {
    console.error('Error saving game score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
