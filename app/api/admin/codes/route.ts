import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import knockClient from '@/lib/knock';

// Add new codes
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { productId, codes } = await request.json();

    if (!productId || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Check for duplicate codes in the database
    const existingCodes = await prisma.redemptionCode.findMany({
      where: {
        code: { in: codes },
      },
      select: { code: true },
    });

    const existingCodeSet = new Set(existingCodes.map((c) => c.code));
    const newCodes = codes.filter((code) => !existingCodeSet.has(code));

    if (newCodes.length === 0) {
      return NextResponse.json(
        { error: 'All codes already exist in the database' },
        { status: 400 }
      );
    }

    // Add new codes
    const createdCodes = await prisma.redemptionCode.createMany({
      data: newCodes.map((code) => ({
        productId,
        code,
      })),
    });

    // Update product stock
    const availableCount = await prisma.redemptionCode.count({
      where: {
        productId,
        isUsed: false,
      },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { stock: availableCount },
    });

    // Process pending orders for this product
    await processPendingOrders(productId);

    return NextResponse.json({
      added: createdCodes.count,
      skipped: codes.length - newCodes.length,
    });
  } catch (error) {
    console.error('Add codes error:', error);
    return NextResponse.json({ error: 'Failed to add codes' }, { status: 500 });
  }
}

// Delete a code
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get('id');

    if (!codeId) {
      return NextResponse.json({ error: 'Code ID required' }, { status: 400 });
    }

    const code = await prisma.redemptionCode.findUnique({
      where: { id: codeId },
    });

    if (!code) {
      return NextResponse.json({ error: 'Code not found' }, { status: 404 });
    }

    if (code.isUsed) {
      return NextResponse.json(
        { error: 'Cannot delete used codes' },
        { status: 400 }
      );
    }

    await prisma.redemptionCode.delete({
      where: { id: codeId },
    });

    // Update product stock
    const availableCount = await prisma.redemptionCode.count({
      where: {
        productId: code.productId,
        isUsed: false,
      },
    });

    await prisma.product.update({
      where: { id: code.productId },
      data: { stock: availableCount },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete code error:', error);
    return NextResponse.json({ error: 'Failed to delete code' }, { status: 500 });
  }
}

// Helper function to deliver codes to pending orders
async function processPendingOrders(productId: string) {
  try {
    // Get pending orders for this product
    const pendingOrders = await prisma.order.findMany({
      where: {
        productId,
        status: 'pending',
      },
      include: {
        user: true,
        product: true,
      },
      orderBy: {
        createdAt: 'asc', // First come, first served
      },
    });

    for (const order of pendingOrders) {
      // Get an available code
      const availableCode = await prisma.redemptionCode.findFirst({
        where: {
          productId,
          isUsed: false,
        },
      });

      if (!availableCode) break; // No more codes available

      // Assign code to order
      await prisma.$transaction([
        // Update order with code
        prisma.order.update({
          where: { id: order.id },
          data: {
            redeemCode: availableCode.code,
            status: 'delivered',
            deliveredAt: new Date(),
          },
        }),
        // Mark code as used
        prisma.redemptionCode.update({
          where: { id: availableCode.id },
          data: {
            isUsed: true,
            orderId: order.id,
            usedAt: new Date(),
          },
        }),
        // Create notification
        prisma.notification.create({
          data: {
            userId: order.userId,
            type: 'order_delivered',
            title: '🎁 Your Order is Ready!',
            message: `Your ${order.product.title} has been delivered!\n\nYou can now view your redemption code in the Purchases page.\n\nClick "View Order" below to see your code.`,
            orderId: order.id,
          },
        }),
      ]);

      // Trigger Knock workflow
      try {
        await knockClient.workflows.trigger('f_app', {
          recipients: [order.userId],
          data: {
            type: 'order-delivered',
            product: order.product.title,
            message: `Your ${order.product.title} has been delivered!`,
            orderId: order.id,
          },
        });
      } catch (e) { console.error('Knock error:', e); }
    }
  } catch (error) {
    console.error('Process pending orders error:', error);
  }
}
