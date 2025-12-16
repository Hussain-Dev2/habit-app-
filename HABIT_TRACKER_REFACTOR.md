# Gamified Habit Tracker SaaS - Complete Refactoring Guide

## Overview
Transform your Clicker Game into a **Gamified Habit Tracker SaaS** where users:
- Create and track daily habits
- Earn points by completing habits (difficulty-based rewards)
- Level up based on accumulated points
- Redeem points for real rewards in the Marketplace

## 1. Database Schema Changes

### Add Habits Model to Prisma Schema

Add this to `prisma/schema.prisma` (after the User model relationships):

```prisma
model Habit {
  id            String    @id @default(cuid())
  userId        String
  name          String
  description   String?
  difficulty    String    @default("medium") // easy, medium, hard
  xpReward      Int       // Points earned per completion
  color         String    @default("#3b82f6") // For UI
  icon          String    @default("📌") // Emoji icon
  category      String?   // fitness, learning, health, productivity
  frequency     String    @default("daily") // daily, weekly, custom
  isActive      Boolean   @default(true)
  streak        Int       @default(0) // Consecutive days completed
  lastCompletedAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  completions   HabitCompletion[]

  @@index([userId])
  @@index([isActive])
}

model HabitCompletion {
  id            String    @id @default(cuid())
  habitId       String
  userId        String
  completedAt   DateTime  @default(now())
  pointsEarned  Int
  notes         String?

  habit         Habit     @relation(fields: [habitId], references: [id], onDelete: Cascade)
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([habitId, completedAt])
  @@index([userId, completedAt])
}
```

## 2. Reward Points by Difficulty

```typescript
// lib/habit-constants.ts
export const HABIT_DIFFICULTY_REWARDS = {
  easy: 10,
  medium: 25,
  hard: 50,
} as const;

export const POINTS_PER_LEVEL = 100;

export const HABIT_CATEGORIES = [
  'fitness',
  'learning',
  'health',
  'productivity',
  'mindfulness',
  'social',
  'creative',
  'other'
] as const;

export const HABIT_FREQUENCIES = [
  'daily',
  'weekly',
  'custom'
] as const;
```

## 3. Core Logic: Complete Habit Function

```typescript
// lib/habit-service.ts
import prisma from '@/lib/prisma';
import { HABIT_DIFFICULTY_REWARDS, POINTS_PER_LEVEL } from '@/lib/habit-constants';

export async function completeHabit(userId: string, habitId: string) {
  // 1. Fetch the habit
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit || habit.userId !== userId) {
    throw new Error('Habit not found');
  }

  // 2. Calculate XP reward based on difficulty
  const xpReward = HABIT_DIFFICULTY_REWARDS[habit.difficulty as keyof typeof HABIT_DIFFICULTY_REWARDS];

  // 3. Create completion record
  const completion = await prisma.habitCompletion.create({
    data: {
      habitId,
      userId,
      pointsEarned: xpReward,
    },
  });

  // 4. Update user points
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: xpReward },
      lifetimePoints: { increment: xpReward },
    },
  });

  // 5. Check for level up
  const newLevel = Math.floor(user.lifetimePoints / POINTS_PER_LEVEL);
  const oldLevel = Math.floor((user.lifetimePoints - xpReward) / POINTS_PER_LEVEL);

  if (newLevel > oldLevel) {
    // Level up! Trigger celebration
    await prisma.notification.create({
      data: {
        userId,
        type: 'level_up',
        title: `🎉 Level Up!`,
        message: `Congratulations! You reached Level ${newLevel}!`,
      },
    });
  }

  return completion;
}

export async function createHabit(userId: string, data: {
  name: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  frequency?: string;
  icon?: string;
  color?: string;
}) {
  return prisma.habit.create({
    data: {
      ...data,
      userId,
      xpReward: HABIT_DIFFICULTY_REWARDS[data.difficulty],
    },
  });
}

export async function getUserHabits(userId: string) {
  return prisma.habit.findMany({
    where: { userId, isActive: true },
    include: {
      completions: {
        where: {
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        orderBy: { completedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getHabitStats(userId: string) {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      completions: {
        orderBy: { completedAt: 'desc' },
      },
    },
  });

  return {
    totalHabits: habits.length,
    activeHabits: habits.filter(h => h.isActive).length,
    thisWeekCompletions: habits.reduce((sum, h) => {
      const weekCompletions = h.completions.filter(c => {
        const daysAgo = (new Date().getTime() - c.completedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo < 7;
      }).length;
      return sum + weekCompletions;
    }, 0),
    longestStreak: Math.max(...habits.map(h => h.streak), 0),
  };
}
```

## 4. API Routes

### Create/Complete Habits

