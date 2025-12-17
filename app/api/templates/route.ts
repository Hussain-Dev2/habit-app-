import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { createHabit } from '@/lib/habit-service';

export async function GET() {
  try {
    console.log('📥 GET /api/templates - Fetching templates...');
    const templates = await prisma.habitTemplate.findMany({
      where: { isActive: true },
      orderBy: [
        { featured: 'desc' },
        { usageCount: 'desc' },
        { name: 'asc' }
      ]
    });

    console.log(`✅ Found ${templates.length} templates`);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Get the template
    const template = await prisma.habitTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create habits from template
    const habits = template.habits as Array<{
      name: string;
      description: string;
      difficulty: 'easy' | 'medium' | 'hard';
      targetDays: number[];
    }>;

    const createdHabits = await Promise.all(
      habits.map(habit =>
        createHabit(user.id, {
          name: habit.name,
          description: habit.description,
          difficulty: habit.difficulty,
        })
      )
    );

    // Increment usage count
    await prisma.habitTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      habits: createdHabits,
      message: `Successfully created ${createdHabits.length} habits from ${template.name}`
    });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    );
  }
}
