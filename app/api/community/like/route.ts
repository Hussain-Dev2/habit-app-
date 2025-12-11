import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/community/like
 * Like a community post
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

    const { postId } = await request.json();

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already liked this post
    const existingLike = await prisma.communityPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike: Remove the like
      await prisma.$transaction([
        prisma.communityPostLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { likes: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ success: true, action: 'unliked' });
    } else {
      // Like: Add the like
      await prisma.$transaction([
        prisma.communityPostLike.create({
          data: {
            postId,
            userId: user.id,
          },
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { likes: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ success: true, action: 'liked' });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
