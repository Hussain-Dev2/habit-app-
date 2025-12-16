# Data Structures - Quick Reference & Visual Guide

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GAME STATE HOOK                        │
│                    (useGameState.ts)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    USER      │  │   REWARDS    │  │    HABITS    │      │
│  │              │  │              │  │              │      │
│  │ • points     │  │ • id         │  │ • id         │      │
│  │ • level      │  │ • costPoints │  │ • title      │      │
│  │ • email      │  │ • stock      │  │ • difficulty │      │
│  │ • isAdmin    │  │ • category   │  │ • streak     │      │
│  │              │  │ • imageUrl   │  │ • completed  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  Actions: updateUser() addPoints()                         │
│  Actions: addReward() purchaseReward()                     │
│  Actions: addHabit() updateHabit() completeHabit()        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Data Models

### User Model
```typescript
User {
  id: string                    // Unique identifier
  email?: string               // Optional email
  name?: string                // Optional display name
  points: number              // Current spendable points
  lifetimePoints: number      // Total earned (for leveling)
  level?: number              // Calculated from lifetimePoints
  isAdmin?: boolean           // Admin flag
}
```

**Example:**
```json
{
  "id": "user-123",
  "email": "player@example.com",
  "name": "John Doe",
  "points": 1250,
  "lifetimePoints": 5000,
  "level": 3,
  "isAdmin": false
}
```

---

### Reward Model (Previously "Product")
```typescript
Reward {
  id: string                  // Unique identifier
  title: string              // "Google Play Gift Card ($10)"
  costPoints: number         // Points to purchase (100)
  stock?: number | null      // Inventory (null = unlimited)
  description?: string       // Optional description
  imageUrl?: string          // Product image
  category?: string          // "Google Play", "iTunes", etc.
  value?: string             // "$10", "$25", etc.
  region?: string            // "USA", "EU", "Global", etc.
  isDigital: boolean         // true for digital products
  createdAt: Date            // When added
}
```

**Example:**
```json
{
  "id": "reward-1",
  "title": "Google Play Gift Card ($25)",
  "costPoints": 250,
  "stock": null,
  "category": "Google Play",
  "value": "$25",
  "region": "Global",
  "isDigital": true,
  "imageUrl": "https://..."
}
```

---

### Habit Model
```typescript
Habit {
  id: string                  // Unique identifier
  userId: string             // Owner
  title: string              // "Morning Run"
  description?: string       // "30-minute jog"
  category: string           // "fitness", "health", "learning", etc.
  difficulty: string         // "easy" | "medium" | "hard" | "extreme"
  xpValue: number           // Points per completion (from difficulty)
  frequency: string         // "daily" | "weekly" | "monthly"
  
  // Status
  completed: boolean        // Completed today?
  completedAt?: Date       // Last completion timestamp
  currentStreak: number    // Consecutive completions
  longestStreak: number    // Personal best
  
  // Metadata
  createdAt: Date          // When created
  updatedAt: Date          // Last modified
  isActive: boolean        // Still tracking?
}
```

**Example:**
```json
{
  "id": "habit-1",
  "userId": "user-123",
  "title": "Morning Run",
  "description": "30-minute jog around the park",
  "category": "fitness",
  "difficulty": "medium",
  "xpValue": 25,
  "frequency": "daily",
  "completed": false,
  "currentStreak": 5,
  "longestStreak": 12,
  "isActive": true
}
```

---

### HabitCompletion Model
```typescript
HabitCompletion {
  id: string               // Unique identifier
  habitId: string         // Which habit
  userId: string          // Who completed it
  
  // Points breakdown
  basePoints: number      // From difficulty (10/25/50/100)
  streakBonus: number    // From streak multiplier
  difficultyBonus: number // From first-completion-today (+20%)
  totalPoints: number    // Sum of all
  
  completedAt: Date      // When completed
}
```

**Example:**
```json
{
  "id": "completion-1",
  "habitId": "habit-1",
  "userId": "user-123",
  "basePoints": 25,
  "streakBonus": 12,
  "difficultyBonus": 5,
  "totalPoints": 42,
  "completedAt": "2025-12-12T08:30:00Z"
}
```

---

## 💰 Points System Flowchart

```
Habit Completed
       │
       ├─→ Get Difficulty ─────────→ Lookup Base Points
       │                                  │
       │                          (easy:10, medium:25, hard:50, extreme:100)
       │
       ├─→ Check Current Streak ──→ Calculate Streak Multiplier
       │                                  │
       │                          (1.0 + streak × 0.1, max 2.0x)
       │
       ├─→ Check If First Today ─→ Apply First-Completion Bonus
       │                                  │
       │                          (if yes: +20%, else: 0)
       │
       ├─→ Apply User Level ────→ Multiply by Level Bonus
       │                                  │
       │                          (level.clickMultiplier: 1.0-5.0x)
       │
       ├─→ Check Streak Milestone ─→ Add Consistency Bonus
       │                                  │
       │                    (3d:+30, 7d:+100, 14d:+250, 30d:+500)
       │
       └─→ AWARD TOTAL POINTS TO USER ←─┘
```

---

## 📈 Points Calculation Example

### Scenario: Complete a Medium Difficulty Habit

