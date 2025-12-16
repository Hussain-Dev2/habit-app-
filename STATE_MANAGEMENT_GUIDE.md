# State Management & Data Structures Guide

## Overview

Your application now has a clean, type-safe state management system for managing:
- **User** (points, level)
- **Rewards** (previously called "Products")
- **Habits** (new feature - daily/weekly tasks)

## Files Created

### 1. `lib/data-structures.ts`
Defines all TypeScript interfaces and constants:
- `User` - Player profile with points
- `Reward` - Shop items (renamed from Product)
- `Habit` - Daily habits users complete
- `HabitCompletion` - Records of completed habits
- `GameState` - Complete app state
- Constants for points calculation

### 2. `hooks/useGameState.ts`
Custom React hook for managing all state with actions:
- `updateUser()` - Update user data
- `addPoints()` - Award points
- `addHabit()` - Create new habit
- `completeHabit()` - Mark habit done and calculate points
- `purchaseReward()` - Redeem points for rewards
- `fetchUser/fetchRewards/fetchHabits()` - Load from API

---

## Data Structure Overview

### User Object
```typescript
interface User {
  id: string;
  email?: string;
  name?: string | null;
  points: number;              // Current spendable points
  lifetimePoints: number;      // Total earned (for level)
  level?: number;              // Calculated from lifetimePoints
  isAdmin?: boolean;
}
```

### Reward Object (Previously "Product")
```typescript
interface Reward {
  id: string;
  title: string;               // "Google Play Gift Card"
  costPoints: number;          // 100 points to redeem
  stock?: number | null;       // null = unlimited
  imageUrl?: string | null;
  category?: RewardCategory;   // "Google Play", "iTunes", etc
  isDigital: boolean;
}
```

### Habit Object
```typescript
interface Habit {
  id: string;
  userId: string;
  
  // Basic Info
  title: string;               // "Morning Run"
  description?: string;
  category: HabitCategory;     // "fitness", "learning", etc
  
  // Rewards
  difficulty: HabitDifficulty; // "easy" | "medium" | "hard" | "extreme"
  xpValue: number;             // Points per completion (auto from difficulty)
  frequency: HabitFrequency;   // "daily" | "weekly" | "monthly"
  
  // Tracking
  completed: boolean;          // Completed today?
  currentStreak: number;       // Days in a row
  longestStreak: number;       // Personal record
  
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

### Habit Completion Record
```typescript
interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  
  basePoints: number;          // From difficulty
  streakBonus: number;         // From streak multiplier
  difficultyBonus: number;     // From first-completion-today
  totalPoints: number;         // Sum
  
  completedAt: Date;
}
```

---

## Points Calculation

### Base Points by Difficulty
```
Easy    → 10 points
Medium  → 25 points
Hard    → 50 points
Extreme → 100 points
```

### Points Multipliers
```typescript
// 1. Streak Multiplier: 1.0 + (0.1 × streak), capped at 2.0x
// 5-day streak: 1 + (5 × 0.1) = 1.5x multiplier

// 2. First Completion Today: +20%
// If habit not done yet today: +20% bonus points

// 3. Consistency Bonuses
3-day streak   → +30 points
7-day streak   → +100 points
14-day streak  → +250 points
30-day streak  → +500 points
```

### Example
```
Hard habit (50 pts) × Level multiplier (assume 2.0x)
+ 5-day streak (1.5x multiplier)
+ First completion today (+20%)

= 50 × 2.0 × 1.5 × 1.2 = 180 points
```

---

## Usage Examples

### Example 1: Using the Hook in a Component

```tsx
'use client';

import { useGameState } from '@/hooks/useGameState';

