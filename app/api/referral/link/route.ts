import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * Generate or get user's referral link
 * GET /api/referral/link
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
        id: true,
        referralCode: true,
        totalReferrals: true,
        referralEarnings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate referral code if user doesn't have one
    let referralCode = user.referralCode;
    if (!referralCode) {
      // Generate unique 8-character code
      referralCode = generateReferralCode();
      
      // Check if code already exists and regenerate if needed
      let attempts = 0;
      while (attempts < 10) {
        const existing = await prisma.user.findUnique({
          where: { referralCode },
        });
        if (!existing) break;
        referralCode = generateReferralCode();
        attempts++;
      }

      // Update user with new referral code
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode },
      });
    }

    // Generate full referral link
    const baseUrl = req.nextUrl.origin;
    const referralLink = `${baseUrl}/register?ref=${referralCode}`;

    return NextResponse.json({
      referralCode,
      referralLink,
      totalReferrals: user.totalReferrals,
      referralEarnings: user.referralEarnings,
    });
  } catch (error) {
    console.error('Referral link error:', error);
    return NextResponse.json(
      { error: 'Failed to generate referral link' },
      { status: 500 }
    );
  }
}

/**
 * Generate a random 8-character referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
