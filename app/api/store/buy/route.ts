import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID required' },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock <= 0) {
      return NextResponse.json(
        { message: 'Product out of stock' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.points < product.costPoints) {
      return NextResponse.json(
        { message: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Create purchase and update user/product
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: product.costPoints } },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: 1 } },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    return NextResponse.json({
      message: `✅ Purchased: ${product.title}`,
      user: { id: updatedUser!.id, points: updatedUser!.points, clicks: updatedUser!.clicks },
    });
  } catch (error) {
    console.error('Buy error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}