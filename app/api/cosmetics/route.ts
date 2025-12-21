import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // We can allow public access to see cosmetics, but maybe we want to know what the user owns
  // for now just return all
  try {
    const cosmetics = await prisma.cosmeticItem.findMany({
      orderBy: [
        { price: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(cosmetics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cosmetics' }, { status: 500 });
  }
}
