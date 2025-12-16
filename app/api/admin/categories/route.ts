import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';
import { HABIT_CATEGORIES, HABIT_ICONS } from '@/lib/habit-constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get counts from DB
    const categoryStats = await prisma.habit.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    // Create a map for easy lookup
    const statsMap = new Map(categoryStats.map(s => [s.category, s._count.id]));

    // Merge with predefined categories
    const formattedStats = HABIT_CATEGORIES.map(cat => {
      // Check for exact match (lowercase)
      let count = statsMap.get(cat) || 0;
      
      // Check for Capitalized match (legacy data)
      const capitalized = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (statsMap.has(capitalized)) {
        count += statsMap.get(capitalized)!;
        // Remove from map so we don't add it again later
        statsMap.delete(capitalized);
      }
      statsMap.delete(cat);

      return {
        name: capitalized,
        icon: HABIT_ICONS[cat as keyof typeof HABIT_ICONS] || '📌',
        count: count,
        key: cat
      };
    });

    // Add any remaining categories found in DB
    statsMap.forEach((count, category) => {
       formattedStats.push({
           name: category,
           icon: '📌',
           count: count,
           key: category as any
       });
    });

    return Response.json({ categories: formattedStats });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return Response.json(
      { error: 'Failed to fetch category stats' },
      { status: 500 }
    );
  }
}