```
Habit: "Read 30 Pages"
• Difficulty: MEDIUM
• Current Streak: 7 days
• First completion today: YES
• User Level: 3 (multiplier: 1.5x)

CALCULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Base Points (Medium)
   = 25 pts

2. Streak Multiplier (7 days)
   = 1 + (7 × 0.1) = 1.7x
   = 25 × 0.7 = 17 pts bonus

3. First Completion Today (+20%)
   = 25 × 0.2 = 5 pts bonus

4. Subtotal
   = 25 + 17 + 5 = 47 pts

5. User Level Multiplier (1.5x)
   = 47 × 1.5 = 70 pts

6. Milestone Check
   = Not at 7-day milestone yet (already counted)

TOTAL: 70 POINTS ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User Reward Breakdown:
✓ Base: 25 pts
✓ Streak Bonus: 17 pts (7-day × 1.7 multiplier)
✓ First Today: 5 pts (+20%)
✓ Level Bonus: 23 pts (1.5x multiplier)
─────────────────
Total Earned: 70 pts 🎉
```

---

## 🎮 Hook Usage Patterns

### Pattern 1: Display User Stats
```tsx
const { user, loading } = useGameState();

if (loading) return <Spinner />;

return (
  <div>
    <h1>Points: {user?.points}</h1>
    <p>Level: {user?.level}</p>
  </div>
);
```

### Pattern 2: List Habits
```tsx
const { habits, completeHabit } = useGameState();

return (
  <div>
    {habits.map(habit => (
      <HabitCard 
        key={habit.id} 
        habit={habit}
        onComplete={() => completeHabit(habit.id)}
      />
    ))}
  </div>
);
```

### Pattern 3: Shop & Purchase
```tsx
const { rewards, purchaseReward, user } = useGameState();

const handleBuy = (rewardId: string) => {
  const success = purchaseReward(rewardId);
  if (success) {
    console.log('Purchased!');
  }
};
```

### Pattern 4: Complete Habit & Show Reward
```tsx
const { completeHabit } = useGameState();

const completion = completeHabit('habit-123');

if (completion) {
  return (
    <div className="reward-popup">
      <h2>Habit Completed!</h2>
      <p className="big-number">+{completion.totalPoints} pts</p>
      <div className="breakdown">
        <p>Base: {completion.basePoints}</p>
        <p>Streak: +{completion.streakBonus}</p>
        <p>Bonus: +{completion.difficultyBonus}</p>
      </div>
    </div>
  );
}
```

---

## 🏆 Difficulty Levels Cheat Sheet

| Level | Base Points | Time | Best For |
|-------|------------|------|----------|
| 🟢 Easy | 10 pts | 5-15 min | Quick wins, daily streaks |
| 🟡 Medium | 25 pts | 15-30 min | Regular habits |
| 🔴 Hard | 50 pts | 30-60 min | Challenging activities |
| 🟣 Extreme | 100 pts | 60+ min | Major commitments |

### Streak Multiplier Table
```
Streak Days  │ Multiplier │ Bonus from 25-pt habit
─────────────┼────────────┼──────────────────────
1            │ 1.1x       │ 2-3 pts
3            │ 1.3x       │ 7 pts
5            │ 1.5x       │ 12 pts
7            │ 1.7x       │ 17 pts
10           │ 2.0x       │ 25 pts (capped)
15+          │ 2.0x       │ 25 pts (capped)
```

---

## 📁 File Organization

```
Your App
│
├── lib/
│   ├── data-structures.ts          ← Type definitions
│   ├── points-utils.ts             ← Point helpers
│   ├── level-system.ts             ← Level progression
│   └── ...
│
├── hooks/
│   ├── useGameState.ts             ← Main state hook
│   ├── useSmartPoints.ts           ← Legacy hook
│   └── ...
│
└── components/
    ├── UserCard.tsx                ← Display user stats
    ├── HabitsList.tsx              ← (To create)
    ├── HabitCard.tsx               ← (To create)
    └── ...
```

---

## 🔄 State Flow

```
Component Mounts
       │
       ├─→ useGameState() ──────→ Initialize state
       │                              │
       ├─→ useEffect ─────────────→ fetchUser()
       │                              │
       ├─→ Render with state ───→ UI updates
       │                              │
       └─→ User interaction ───────→ Action called
                                       │
                                    ↓ (e.g., completeHabit())
                                       │
                                    Points calculated ✓
                                       │
                                    State updated ✓
                                       │
                                    Component re-renders ✓
```

---

## ✨ Key Features Summary

| Feature | Status | Benefit |
|---------|--------|---------|
| Type-safe interfaces | ✅ Complete | IDE support, fewer bugs |
| User system | ✅ Ready | Points, levels, profile |
| Reward system | ✅ Ready | Shop, purchasing, inventory |
| Habit system | ✅ Complete | Tracking, streaks, difficulty |
| Points calculation | ✅ Built-in | Automated reward math |
| State management | ✅ Centralized | Single source of truth |
| Hook-based | ✅ Scalable | Easy component integration |
| Documented | ✅ Comprehensive | 4 guide documents |

---

## 🎯 Next Actions

1. **Review the files** in your IDE
2. **Read STATE_MANAGEMENT_GUIDE.md** for detailed info
3. **Test locally** with sample data
4. **Proceed to Phase 2** when ready (API routes)

---

## Quick Copy-Paste Reference

### Import the hook
```tsx
import { useGameState } from '@/hooks/useGameState';
```

### Import types
```tsx
import { User, Reward, Habit, HabitCompletion } from '@/lib/data-structures';
```

### Use in component
```tsx
const { user, habits, rewards, completeHabit, addPoints } = useGameState();
```

### Complete a habit
```tsx
const completion = completeHabit(habitId);
console.log(`Earned ${completion?.totalPoints} points!`);
```

### Purchase a reward
```tsx
const success = purchaseReward(rewardId);
if (success) console.log('Purchase successful!');
```

---

**Status: ✅ Phase 1 Complete - Ready for Phase 2**
