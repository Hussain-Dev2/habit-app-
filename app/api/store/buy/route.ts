import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { sendPushNotificationToUser } from '@/lib/notification-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.points < product.costPoints) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Check if we have available codes for this product
    const availableCode = await prisma.redemptionCode.findFirst({
      where: {
        productId: product.id,
        isUsed: false,
      },
    });

    // Determine order status and code
    const hasCode = !!availableCode;
    const status = hasCode ? 'delivered' : 'pending';
    const redeemCode = hasCode ? availableCode.code : null;
    const deliveredAt = hasCode ? new Date() : null;

    // Create purchase and update user
    // IMPORTANT: Only decrement "points" (spendable points), NOT "lifetimePoints"
    // User level is based on lifetimePoints earned, not current points spent
    // This ensures buying rewards doesn't reduce the user's level
    const updates: any[] = [
      prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: product.costPoints } },
      }),
      prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          cost: product.costPoints,
          redeemCode,
          isRevealed: false,
          isUsed: false,
          status,
          deliveredAt,
        },
      }),
    ];

    // If code is available, mark it as used
    if (availableCode) {
      updates.push(
        prisma.redemptionCode.update({
          where: { id: availableCode.id },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        })
      );
    }

    const [updatedUser, order] = await prisma.$transaction(updates);

    // Update order with code reference
    if (availableCode) {
      await prisma.redemptionCode.update({
        where: { id: availableCode.id },
        data: { orderId: order.id },
      });
    }

    // Create appropriate notification
    if (hasCode) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'order_delivered',
          title: '🎁 Purchase Successful!',
          message: `You've purchased ${product.title}!\n\nYour code is ready. Go to Purchases to reveal it.`,
          orderId: order.id,
        },
      });

      try {
        await sendPushNotificationToUser(
          user.id,
          '🎁 Purchase Successful!',
          `You've purchased ${product.title}!\n\nYour code is ready. Go to Purchases to reveal it.`,
          '/purchases'
        );
      } catch (e) { console.error('Push notification error:', e); }

    } else {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'order_pending',
          title: '⏳ Order Pending',
          message: `Thank you for purchasing ${product.title}!\n\nYour order will be delivered in less than 2 days. You'll receive a notification when your code is ready.`,
          orderId: order.id,
        },
      });

      try {
        await sendPushNotificationToUser(
          user.id,
          '⏳ Order Pending',
          `Thank you for purchasing ${product.title}!\n\nYour order will be delivered in less than 2 days. You'll receive a notification when your code is ready.`,
          '/purchases'
        );
      } catch (e) { console.error('Push notification error:', e); }
    }

    return NextResponse.json({
      message: hasCode 
        ? `✅ Purchased: ${product.title}` 
        : `⏳ Order Placed: ${product.title} will be delivered in less than 2 days`,
      redeemCode,
      orderId: order.id,
      newPoints: updatedUser.points,
      status,
      isPending: !hasCode,
      product: {
        title: product.title,
        value: product.value,
      },
    });
  } catch (error) {
    console.error('Buy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}