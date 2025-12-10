import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * Get user's referral statistics
 * GET /api/referral/stats
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        referralCode: true,
        totalReferrals: true,
        referralEarnings: true,
        referrals: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      referralCode: user.referralCode,
      totalReferrals: user.totalReferrals,
      referralEarnings: user.referralEarnings,
      referrals: user.referrals.map(r => ({
        id: r.id,
        name: r.name || 'Anonymous',
        joinedAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
}
