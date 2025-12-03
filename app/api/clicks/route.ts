import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

const POINTS_PER_CLICK = 10;
const MILESTONE_INTERVAL = 100; // Trigger ad every 100 clicks

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        clicks: { increment: 1 },
        points: { increment: POINTS_PER_CLICK },
      },
    });

    // Check if milestone reached
    const milestoneMet = updatedUser.clicks % MILESTONE_INTERVAL === 0;

    return NextResponse.json({
      user: { id: updatedUser.id, points: updatedUser.points, clicks: updatedUser.clicks },
      milestoneMet,
      message: milestoneMet ? `🎉 Reached ${updatedUser.clicks} clicks! Ad time!` : null,
    });
  } catch (error) {
    console.error('Click error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}