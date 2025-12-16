# Gamified Habit Tracker SaaS - Refactoring Plan

## Overview
Transform the Clicker App into a Gamified Habit Tracker SaaS where users complete daily habits instead of clicking, and earn points based on habit difficulty and consistency.

---

## Phase 1: Data Model Refactoring

### 1.1 Rename "Products" to "Rewards"

**Files to modify:**
- `prisma/schema.prisma` - Rename model and fields
- All API routes in `app/api/store/`
- All components referencing products
- Database migration

**Changes:**
```
Product model → Reward model
productId → rewardId
Product relation → Reward relation
/api/store/products/ → /api/store/rewards/
components with "Product" → components with "Reward"
```

**Affected Files:**
- `prisma/schema.prisma` (lines 127-145)
- `app/api/store/products/route.ts`
- `app/api/store/buy/route.ts`
- `app/api/store/purchases/route.ts`
- `app/api/store/reveal-code/route.ts`
- `app/api/store/toggle-used/route.ts`
- `components/AdminProductManager.tsx` → `components/AdminRewardManager.tsx`
- `components/DigitalProductCard.tsx` → `components/RewardCard.tsx`
- `components/StoreItem.tsx`
- `app/shop/page.tsx`
- `app/purchases/page.tsx`

---

### 1.2 Add "Habits" Data Model

**New model to add to `prisma/schema.prisma`:**

```prisma
model Habit {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  category    String   // "health", "fitness", "learning", "productivity", "mindfulness"
  difficulty  String   @default("medium") // "easy" (10 pts), "medium" (25 pts), "hard" (50 pts), "extreme" (100 pts)
  frequency   String   @default("daily") // "daily", "weekly", "monthly"
  
  // Points configuration
  basePoints  Int      @default(0) // Auto-calculated based on difficulty
  streak      Int      @default(0)
  longestStreak Int    @default(0)
  
  // Tracking
  lastCompletedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  isActive    Boolean  @default(true)
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  completions HabitCompletion[]
  
  @@index([userId])
  @@index([userId, isActive])
}

model HabitCompletion {
  id        String   @id @default(cuid())
  habitId   String
  userId    String
  
  completedAt DateTime @default(now())
  pointsEarned Int
  streakBonus  Int      @default(0) // Extra points from streak
  difficultyBonus Int   @default(0) // Bonus from difficulty level
  
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  @@unique([habitId, userId, completedAt])
  @@index([userId])
  @@index([habitId])
  @@index([completedAt])
}
```

**Update User model to include:**
```prisma
habits            Habit[]
habitCompletions  HabitCompletion[]
habitsCompleted   Int @default(0) // Total habits completed all-time
```

---

## Phase 2: API Routes for Habits CRUD

### 2.1 Create Habit Management Endpoints

**New routes to create:**

```
app/api/habits/
├── route.ts              (GET all habits, POST create)
├── [id]/
│   ├── route.ts          (GET one, PUT update, DELETE)
│   └── complete/
│       └── route.ts      (POST mark as complete)
└── stats/
    └── route.ts          (GET habit completion stats)
```

**GET `/api/habits`** - List user's habits
- Query params: `isActive=true/false`, `category=health`
- Returns: Array of habits with completion info

**POST `/api/habits`** - Create new habit
- Body: `{ title, description, category, difficulty, frequency }`
- Auto-calculate basePoints based on difficulty
- Returns: Created habit object

**GET `/api/habits/[id]`** - Get specific habit with stats
- Returns: Habit details, completion history, streak info

**PUT `/api/habits/[id]`** - Update habit
- Body: `{ title, description, category, difficulty, isActive }`
- Returns: Updated habit

**DELETE `/api/habits/[id]`** - Soft delete (set isActive=false)
- Returns: Confirmation

**POST `/api/habits/[id]/complete`** - Mark habit as done
- Calculates points based on:
  - **Base difficulty** (easy=10, medium=25, hard=50, extreme=100)
  - **Streak bonus** (1.1x per day up to 2.0x max)
  - **Consistency bonus** (first completion of day: +20%)
- Updates user points and streak
- Records in HabitCompletion
- Returns: Points earned, new streak count

**GET `/api/habits/stats`** - Habit completion statistics
- Returns: Total completed, completion rate, streaks, categories breakdown

---

## Phase 3: Points System Refactoring

### 3.1 Update `lib/points-utils.ts`

**Add new function `calculateHabitReward`:**

