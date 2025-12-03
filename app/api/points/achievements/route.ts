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
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const achievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    const formattedAchievements = achievements.map((ua) => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      reward: ua.achievement.reward,
      unlockedAt: ua.unlockedAt,
    }));

    return Response.json({ achievements: formattedAchievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return Response.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
