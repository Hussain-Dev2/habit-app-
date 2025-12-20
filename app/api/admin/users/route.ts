import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.isAdmin) {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        clicks: true,
        isAdmin: true,
        createdAt: true,
        isBanned: true,
        isChatBlocked: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
