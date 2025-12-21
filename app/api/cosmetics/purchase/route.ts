import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cosmeticId } = await req.json();

  if (!cosmeticId) {
    return NextResponse.json({ error: 'Missing cosmeticId' }, { status: 400 });
  }

  try {
    // 1. Get User and Cosmetic
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { ownedCosmetics: true }
    });

    const cosmetic = await prisma.cosmeticItem.findUnique({
      where: { id: cosmeticId }
    });

    if (!user || !cosmetic) {
      return NextResponse.json({ error: 'User or Item not found' }, { status: 404 });
    }

    // 2. Check if already owned
    const alreadyOwned = user.ownedCosmetics.some(c => c.cosmeticItemId === cosmeticId);
    if (alreadyOwned) {
      return NextResponse.json({ error: 'Item already owned' }, { status: 400 });
    }

    // 3. Check Balance
    if (user.points < cosmetic.price) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // 4. Transaction: Deduct points, Add item
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: cosmetic.price } }
      }),
      prisma.userCosmetic.create({
        data: {
          userId: user.id,
          cosmeticItemId: cosmetic.id
        }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Purchase successful' });

  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
