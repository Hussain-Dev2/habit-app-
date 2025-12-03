import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        points: true,
        clicks: true,
        dailyEarnings: true,
        lifetimePoints: true,
        pointsFromAds: true,
        pointsFromTasks: true,
        lastActivityAt: true,
        streakDays: true,
        totalSessionTime: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(user, {
      headers: {
        'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching points stats:', error);
    return Response.json(
      { error: 'Failed to fetch points stats' },
      { status: 500 }
    );
  }
}
