import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ isAdmin: false }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    return Response.json({ isAdmin: user?.isAdmin || false });
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return Response.json({ isAdmin: false }, { status: 500 });
  }
}
