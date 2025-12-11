import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        points: true, 
        clicks: true, 
        lifetimePoints: true,
        isAdmin: true,
        createdAt: true 
      },
    });

    // Auto-create user if they don't exist (OAuth users)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          image: session.user.image,
          points: 0,
          clicks: 0,
          lifetimePoints: 0,
        },
        select: { 
          id: true, 
          email: true, 
          points: true, 
          clicks: true, 
          lifetimePoints: true,
          isAdmin: true,
          createdAt: true 
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}