```typescript
// app/api/habits/create/route.ts
import { getServerSession } from 'next-auth';
import { createHabit } from '@/lib/habit-service';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const data = await req.json();
  const habit = await createHabit(session.user.id, data);
  
  return Response.json(habit);
}
```

```typescript
// app/api/habits/complete/route.ts
import { getServerSession } from 'next-auth';
import { completeHabit } from '@/lib/habit-service';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { habitId } = await req.json();
  const completion = await completeHabit(session.user.id, habitId);
  
  return Response.json(completion);
}
```

```typescript
// app/api/habits/list/route.ts
import { getServerSession } from 'next-auth';
import { getUserHabits } from '@/lib/habit-service';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const habits = await getUserHabits(session.user.id);
  return Response.json(habits);
}
```

## 5. UI Components

### HabitCard Component

```typescript
// components/HabitCard.tsx
'use client';

import { useState } from 'react';
import { Habit } from '@prisma/client';

interface HabitCardProps {
  habit: Habit & { completions: any[] };
  onComplete: () => void;
  isCompleted: boolean;
}

export function HabitCard({ habit, onComplete, isCompleted }: HabitCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/habits/complete', {
        method: 'POST',
        body: JSON.stringify({ habitId: habit.id }),
      });
      if (res.ok) {
        onComplete();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-2xl mb-2">{habit.icon}</div>
          <h3 className="font-bold text-lg">{habit.name}</h3>
          {habit.description && <p className="text-sm text-gray-600">{habit.description}</p>}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[habit.difficulty as keyof typeof difficultyColors]}`}>
          {habit.difficulty}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          ⭐ +{habit.xpReward} XP
          {habit.streak > 0 && ` | 🔥 ${habit.streak} day streak`}
        </div>
        <button
          onClick={handleComplete}
          disabled={isLoading || isCompleted}
          className={`px-4 py-2 rounded font-semibold ${
            isCompleted
              ? 'bg-green-200 text-green-800 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? '...' : isCompleted ? '✓ Done Today' : '✓ Complete'}
        </button>
      </div>
    </div>
  );
}
```

### Dashboard Page

```typescript
// app/page.tsx (refactored)
'use client';

import { useEffect, useState } from 'react';
import { HabitCard } from '@/components/HabitCard';
import { UserStats } from '@/components/UserStats';
import { CreateHabitForm } from '@/components/CreateHabitForm';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await fetch('/api/habits/list');
      if (res.ok) {
        setHabits(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHabitComplete = () => {
    fetchHabits();
  };

  if (loading) return <div>Loading habits...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📌 My Habits</h1>
          <p className="text-gray-600">Complete your daily habits to earn points and level up!</p>
        </div>

        {/* Stats */}
        <UserStats />

        {/* Habits Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Active Habits</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
            >
              + New Habit
            </button>
          </div>

          {showCreateForm && <CreateHabitForm onSuccess={() => { setShowCreateForm(false); fetchHabits(); }} />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={handleHabitComplete}
                isCompleted={habit.completions.some(c => {
                  const today = new Date().toDateString();
                  return new Date(c.completedAt).toDateString() === today;
                })}
              />
            ))}
          </div>
        </div>

        {/* Rewards Store CTA */}
        <div className="bg-white rounded-lg p-6 shadow-md text-center">
          <h3 className="text-xl font-bold mb-2">Earned Enough Points?</h3>
          <p className="text-gray-600 mb-4">Redeem your points for amazing rewards!</p>
          <a href="/rewards" className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700">
            🎁 Visit Rewards Store
          </a>
        </div>
      </div>
    </div>
  );
}
```

## 6. Migration Steps

```bash
# 1. Update Prisma schema with Habit models
# 2. Run migration
npx prisma migrate dev --name add_habits

# 3. Generate Prisma Client
npx prisma generate

# 4. Create API routes
# 5. Update UI components
# 6. Update pages

# 7. Test the flow:
npm run dev
```

## 7. Key Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Main Action** | Click button repeatedly | Complete daily habits |
| **Points Earned** | 1 point per click | Variable (10/25/50 based on difficulty) |
| **UI Focus** | Click counter | Habit list with checkboxes |
| **Products** | Shop | Rewards Marketplace |
| **Core Loop** | Clicker → Points | Habits → Points → Rewards |

## 8. Phase 2 Features (Optional)

After refactoring complete:
- [ ] Habit streaks and achievements
- [ ] Social sharing of habit completions
- [ ] AI-powered habit suggestions
- [ ] Reminder notifications
- [ ] Habit analytics dashboard
- [ ] Habit templates library

---

**Next Steps:**
1. Run the migration to add Habit models
2. Create the API routes
3. Build UI components
4. Update main dashboard page
5. Test the complete flow
