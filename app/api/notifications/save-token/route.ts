
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, deviceType } = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    const userId = (session.user as any).id;

    // store or update token
    await prisma.fcmToken.upsert({
      where: { token },
      update: { 
        lastUsedAt: new Date(),
        userId, // update user id if token moved (unlikely but possible)
      },
      create: {
        userId,
        token,
        deviceType: deviceType || 'web',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
  }
}
