import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/challenges/daily
 * Get today's daily challenges for the authenticated user
 */
export async function GET() {
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

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create today's challenges
    let challenges = await prisma.dailyChallenge.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      include: {
        completions: {
          where: { userId: user.id },
        },
      },
    });

    // If no challenges exist for today, create them
    if (challenges.length === 0) {
      // All possible challenge templates
      const allChallengeTemplates = [
        {
          title: 'Click Master',
          description: 'Make 100 clicks today',
          type: 'click_count',
          target: 100,
          icon: '👆',
          difficulty: 'easy',
        },
        {
          title: 'Click Champion',
          description: 'Make 50 clicks today',
          type: 'click_count',
          target: 50,
          icon: '🖱️',
          difficulty: 'easy',
        },
        {
          title: 'Point Collector',
          description: 'Earn 1000 points today',
          type: 'earn_points',
          target: 1000,
          icon: '💰',
          difficulty: 'medium',
        },
        {
          title: 'Point Hunter',
          description: 'Earn 400 points today',
          type: 'earn_points',
          target: 400,
          icon: '💵',
          difficulty: 'easy',
        },
        {
          title: 'Ad Enthusiast',
          description: 'Watch 3 ads',
          type: 'watch_ads',
          target: 3,
          icon: '📺',
          difficulty: 'easy',
        },
        {
          title: 'Ad Watcher',
          description: 'Watch 5 ads',
          type: 'watch_ads',
          target: 5,
          icon: '📱',
          difficulty: 'medium',
        },
        {
          title: 'Game Champion',
          description: 'Play 2 mini-games',
          type: 'play_games',
          target: 2,
          icon: '🎮',
          difficulty: 'medium',
        },
        {
          title: 'Game Master',
          description: 'Play 3 mini-games',
          type: 'play_games',
          target: 3,
          icon: '🕹️',
          difficulty: 'hard',
        },
        {
          title: 'Social Butterfly',
          description: 'Make a community post',
          type: 'social_post',
          target: 1,
          icon: '🌍',
          difficulty: 'easy',
        },
        {
          title: 'Community Star',
          description: 'Make 3 community posts',
          type: 'social_post',
          target: 3,
          icon: '⭐',
          difficulty: 'medium',
        },
      ];

      // Randomly select 3 challenges for today (reduced from 5)
      const shuffled = allChallengeTemplates.sort(() => Math.random() - 0.5);
      const selectedChallenges = shuffled.slice(0, 3);

      // Random reward function (5-80 points based on difficulty) - reduced rewards
      const getRandomReward = (difficulty: string) => {
        if (difficulty === 'easy') {
          return Math.floor(Math.random() * 21) + 5; // 5-25
        } else if (difficulty === 'medium') {
          return Math.floor(Math.random() * 26) + 25; // 25-50
        } else {
          return Math.floor(Math.random() * 31) + 50; // 50-80
        }
      };

      // Create challenges for today with random rewards
      for (const template of selectedChallenges) {
        await prisma.dailyChallenge.create({
          data: {
            ...template,
            reward: getRandomReward(template.difficulty),
            date: today,
          },
        });
      }

      // Fetch the newly created challenges
      challenges = await prisma.dailyChallenge.findMany({
        where: {
          date: {
            gte: today,
          },
        },
        include: {
          completions: {
            where: { userId: user.id },
          },
        },
      });
    }

    // Format challenges with user progress
    const formattedChallenges = challenges.map((challenge) => {
      const completion = challenge.completions[0];
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        target: challenge.target,
        reward: challenge.reward,
        icon: challenge.icon,
        difficulty: challenge.difficulty,
        progress: completion?.progress || 0,
        completed: completion?.completed || false,
      };
    });

    return NextResponse.json({ challenges: formattedChallenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
