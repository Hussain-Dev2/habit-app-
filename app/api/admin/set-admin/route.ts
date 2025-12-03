import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the secret key from request body
    const { secretKey } = await request.json();

    // Check if the secret key is correct (you should set this in your .env)
    const adminSecret = process.env.ADMIN_SECRET_KEY;
    
    if (!adminSecret || secretKey !== adminSecret) {
      return Response.json({ error: 'Invalid secret key' }, { status: 403 });
    }

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { isAdmin: true },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    return Response.json({
      message: 'You are now an admin!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Failed to set admin:', error);
    return Response.json({ error: 'Failed to set admin status' }, { status: 500 });
  }
}
