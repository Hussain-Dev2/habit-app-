import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!admin?.isAdmin) {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { isAdmin } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { isAdmin },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