```typescript
export const HABIT_POINTS_CONFIG = {
  DIFFICULTY_LEVELS: {
    easy: 10,
    medium: 25,
    hard: 50,
    extreme: 100,
  },
  STREAK_BONUS_MULTIPLIER: 1.1, // per day
  MAX_STREAK_BONUS: 2.0,
  FIRST_COMPLETION_TODAY_BONUS: 0.2, // 20% extra
  CONSISTENCY_BONUS: 50, // Points for completing on 3rd, 7th, 14th, 30th day streaks
};

export function calculateHabitReward(
  difficulty: string,
  streakDays: number = 0,
  isFirstCompletionToday: boolean = false,
  userLevel?: LevelBenefits
): { basePoints: number; streakBonus: number; difficultyBonus: number; total: number } {
  
  // Base points from difficulty
  const basePoints = HABIT_POINTS_CONFIG.DIFFICULTY_LEVELS[difficulty] || 25;
  
  // Streak multiplier (1.0 + 0.1 per day, capped at 2.0x)
  const streakMultiplier = Math.min(
    1 + (streakDays * (HABIT_POINTS_CONFIG.STREAK_BONUS_MULTIPLIER - 1)),
    HABIT_POINTS_CONFIG.MAX_STREAK_BONUS
  );
  const streakBonus = Math.floor(basePoints * (streakMultiplier - 1));
  
  // First completion today bonus
  let difficultyBonus = 0;
  if (isFirstCompletionToday) {
    difficultyBonus = Math.floor(basePoints * HABIT_POINTS_CONFIG.FIRST_COMPLETION_TODAY_BONUS);
  }
  
  // Apply user level multiplier if available
  let total = basePoints + streakBonus + difficultyBonus;
  if (userLevel) {
    total = Math.floor(total * userLevel.clickMultiplier);
  }
  
  return {
    basePoints,
    streakBonus,
    difficultyBonus,
    total
  };
}
```

**Update PointsHistory source field:**
- Add new source types: `habit_completion`, `habit_streak_bonus`, `habit_consistency_bonus`

### 3.2 Refactor Points Earning Trigger

**Old system:**
- Points earned on `/api/clicks` (button click)

**New system:**
- Points earned on `/api/habits/[id]/complete` (habit completion)
- Difficulty determines base reward
- Same multipliers still apply (level, combo, etc.)

---

## Phase 4: User Interface Changes

### 4.1 Replace Clicker Component with Habits Dashboard

**Old: `components/ClickButton.tsx`**
- Used to increment clicks

**New: `components/HabitsList.tsx`**
- Display user's active habits
- Show completion status, streak, current/max streak
- Mark habit as complete button
- Quick stats: habits today, total streak days

**New: `components/HabitForm.tsx`**
- Create/edit habit form
- Difficulty selector with point values preview
- Category picker
- Frequency selector

**New: `components/HabitCard.tsx`**
- Display single habit
- Progress visualization
- Streak counter
- Mark complete button
- Edit/delete actions

### 4.2 Update Main Dashboard

**Changes to `app/page.tsx` and `app/layout.tsx`:**
- Replace "Clicks" stat with "Habits Completed Today"
- Replace "Click Button" with "Habits List"
- Add habit quick-add modal

**Update `components/PointsStatsCard.tsx`:**
- Add "Habits Completed" stat
- Add "Current Streaks" section

### 4.3 Create New Pages

**`app/habits/page.tsx`** - Main habits management page
- List all habits with filters
- Create new habit button
- View completion history

**`app/habit/[id]/page.tsx`** - Single habit detail page
- Full habit info
- Completion history graph
- Streak information
- Stats

---

## Phase 5: Admin & Settings Updates

### 5.1 Update Admin Panel

**Changes to `app/admin/page.tsx`:**
- Replace "Manage Products" with "Manage Rewards"
- Add "View User Habits" section
- Add "Habit Templates" section (pre-made habits for users)

### 5.2 Create Habit Templates System

