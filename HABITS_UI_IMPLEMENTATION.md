# Habits UI Implementation

## Overview

The Habits UI has been successfully implemented to replace the click button mechanic with a habit-completion system. Users now earn XP by completing daily habits instead of clicking a button.

## Components Created

### 1. HabitsList Component (`components/HabitsList.tsx`)

**Purpose:** Main container that displays all user habits as cards

**Key Features:**
- Displays habits in a responsive list format
- Shows habit difficulty with color-coded badges
- Displays current streak and longest streak
- Shows XP reward value for each habit
- Complete button for each habit
- Real-time feedback on completion

**Props:**
```typescript
interface HabitsListProps {
  onHabitComplete?: (habitId: string, pointsEarned: number) => void;  // Callback when habit completed
  onError?: (message: string) => void;                                  // Error callback
  filter?: 'active' | 'completed' | 'all';                            // Filter habits by status
}
```

**Usage in Dashboard:**
```tsx
<HabitsList
  onHabitComplete={fetchUser}  // Refreshes user data after completion
  onError={handleClickError}   // Shows error toasts
  filter="active"              // Show only active, uncompleted habits
/>
```

## Design System

### Difficulty Color Scheme

Each difficulty level has a consistent color theme:

- **Easy** 🟢 - Green (10 XP)
  - Background: `bg-green-50 dark:bg-green-900/20`
  - Badge: `bg-green-100 dark:bg-green-900/40 text-green-800`
  
- **Medium** 🟡 - Yellow (25 XP)
  - Background: `bg-yellow-50 dark:bg-yellow-900/20`
  - Badge: `bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800`
  
- **Hard** 🔴 - Red (50 XP)
  - Background: `bg-red-50 dark:bg-red-900/20`
  - Badge: `bg-red-100 dark:bg-red-900/40 text-red-800`
  
- **Extreme** 🟣 - Purple (100 XP)
  - Background: `bg-purple-50 dark:bg-purple-900/20`
  - Badge: `bg-purple-100 dark:bg-purple-900/40 text-purple-800`

### Category Icons

Built-in emoji icons for different habit categories:
- 🏃 Fitness
- 🏥 Health
- 📚 Learning
- 💼 Productivity
- 🧘 Mindfulness
- 👥 Social
- 🎨 Creative
- 📌 Other

## State Management Integration

### Using useGameState Hook

The HabitsList component integrates with the `useGameState()` hook to manage all game state:

```typescript
const { 
  user,                    // Current user object with points and level
  habits,                  // Array of all user habits
  completeHabit,          // Function to complete a habit
  loading,                // Loading state
  error                   // Error state
} = useGameState();
```

### Habit Completion Flow

When a user clicks "Complete Habit":

1. **Validation**: Check if habit already completed today
2. **Calculation**: Calculate points earned based on:
   - Base points (difficulty level: 10/25/50/100)
   - Streak bonus (+5% per day streak)
   - First-completion bonus (+20% first time today)
3. **State Update**: Call `completeHabit(habitId)` which:
   - Marks habit as completed for today
   - Updates user points (current + lifetime)
   - Updates user level (if lifetimePoints crosses threshold)
   - Increments current streak
   - Records completion in history
4. **Callback**: Calls `onHabitComplete` to refresh user data
5. **Feedback**: Shows success message with total XP earned

### Points Calculation

```typescript
// From useGameState.ts
const calculateHabitPoints = (
  difficulty: string,      // 'easy', 'medium', 'hard', 'extreme'
  streak: number,          // Current streak (0-infinite)
  isFirstToday: boolean    // First completion today?
): number => {
  const basePoints = HABIT_DIFFICULTY_POINTS[difficulty];
  const streakBonus = Math.floor(basePoints * (streak * 0.05));    // 5% per day
  const firstBonus = isFirstToday ? Math.floor(basePoints * 0.2) : 0; // 20% first time
  return basePoints + streakBonus + firstBonus;
};
```

**Example Calculations:**
- Easy habit, 0 streak, first time today: 10 + 0 + 2 = **12 XP**
- Medium habit, 5 day streak, second time: 25 + 6 + 0 = **31 XP**
- Hard habit, 10 day streak, first time: 50 + 25 + 10 = **85 XP**
- Extreme habit, 20 day streak, first time: 100 + 100 + 20 = **220 XP**

## UI Features

### Habit Card Layout

Each habit displays:
1. **Header**
   - Category icon
   - Habit title
   - Difficulty badge with color coding

2. **Description** (if provided)
   - Small text description of the habit

3. **Stats Row** (3 columns)
   - Current streak 🔥
   - Longest streak 👑
   - XP reward value ⭐

4. **Action Area**
   - Complete button (if not completed today)
   - "Completed Today" badge (if already completed)
   - Completion message with XP earned

### Responsive Design

- Mobile (< 640px): Single column, stacked layout
- Tablet (640px - 1024px): 2 columns
- Desktop (> 1024px): Full-width cards with proper spacing
- Text sizes scale: `text-xs sm:text-sm` for descriptions, `text-base sm:text-lg` for titles

### Animations

