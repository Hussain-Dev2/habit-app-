import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export async function GET(req: Request) {
  try {
    const recommendations = await prisma.recommendation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(recommendations);
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return Response.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check Admin
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, imageUrl, url, category } = body;

    const recommendation = await prisma.recommendation.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || '',
        url: url || '',
        category,
      },
    });

    return Response.json(recommendation);
  } catch (error) {
    console.error('Failed to create recommendation:', error);
    return Response.json({ error: 'Failed to create recommendation' }, { status: 500 });
  }
}