**Optional: Add to Prisma schema:**
```prisma
model HabitTemplate {
  id          String   @id @default(cuid())
  title       String
  description String?
  category    String
  difficulty  String
  frequency   String
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

**API Endpoint:**
- `GET /api/habits/templates` - List available templates

---

## Phase 6: Testing & Validation

### 6.1 Test Cases

**Habit Creation:**
- ✓ Create habit with each difficulty level
- ✓ Validate basePoints assignment
- ✓ Check frequency options

**Habit Completion:**
- ✓ Mark habit complete once per day
- ✓ Streak increments correctly
- ✓ Points awarded based on difficulty
- ✓ Streak bonus applies correctly
- ✓ Consistency bonuses at day 3, 7, 14, 30

**Streak System:**
- ✓ Streak resets on missed day
- ✓ Longest streak preserved
- ✓ Streak bonus calculation

**Points Calculation:**
- ✓ Different difficulties award correct base points
- ✓ User level multiplier applies
- ✓ Streaks compound correctly

---

## Implementation Order (Recommended)

1. **Database Migrations** (Phase 1.2)
   - Add Habit & HabitCompletion models
   - Add habit fields to User model
   - Create migration file

2. **Rename Products to Rewards** (Phase 1.1)
   - Update schema, create migration
   - Update all API routes
   - Update all components
   - Update database

3. **Points System** (Phase 3)
   - Add `calculateHabitReward` function
   - Update PointsHistory enum

4. **Habits API** (Phase 2)
   - Create all CRUD endpoints
   - Implement `/api/habits/[id]/complete` with point logic
   - Add validation

5. **UI Components** (Phase 4)
   - Create HabitsList, HabitCard, HabitForm
   - Replace ClickButton
   - Update Dashboard

6. **Pages** (Phase 4)
   - Update main pages
   - Create `/habits` pages
   - Update admin panel

7. **Testing & Polish** (Phase 6)
   - Test all functionality
   - Handle edge cases
   - Update documentation

---

## Key Business Logic Changes

### Old: Clicking System
```
User clicks button → +2-10 points (based on level/combo) → Reward redeemable
```

### New: Habit System
```
User creates Habit (easy/medium/hard/extreme)
  ↓
User completes Habit daily
  ↓
Points earned = basePoints(difficulty) × level.multiplier × streak.multiplier
  ↓
Streak increments
  ↓
Points added to user balance & history
  ↓
User redeems points for Rewards
```

### Point Multipliers Stack:
1. **Difficulty**: Sets base points (10/25/50/100)
2. **User Level**: clickMultiplier (1.0 → 5.0)
3. **Streak Bonus**: +10% per day (max 2.0x)
4. **First completion today**: +20%
5. **Consistency bonuses**: Fixed points at day 3, 7, 14, 30

**Example:**
- Hard habit (50 pts) + Level 5 (2.0x) + 7-day streak (1.7x) + first today (1.2x)
- = 50 × 2.0 × 1.7 × 1.2 = 204 points

---

## Files Checklist

### To Modify:
- [ ] `prisma/schema.prisma`
- [ ] `lib/points-utils.ts`
- [ ] `app/api/store/products/route.ts` → `app/api/store/rewards/route.ts`
- [ ] `app/api/store/buy/route.ts` → `app/api/store/rewards/buy/route.ts`
- [ ] `app/api/store/purchases/route.ts` → `app/api/store/rewards/purchases/route.ts`
- [ ] `app/api/store/reveal-code/route.ts` → `app/api/store/rewards/reveal-code/route.ts`
- [ ] `app/api/store/toggle-used/route.ts` → `app/api/store/rewards/toggle-used/route.ts`
- [ ] `components/AdminProductManager.tsx` → `components/AdminRewardManager.tsx`
- [ ] `components/DigitalProductCard.tsx` → `components/RewardCard.tsx`
- [ ] `components/ClickButton.tsx` (replace logic)
- [ ] `app/page.tsx` (main dashboard)
- [ ] `app/shop/page.tsx`
- [ ] `app/purchases/page.tsx`

### To Create:
- [ ] `app/api/habits/route.ts`
- [ ] `app/api/habits/[id]/route.ts`
- [ ] `app/api/habits/[id]/complete/route.ts`
- [ ] `app/api/habits/stats/route.ts`
- [ ] `components/HabitsList.tsx`
- [ ] `components/HabitCard.tsx`
- [ ] `components/HabitForm.tsx`
- [ ] `app/habits/page.tsx`
- [ ] `app/habit/[id]/page.tsx`
- [ ] `prisma/migrations/[timestamp]_add_habits/migration.sql`

### Database:
- [ ] Create migration for Habit & HabitCompletion models
- [ ] Run migration
- [ ] Create migration for renaming Product → Reward
- [ ] Run migration

---

## Success Criteria

✓ Users can create, read, update, delete habits
✓ Habits are categorized and have difficulty levels
✓ Completing a habit awards points based on difficulty
✓ Streak system tracks consecutive completions
✓ User level multipliers still apply to habit rewards
✓ All products successfully renamed to rewards
✓ No data loss during migration
✓ API tests pass
✓ UI is intuitive and matches habit tracking paradigm
✓ Admin can view and manage user habits

---

## Notes & Considerations

1. **Backward Compatibility**: Existing "Clicks" should be converted or deprecated
2. **Data Migration**: Consider data migration strategy for existing users (legacy points, achievements)
3. **Motivation**: Habit completion should feel rewarding with visual feedback
4. **Streaks**: Consider showing streak information prominently
5. **Notifications**: Consider adding push notifications for habit reminders
6. **Export**: Users might want to export habit data
7. **Social**: Consider leaderboards for habits (most consistent, longest streaks)