export default function DashboardComponent() {
  const { user, habits, rewards, completeHabit, addPoints } = useGameState();

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Points: {user.points}</h1>
      <h2>Level: {user.level}</h2>

      <h3>Your Habits</h3>
      {habits.map(habit => (
        <div key={habit.id}>
          <p>{habit.title}</p>
          <p>Streak: {habit.currentStreak} days</p>
          <button onClick={() => completeHabit(habit.id)}>
            Complete Habit
          </button>
        </div>
      ))}

      <h3>Available Rewards</h3>
      {rewards.map(reward => (
        <div key={reward.id}>
          <p>{reward.title}</p>
          <p>Cost: {reward.costPoints} points</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Creating a New Habit

```tsx
const { addHabit } = useGameState();

const handleCreateHabit = () => {
  addHabit({
    userId: user.id,
    title: 'Morning Meditation',
    description: '10-minute session',
    category: 'mindfulness',
    difficulty: 'easy',
    xpValue: 10,
    frequency: 'daily',
    completed: false,
    currentStreak: 0,
    longestStreak: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  });
};
```

### Example 3: Completing a Habit and Getting Points

```tsx
const { completeHabit, user } = useGameState();

const handleCompleteHabit = (habitId: string) => {
  const completion = completeHabit(habitId);
  
  if (completion) {
    console.log(`Completed! Earned ${completion.totalPoints} points`);
    console.log(`Breakdown:
      - Base: ${completion.basePoints}
      - Streak Bonus: ${completion.streakBonus}
      - First Today: ${completion.difficultyBonus}
    `);
    
    // User's points automatically updated via addPoints()
  }
};
```

### Example 4: Purchasing a Reward

```tsx
const { purchaseReward, user, rewards } = useGameState();

const handleBuyReward = (rewardId: string) => {
  const reward = rewards.find(r => r.id === rewardId);
  
  if (!reward) {
    console.error('Reward not found');
    return;
  }
  
  if (user.points < reward.costPoints) {
    console.error('Not enough points');
    return;
  }
  
  const success = purchaseReward(rewardId);
  
  if (success) {
    console.log(`Purchased ${reward.title}!`);
    console.log(`Points remaining: ${user.points}`);
  }
};
```

### Example 5: Calculate Points Before Display

```tsx
import { calculateHabitPoints } from '@/hooks/useGameState';

const habit = habits[0];
const pointInfo = calculateHabitPoints(
  habit.difficulty,
  habit.currentStreak,
  true // is first completion today
);

console.log(`
  Base: ${pointInfo.basePoints}
  Streak Bonus: ${pointInfo.streakBonus}
  First Today: ${pointInfo.difficultyBonus}
  Total: ${pointInfo.total}
`);
```

---

## Migration Guide: Product → Reward

### Old (Product)
```typescript
interface Product {
  id: string;
  title: string;
  costPoints: number;
  // ... other fields
}

const products = await fetch('/api/store/products');
```

### New (Reward)
```typescript
import { Reward } from '@/lib/data-structures';

const rewards = await fetch('/api/store/rewards');
// API routes renamed:
// /api/store/products → /api/store/rewards
// /api/store/buy → /api/store/rewards/buy
```

---

## Difficulty & Points Reference

### Habit Difficulty Levels

| Difficulty | Base Points | Duration | Use Case |
|-----------|------------|----------|----------|
| **Easy** | 10 | 5-15 mins | Quick tasks (stretch, drink water) |
| **Medium** | 25 | 15-30 mins | Regular tasks (read, light exercise) |
| **Hard** | 50 | 30-60 mins | Challenging (full workout, project work) |
| **Extreme** | 100 | 60+ mins | Major commitment (deep work, long run) |

---

## Tips & Best Practices

### 1. Use Type Safety
Always import types from `lib/data-structures.ts`:
```tsx
import { Habit, Reward, User } from '@/lib/data-structures';
```

### 2. Keep State Updates Atomic
Let the hook handle updates - don't manually modify state:
```tsx
// ✅ Good
const { addPoints } = useGameState();
addPoints(50);

// ❌ Bad
setState(prev => ({ ...prev, user: { ...prev.user, points: 50 } }));
```

### 3. Preload Data
Fetch data in useEffect on component mount:
```tsx
useEffect(() => {
  fetchUser();
  fetchHabits();
  fetchRewards();
}, []);
```

### 4. Show Point Calculations
When completing habits, show the breakdown:
```
✓ Morning Run Completed!
━━━━━━━━━━━━━━━━━━━
📊 Points Breakdown:
  Base (Medium): 25 pts
  Streak (5x): 12 pts
  First Today: 5 pts
  ───────────────
  Total: 42 pts 🎉
```

---

## Next Steps

1. **Update API Routes**
   - Rename `/api/store/products` → `/api/store/rewards`
   - Create `/api/habits` endpoints
   - Update prisma calls to use `Reward` model

2. **Update Components**
   - Replace `AdminProductManager` → `AdminRewardManager`
   - Create `HabitsList`, `HabitCard`, `HabitForm` components
   - Update Dashboard to use `useGameState()` hook

3. **Update Pages**
   - Update `/shop` page to fetch rewards
   - Create `/habits` page for habit management
   - Update `/purchases` page

4. **Database**
   - Create migration to rename Product → Reward
   - Create migration to add Habit & HabitCompletion models
   - Run migrations: `npx prisma migrate dev`

---

## Testing Your Setup

```tsx
// Test in browser console or a test component
import { useGameState, calculateHabitPoints } from '@/hooks/useGameState';

const { user, habits, addPoints, completeHabit } = useGameState();

// Test adding points
addPoints(100);
console.log(user?.points); // Should increase by 100

// Test completing habit
const completion = completeHabit('habit-1');
console.log(completion?.totalPoints); // Shows points earned

// Test calculation
const points = calculateHabitPoints('hard', 5, true);
console.log(points.total); // Should show calculated total
```

---

## File Locations

```
lib/
  ├── data-structures.ts      ← All TypeScript definitions & constants
  └── [existing files]

hooks/
  ├── useGameState.ts         ← Main state management hook
  └── [existing hooks]

components/
  ├── [existing components]
  ├── HabitsList.tsx          ← (To be created)
  ├── HabitCard.tsx           ← (To be created)
  └── HabitForm.tsx           ← (To be created)

app/
  ├── habits/
  │   ├── page.tsx            ← (To be created)
  │   └── [id]/page.tsx       ← (To be created)
  └── [existing pages]
```

---

## Questions & Support

- **Where is state stored?** In React component state via `useGameState()` hook
- **How do I persist state?** Add API calls in `fetchUser/fetchHabits` functions
- **Can I use Redux instead?** Yes, but hooks are simpler for this use case
- **How do I update from API?** Call the fetch functions in useEffect
