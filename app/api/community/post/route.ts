import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/community/post
 * Create a new community post
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

    const { content, type, metadata } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Content too long (max 280 characters)' }, { status: 400 });
    }

    // Create post
    const post = await prisma.communityPost.create({
      data: {
        userId: user.id,
        content: content.trim(),
        type: type || 'text',
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Update daily challenge progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const socialChallenge = await prisma.dailyChallenge.findFirst({
      where: {
        type: 'social_post',
        date: { gte: today },
      },
      include: {
        completions: {
          where: { userId: user.id },
        },
      },
    });

    if (socialChallenge) {
      const completion = socialChallenge.completions[0];
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
            challengeId: socialChallenge.id,
            progress: 1,
            reward: socialChallenge.reward,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        content: post.content,
      },
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
