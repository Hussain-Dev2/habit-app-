import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            points: true,
            isAdmin: true,
            selectedAvatar: { select: { imageUrl: true } },
            selectedFrame: { select: { imageUrl: true } },
          } as any,
        },
      },
    });

    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check Chat Block
    if (user.isChatBlocked) {
        if (!user.chatBlockExpiresAt || new Date(user.chatBlockExpiresAt) > new Date()) {
            return NextResponse.json({ 
                error: 'blocked',
                expiresAt: user.chatBlockExpiresAt
            }, { status: 403 });
        } else {
            // Ban expired, auto-unban (optional but good practice to clean up eventually)
            await prisma.user.update({
                where: { id: user.id },
                data: { isChatBlocked: false, chatBlockExpiresAt: null }
            });
        }
    }

    const message = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            points: true,
            isAdmin: true,
            selectedAvatar: { select: { imageUrl: true } },
            selectedFrame: { select: { imageUrl: true } },
          } as any,
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