- **Fade-in**: All habit cards animate in on load with 200ms delay
- **Hover**: Cards get subtle shadow on hover
- **Button**: Scale effect on hover + loading spinner during completion
- **Message**: Success/error messages appear below action button

## Integration with Dashboard

The HabitsList has replaced the ClickButton in the main dashboard layout:

**Before:**
```tsx
<div className="flex justify-center sm:col-span-2 lg:col-span-1">
  <ClickButton
    onSuccess={handleClickSuccess}
    onError={handleClickError}
    isAuthenticated={isAuthenticated}
    isAdmin={user?.isAdmin || false}
  />
</div>
```

**After:**
```tsx
<div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
  <HabitsList
    onHabitComplete={fetchUser}    // Refresh user data
    onError={handleClickError}     // Show error toasts
    filter="active"                 // Show only active habits
  />
</div>
```

## User Experience Flow

1. **User sees dashboard** → HabitsList loads with their active habits
2. **User reads habit** → Title, difficulty, streak, and XP value visible
3. **User clicks "Complete Habit"** → Button shows loading state with spinner
4. **System calculates points** → Based on difficulty, streak, and timing
5. **Points awarded** → User's points and level update immediately
6. **Feedback shown** → Green success message: "✓ Completed! +X XP"
7. **Habit marked complete** → Button changes to "✓ Completed Today" badge
8. **Parent refreshes** → Dashboard fetches fresh user data

## Error Handling

The component handles several error scenarios:

1. **Not authenticated**
   - Message: "Please sign in to complete habits"
   - Action: Disables complete button

2. **Already completed today**
   - Message: "Already completed today!"
   - Type: Error (red background)
   - Duration: 3 seconds then disappears

3. **API/State error**
   - Message: Specific error message
   - Type: Error
   - Callback: `onError` prop called for toast notification

4. **Loading state**
   - Shows loading spinner on button
   - Disables button to prevent double-clicks
   - Text: "Completing..."

## Empty States

- **No active habits**: Shows card with "Create your first habit to get started!" + link
- **All completed**: Shows card with "No completed habits yet!" (if filter is 'completed')
- **Error fetching**: Shows error message with specific error text

## Styling Consistency

The component uses the existing design system:
- **Colors**: Tailwind palette with dark mode support
- **Spacing**: Uses `gap-3 sm:gap-4 lg:gap-6` for consistency with dashboard
- **Typography**: Uses `text-sm`, `text-base`, `font-bold` patterns
- **Glass morphism**: Potentially add `backdrop-blur-xl` to cards for consistency
- **Animations**: Uses existing `animate-fade-in` and custom delays

## Future Enhancements

### Planned Features
1. **Drag-and-drop reordering** of habits
2. **Habit filters** by category/difficulty
3. **Detailed analytics** page for habit history
4. **Habit suggestions** based on user profile
5. **Social features** - share streaks with friends
6. **Achievement badges** for milestone streaks
7. **Smart reminders** at optimal times
8. **Habit templates** for quick creation

### API Endpoints Needed
- `POST /api/habits` - Create new habit
- `GET /api/habits` - List user's habits
- `GET /api/habits/:id` - Get habit details
- `PATCH /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Mark habit complete
- `GET /api/habits/history/:id` - Get completion history

## Testing Checklist

- [ ] Habit card displays correctly on mobile, tablet, desktop
- [ ] Complete button triggers without errors
- [ ] Points calculated correctly for all difficulties
- [ ] Streak counter increments properly
- [ ] Habit marks as completed and prevents duplicate completion
- [ ] Error messages appear for validation failures
- [ ] Loading spinner shows during completion
- [ ] Success message shows with correct XP amount
- [ ] User data refreshes after completion
- [ ] Dark mode colors look correct
- [ ] Animations play smoothly
- [ ] Category icons display properly

## Code Organization

```
components/
├── HabitsList.tsx (primary container component)
├── ClickButton.tsx (kept for reference/legacy support)
└── ... other components

hooks/
├── useGameState.ts (state management - used by HabitsList)
└── ... other hooks

lib/
├── data-structures.ts (Habit, HabitCompletion types)
└── ... other utilities

app/
└── page.tsx (dashboard - integrated HabitsList)
```

## Related Files

- **State Management**: `hooks/useGameState.ts` - All state logic
- **Data Structures**: `lib/data-structures.ts` - Type definitions
- **Dashboard**: `app/page.tsx` - Component integration
- **API Client**: `lib/client.ts` - `apiFetch` function
- **Language Support**: `contexts/LanguageContext.tsx` - i18n support

## Troubleshooting

**Habits not loading?**
- Check `useGameState()` is returning habits array
- Verify TypeScript types match `lib/data-structures.ts`
- Check browser console for error messages

**Points not calculating?**
- Verify `calculateHabitPoints()` in `useGameState.ts`
- Check difficulty values match `HABIT_DIFFICULTY_POINTS` constant
- Ensure `isFirstToday` calculation is correct

**Button not responding?**
- Check `user` object is not null
- Verify `completeHabit()` is being called
- Check loading state isn't blocking interaction

**Styling issues?**
- Verify Tailwind CSS is configured correctly
- Check dark mode classes are applied
- Verify animation delays don't conflict
