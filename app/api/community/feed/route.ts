import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/community/feed
 * Get community posts from all users
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      currentUserId = user?.id || null;
    }

    // Get recent posts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await prisma.communityPost.findMany({
      where: {
        isVisible: true,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      include: {
        userLikes: currentUserId ? {
          where: { userId: currentUserId },
        } : false,
      },
    });

    // Get usernames for posts
    const userIds = [...new Set(posts.map(p => p.userId))];
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        username: true,
        name: true,
        isAdmin: true,
      },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    // Format posts with user info
    const formattedPosts = posts.map(post => ({
      id: post.id,
      userId: post.userId,
      username: userMap.get(post.userId)?.username || userMap.get(post.userId)?.name || 'Anonymous',
      isAdmin: userMap.get(post.userId)?.isAdmin || false,
      content: post.content,
      likes: post.likes,
      type: post.type,
      metadata: post.metadata,
      createdAt: post.createdAt.toISOString(),
      isLiked: currentUserId ? post.userLikes.length > 0 : false,
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching community feed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
