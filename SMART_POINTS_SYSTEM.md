# Smart Points System Documentation

## Overview

The Smart Points System is a comprehensive point tracking and reward system built into the ClickerPro application. It tracks user activity, calculates bonuses, unlocks achievements, and maintains engagement through streaks and daily rewards.

## Features

### 1. **Core Point Tracking**
- **Base Rewards**: 10 points per click
- **Click Counter**: Total lifetime clicks tracked
- **Lifetime Points**: Cumulative points earned across all sources
- **Daily Earnings**: Points earned in the current day

### 2. **Bonus Systems**

#### Streak Bonus
- Maintained by logging in daily
- Multiplier increases by 10% per day (caps at 2x)
- Resets if user misses a day
- Shows in user profile

#### Daily Bonus
- When user reaches 100+ clicks in a day
- Provides 1.5x multiplier on all clicks
- Applies automatically to subsequent clicks that day

#### Ad Rewards
- 50 points per ad watched
- Tracked separately in `pointsFromAds`
- Encourages monetization participation

#### Task Rewards
- Variable points based on task difficulty
- Tracked in `pointsFromTasks`
- Completes and rewards tracked independently

### 3. **Achievement System**

Achievements provide bonus points and engagement milestones:

| Achievement | Requirement | Reward |
|------------|-------------|--------|
| First Click | 1 click | 100 pts |
| Century | 100 clicks | 500 pts |
| Millionaire Clicker | 1,000 clicks | 2,000 pts |
| Big Earner | 1,000 lifetime pts | 500 pts |
| Rich | 5,000 lifetime pts | 1,000 pts |
| 7-Day Streak | 7-day streak | 300 pts |
| Monthly Warrior | 30-day streak | 1,500 pts |

### 4. **Daily Statistics**
Each day tracks:
- Clicks completed
- Points earned
- Ads watched
- Tasks completed
- Session time (in seconds)

Enables user to see daily progress and patterns.

### 5. **Points History**
Complete audit trail of all point transactions:
- Source (click, ad, task, achievement, etc.)
- Amount earned
- Description
- Timestamp

## Database Schema

### User Model (Extended)
```prisma
model User {
  // Existing fields...
  
  // Smart Points Fields
  dailyEarnings     Int       @default(0)
  lifetimePoints    Int       @default(0)
  pointsFromAds     Int       @default(0)
  pointsFromTasks   Int       @default(0)
  lastActivityAt    DateTime? @default(now())
  lastDailyReset    DateTime? @default(now())
  streakDays        Int       @default(0)
  totalSessionTime  Int       @default(0)
  
  // Relations
  pointsHistory     PointsHistory[]
  dailyStats        DailyStats[]
  achievements      UserAchievement[]
  tasks             Task[]
}

model PointsHistory {
  id          String   @id @default(cuid())
  userId      String
  amount      Int
  source      String   // "click", "ad", "task", "purchase", etc
  description String?
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
}

model DailyStats {
  id              String   @id @default(cuid())
  userId          String
  date            DateTime @default(now())
  clicksToday     Int      @default(0)
  pointsEarned    Int      @default(0)
  adsWatched      Int      @default(0)
  tasksCompleted  Int      @default(0)
  sessionTime     Int      @default(0)
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, date])
}

model Achievement {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  icon        String?
  requirement String
  reward      Int
  
  users       UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())
  
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  @@unique([userId, achievementId])
}

model Task {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  reward      Int
  completed   Boolean  @default(false)
  completedAt DateTime?
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

## API Routes

### GET `/api/points/stats`
Returns current user's points statistics
```json
{
  "data": {
    "id": "user_id",
    "points": 12450,
    "clicks": 1240,
    "dailyEarnings": 850,
    "lifetimePoints": 12450,
    "pointsFromAds": 500,
    "pointsFromTasks": 200,
    "streakDays": 7,
    "totalSessionTime": 3600
  }
}
```

### GET `/api/points/daily-stats?days=7`
Returns daily statistics for last N days
```json
{
  "stats": [
    {
      "date": "2024-11-20",
      "clicksToday": 100,
      "pointsEarned": 1500,
      "adsWatched": 2,
      "tasksCompleted": 1
    }
  ]
}
```

### POST `/api/points/click`
Records a click and applies all bonuses
```json
{
  "message": "Click recorded successfully",
  "user": {
    "points": 12460,
    "clicks": 1241,
    "dailyEarnings": 860,
    "lifetimePoints": 12460
  },
  "clickReward": 10,
  "dailyBonus": 0,
  "newAchievements": []
}
```

### GET `/api/points/achievements`
Returns user's unlocked achievements
```json
{
  "achievements": [
    {
      "id": "achievement_id",
      "name": "First Click",
      "description": "Complete your first click",
      "icon": "👆",
      "reward": 100,
      "unlockedAt": "2024-11-01T12:00:00Z"
    }
  ]
}
```

### GET `/api/points/history?limit=50`
Returns points transaction history
```json
{
  "history": [
    {
      "id": "entry_id",
      "amount": 10,
      "source": "click",
      "description": "Earned 10 points from click",
      "createdAt": "2024-11-20T12:00:00Z"
    }
  ]
}
```

## React Hooks

### `useSmartPoints()`
Hook for fetching and managing points data

```tsx
const {
  pointsData,      // Current points data
  dailyStats,      // Last 7 days stats
  loading,         // Loading state
  error,           // Error message
  refetch,         // Manual refresh
  refetchDailyStats // Refresh daily stats
} = useSmartPoints();
```

## Components

### `<PointsStatsCard />`
Displays key points statistics in a 2x2 grid:
- Total Points & Today's Earnings
- Current Streak & Total Clicks
- Points Sources Breakdown
- Last Activity Timestamp

### `<AchievementsComponent />`
Shows all unlocked achievements with:
- Achievement name and description
- Point reward
- Unlock date
- Icon

### `<PointsHistoryComponent />`
Displays recent point transactions with:
- Source icon
- Amount
- Description
- Timestamp

### Stats Page (`/stats`)
Complete analytics dashboard combining all components with:
- Animated gradient background
- Light/dark theme support
- Responsive grid layout
- Real-time data updates

## Utilities

### `lib/points-utils.ts`

**Constants:**
- `POINTS_CONFIG`: Base rewards and multipliers
- `ACHIEVEMENTS`: Achievement definitions

**Functions:**
- `calculateClickReward()`: Apply streak and daily bonuses
- `getDailyBonus()`: Calculate daily bonus
- `checkAchievements()`: Determine unlocked achievements
- `formatPoints()`: Format with commas
- `formatSessionTime()`: Convert seconds to readable format

## Usage Example

```tsx
import { useSmartPoints } from '@/hooks/useSmartPoints';
import PointsStatsCard from '@/components/PointsStatsCard';

export default function Dashboard() {
  const { pointsData, loading } = useSmartPoints();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome back! You have {pointsData?.points} points</h1>
      <PointsStatsCard />
    </div>
  );
}
```

## Next Steps for Enhancement

1. **Leaderboard**: Global rankings by points or streak
2. **Badges**: Limited-time special achievements
3. **Ad Integration**: Real video ads for point rewards
4. **Task System**: Daily/weekly tasks for users
5. **Referral Bonus**: Points for referring friends
6. **Point Marketplace**: Spend points on cosmetics/perks
7. **Analytics Dashboard**: Admin view of system stats
8. **Social Sharing**: Share achievements on social media

## Migration

To apply the Smart Points System to an existing database:

```bash
npx prisma migrate dev --name add_smart_points_system
```

Or use db push for shadow database testing:

```bash
npx prisma db push
```
