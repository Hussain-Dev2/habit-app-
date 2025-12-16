# Gamified Habit Tracker - Implementation Checklist

## ✅ Completed Files

### Core Logic
- ✅ `lib/habit-constants.ts` - Constants, rewards, categories
- ✅ `lib/habit-service.ts` - Core business logic
  
### API Routes
- ✅ `app/api/habits/complete/route.ts` - Complete a habit
- ✅ `app/api/habits/create/route.ts` - Create new habit
- ✅ `app/api/habits/list/route.ts` - Get user's habits
- ✅ `app/api/habits/stats/route.ts` - Get habit statistics

### UI Components
- ✅ `components/HabitCard.tsx` - Display single habit with complete button
- ✅ `components/CreateHabitForm.tsx` - Form to create new habit
- ✅ `components/HabitStats.tsx` - Display habit statistics

---

## 🔄 Migration Steps

### Step 1: Update Prisma Schema

1. Open `prisma/schema.prisma`
2. Add to the User model relationships section:

```prisma
habits         Habit[]
habitCompletions HabitCompletion[]
```

3. Add these models at the end (before the closing brace):

```prisma
model Habit {
  id            String    @id @default(cuid())
  userId        String
  name          String
  description   String?
  difficulty    String    @default("medium") // easy, medium, hard
  xpReward      Int       // Points earned per completion
  color         String    @default("#3b82f6")
  icon          String    @default("📌")
  category      String?   // fitness, learning, health, productivity
  frequency     String    @default("daily")
  isActive      Boolean   @default(true)
  streak        Int       @default(0)
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

### Step 2: Run Database Migration

```bash
# Create migration
npx prisma migrate dev --name add_habits_system

# Generate Prisma Client
npx prisma generate
```

### Step 3: Create New Page (Dashboard)

Create `app/habits/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { HabitCard } from '@/components/HabitCard';
import { HabitStats } from '@/components/HabitStats';
import { CreateHabitForm } from '@/components/CreateHabitForm';

export default function HabitsPage() {
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

  if (loading) {
    return <div className="p-6 text-center">Loading habits...</div>;
  }

  const todayCompletedIds = new Set(
    habits
      .filter((h: any) => {
        const today = new Date().toDateString();
        return h.completions.some((c: any) =>
          new Date(c.completedAt).toDateString() === today
        );
      })
      .map((h: any) => h.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📌 My Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your daily habits to earn points and level up!
          </p>
        </div>

        {/* Stats */}
        <HabitStats />

        {/* Habits Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Active Habits
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + New Habit
            </button>
          </div>

          {showCreateForm && (
            <CreateHabitForm
              onSuccess={() => {
                setShowCreateForm(false);
                fetchHabits();
              }}
            />
          )}

          {habits.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No habits yet. Create your first one!
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Create First Habit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit: any) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={fetchHabits}
                  isCompletedToday={todayCompletedIds.has(habit.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rewards CTA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Ready for Your Rewards?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Redeem your earned points for amazing rewards!
          </p>
          <a
            href="/shop"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            🎁 Visit Rewards Marketplace
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Update Navigation

Update [Header.tsx](components/Header.tsx) to add a link to `/habits`:

Add to the navigation menu:
```jsx
<a href="/habits" className="...">📌 My Habits</a>
```

### Step 5: Update Home Page

Replace the current click button with a redirect to habits:

```typescript
// app/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function Home() {
  const session = await getServerSession();
  
  if (session) {
    redirect('/habits');
  }

  // Show landing page for non-logged-in users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">📌 Gamified Habit Tracker</h1>
        <p className="text-xl text-gray-600 mb-8">Build better habits, earn rewards</p>
        <a href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Get Started
        </a>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Checklist

- [ ] Can create a new habit with name, difficulty, category, and icon
- [ ] New habit appears in the habits list
- [ ] Clicking "Complete" marks habit as done for today
- [ ] Can't complete the same habit twice in one day
- [ ] XP reward is correctly applied:
  - Easy: +10 XP
  - Medium: +25 XP
  - Hard: +50 XP
- [ ] Statistics update correctly:
  - Total habits count
  - Today's completions
  - This week's count
  - Streak tracking
- [ ] Level up notification appears when crossing POINTS_PER_LEVEL threshold
- [ ] User points and lifetimePoints are updated correctly
- [ ] Shop/Rewards section still works (buying with points deducts points, not level)

---

## 📊 Data Flow

```
User completes habit
        ↓
API: POST /api/habits/complete
        ↓
completeHabit() function:
  - Find habit by ID
  - Get XP reward from difficulty
  - Create HabitCompletion record
  - Update user points & lifetimePoints
  - Update streak
  - Check for level up
  - Create notification if leveled up
        ↓
Return result to frontend
        ↓
UI updates to show:
  - "✓ Done Today!" button
  - Updated stats
  - Level up notification (if applicable)
```

---

## 🎯 Next Phase Features

After core implementation works:

1. **Habit Reminders**
   - Daily notifications at set time
   - Push notifications

2. **Habit Analytics**
   - Completion rate trends
   - Best times to complete habits
   - Habit success rates

3. **Social Features**
   - Share habit completions
   - Friend groups/challenges
   - Leaderboards by habit

4. **Smart Suggestions**
   - AI-powered habit recommendations
   - Optimal timing suggestions
   - Habit compatibility analysis

5. **Advanced Rewards**
   - Unlock special rewards at milestones
   - Seasonal rewards
   - Limited-time offers

---

## 🚀 Deploy Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Database migration successful
- [ ] Environment variables set (.env)
- [ ] API routes tested
- [ ] UI responsive on mobile/tablet
- [ ] Dark mode works correctly
- [ ] Performance optimized (lazy loading, caching)
- [ ] Security: Input validation, auth checks
- [ ] Error handling implemented
- [ ] Analytics tracking setup

---

## 📝 Notes

- Keep the existing shop/rewards system - it's already refactored
- The click button is removed, replaced with habit completion
- Points system remains: `points` for spending, `lifetimePoints` for level
- Level calculation: `Math.floor(lifetimePoints / 100)`
- All existing features (ads, referrals, achievements) remain compatible

---

**Status: 🟢 Ready for Migration**

All files have been created. Follow the steps above to implement the Gamified Habit Tracker!
