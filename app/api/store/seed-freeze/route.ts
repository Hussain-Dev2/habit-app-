/**
 * API Route: Seed Streak Freeze Product
 * POST /api/store/seed-freeze
 * 
 * Creates the Streak Freeze product in the shop if it doesn't exist
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Check if Streak Freeze product already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        title: {
          contains: 'Streak Freeze',
          mode: 'insensitive',
        },
      },
    });

    if (existingProduct) {
      return NextResponse.json({
        message: 'Streak Freeze product already exists',
        product: existingProduct,
      });
    }

    // Create the Streak Freeze product
    const product = await prisma.product.create({
      data: {
        title: '🧊 Streak Freeze',
        description: 'Preserve your streak! Skip one day without losing your progress. Use when you miss a day to keep your habit streak alive.',
        costPoints: 50,
        stock: null, // Unlimited stock
        imageUrl: '🧊',
        category: 'Power-ups',
        value: 'Infinity',
        region: 'Global',
        isDigital: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Streak Freeze product created',
      product,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
    console.error('Error seeding freeze product:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if product exists
 */
export async function GET() {
  try {
    const product = await prisma.product.findFirst({
      where: {
        title: {
          contains: 'Streak Freeze',
          mode: 'insensitive',
        },
      },
    });

    if (!product) {
      // Auto-create if doesn't exist
      const newProduct = await prisma.product.create({
        data: {
          title: '🧊 Streak Freeze',
          description: 'Preserve your streak! Skip one day without losing your progress. Use when you miss a day to keep your habit streak alive.',
          costPoints: 50,
          stock: null,
          imageUrl: '🧊',
          category: 'Power-ups',
          value: 'Infinity',
          region: 'Global',
          isDigital: true,
        },
      });

      return NextResponse.json({
        exists: true,
        product: newProduct,
        message: 'Product created automatically',
      });
    }

    return NextResponse.json({
      exists: true,
      product,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check product';
    console.error('Error checking freeze product:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
