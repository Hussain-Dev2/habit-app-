import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cosmeticId, type } = await req.json(); // type: 'AVATAR' | 'FRAME'

  if (!cosmeticId || !type) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { ownedCosmetics: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check ownership
    const ownsItem = user.ownedCosmetics.some(c => c.cosmeticItemId === cosmeticId);
    if (!ownsItem) {
      return NextResponse.json({ error: 'You do not own this item' }, { status: 403 });
    }

    // Update User
    if (type === 'AVATAR') {
      await prisma.user.update({
        where: { id: user.id },
        data: { selectedAvatarId: cosmeticId }
      });
    } else if (type === 'FRAME') {
      await prisma.user.update({
        where: { id: user.id },
        data: { selectedFrameId: cosmeticId }
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Equip error:', error);
    return NextResponse.json({ error: 'Failed to equip item' }, { status: 500 });
  }
}
