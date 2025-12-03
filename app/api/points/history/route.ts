import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const history = await prisma.pointsHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const formattedHistory = history.map((entry) => ({
      id: entry.id,
      amount: entry.amount,
      source: entry.source,
      description: entry.description,
      createdAt: entry.createdAt,
    }));

    return Response.json({ history: formattedHistory });
  } catch (error) {
    console.error('Error fetching points history:', error);
    return Response.json(
      { error: 'Failed to fetch points history' },
      { status: 500 }
    );
  }
}
