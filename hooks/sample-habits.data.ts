/**
 * Sample Habits Data for Testing
 * 
 * Add these to your useGameState hook's initial state to see the HabitsList in action.
 * 
 * Usage:
 * 1. Copy the SAMPLE_HABITS array
 * 2. Add to useGameState initial state: const [habits, setHabits] = useState(SAMPLE_HABITS);
 * 3. Refresh page to see habits displayed in HabitsList component
 * 4. Click "Complete Habit" to test point calculation and streak tracking
 */

import { Habit, HabitCompletion } from '@/lib/data-structures';

export const SAMPLE_HABITS: Habit[] = [
  {
    id: 'habit-1',
    userId: 'user-1',
    title: '30 Min Run',
    description: 'Go for a 30-minute run in the morning',
    category: 'fitness',
    difficulty: 'medium',
    xpValue: 25,
    frequency: 'daily',
    completed: false,
    completedAt: null,
    currentStreak: 12,
    longestStreak: 45,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: 'habit-2',
    userId: 'user-1',
    title: 'Morning Meditation',
    description: 'Mindfulness meditation for 15 minutes',
    category: 'mindfulness',
    difficulty: 'easy',
    xpValue: 10,
    frequency: 'daily',
    completed: false,
    completedAt: null,
    currentStreak: 28,
    longestStreak: 28,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: 'habit-3',
    userId: 'user-1',
    title: 'Read 30 Pages',
    description: 'Read at least 30 pages of a book',
    category: 'learning',
    difficulty: 'medium',
    xpValue: 25,
    frequency: 'daily',
    completed: false,
    completedAt: null,
    currentStreak: 5,
    longestStreak: 15,
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: 'habit-4',
    userId: 'user-1',
    title: 'Complete Project Task',
    description: 'Work on and complete a project task',
    category: 'productivity',
    difficulty: 'hard',
    xpValue: 50,
    frequency: 'daily',
    completed: false,
    completedAt: null,
    currentStreak: 8,
    longestStreak: 22,
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: 'habit-5',
    userId: 'user-1',
    title: 'Master Algorithm',
    description: 'Study and master a complex algorithm',
    category: 'learning',
    difficulty: 'extreme',
    xpValue: 100,
    frequency: 'daily',
    completed: false,
    completedAt: null,
    currentStreak: 3,
    longestStreak: 10,
    isActive: true,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: 'habit-6',
    userId: 'user-1',
    title: 'Drink Water (8 glasses)',
    description: 'Stay hydrated by drinking 8 glasses of water',
    category: 'health',
    difficulty: 'easy',
    xpValue: 10,
    frequency: 'daily',
    completed: false,
    completedAt: null,
    currentStreak: 42,
    longestStreak: 42,
    isActive: true,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: 'habit-7',
    userId: 'user-1',
    title: 'Creative Writing',
    description: 'Write 500 words in a personal journal or story',
    category: 'creative',
    difficulty: 'hard',
    xpValue: 50,
    frequency: 'daily',
    completed: false,
    completedAt: null,
    currentStreak: 1,
    longestStreak: 7,
    isActive: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: 'habit-8',
    userId: 'user-1',
    title: 'Call a Friend',
    description: 'Have a meaningful conversation with someone you care about',
    category: 'social',
    difficulty: 'easy',
    xpValue: 10,
    frequency: 'daily',
    completed: false,
    completedAt: null,
    currentStreak: 6,
    longestStreak: 14,
    isActive: true,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-27'),
  },
];

/**
 * Integration Instructions
 * 
 * STEP 1: Backup current useGameState.ts
 * cp hooks/useGameState.ts hooks/useGameState.ts.backup
 * 
 * STEP 2: Update useGameState.ts initial state
 * 
 * Find this line:
 *   const [habits, setHabits] = useState<Habit[]>([]);
 * 
 * Replace with:
 *   const [habits, setHabits] = useState<Habit[]>(SAMPLE_HABITS);
 * 
 * STEP 3: Import sample data at top of useGameState.ts
 *   import { SAMPLE_HABITS } from './sample-habits.data';
 * 
 * STEP 4: Refresh your browser
 * 
 * STEP 5: Test the habits system
 *   - See 8 different habit cards with various difficulties
 *   - Click "Complete Habit" to test XP calculation
 *   - Watch points update in real-time
 *   - See streak counter increase
 * 
 * EXPECTED XP VALUES (based on difficulty):
 * - Easy habit: 10 XP base
 * - Medium habit: 25 XP base  
 * - Hard habit: 50 XP base
 * - Extreme habit: 100 XP base
 * 
 * Plus bonuses:
 * - Streak bonus: +5% per day of current streak
 * - First completion today: +20% bonus
 * 
 * EXAMPLE REWARDS:
 * - Easy (10 XP) with 28 day streak (first time today):
 *   10 + (10 * 0.28 * 0.05) + (10 * 0.2) = 10 + 1 + 2 = 13 XP
 * 
 * - Medium (25 XP) with 5 day streak:
 *   25 + (25 * 0.05 * 0.05) + 0 = 25 + 0 + 0 = ~25 XP
 * 
 * - Hard (50 XP) with 8 day streak (first time today):
 *   50 + (50 * 0.08 * 0.05) + (50 * 0.2) = 50 + 2 + 10 = 62 XP
 * 
 * - Extreme (100 XP) with 3 day streak (first time today):
 *   100 + (100 * 0.03 * 0.05) + (100 * 0.2) = 100 + 1 + 20 = 121 XP
 */

/**
 * Testing Checklist
 * 
 * After adding SAMPLE_HABITS:
 * 
 * VISUAL TESTS:
 * [ ] All 8 habits appear as cards on the dashboard
 * [ ] Colors match difficulty:
 *     [ ] Easy = green (meditation, water, call friend)
 *     [ ] Medium = yellow (run, read pages)
 *     [ ] Hard = red (project, writing)
 *     [ ] Extreme = purple (algorithm)
 * [ ] Category icons show correctly:
 *     [ ] 🏃 Fitness (run)
 *     [ ] 🧘 Mindfulness (meditation)
 *     [ ] 📚 Learning (read, algorithm)
 *     [ ] 💼 Productivity (project)
 *     [ ] 🏥 Health (water)
 *     [ ] 🎨 Creative (writing)
 *     [ ] 👥 Social (call friend)
 * [ ] Stats show: Current Streak, Best Streak, XP Value
 * [ ] Complete button appears for each habit
 * 
 * INTERACTION TESTS:
 * [ ] Click "Complete Habit" on easy habit (10 XP)
 * [ ] Success message appears with XP total
 * [ ] Habit card updates to "Completed Today" badge
 * [ ] User points increase in UserCard
 * [ ] Refresh page - points persist if using backend
 * 
 * STREAK TESTS:
 * [ ] Meditation has 28 day streak - highest on screen
 * [ ] Run has 12 day streak
 * [ ] Check that streak bonuses apply correctly
 * 
 * ERROR TESTS:
 * [ ] Click complete on already-completed habit
 * [ ] See "Already completed today!" message
 * [ ] Button still shows disabled state
 * 
 * RESPONSIVE TESTS:
 * [ ] View on mobile (< 600px) - single column
 * [ ] View on tablet (600-1200px) - check spacing
 * [ ] View on desktop (> 1200px) - 3-column layout
 * [ ] Check text sizes scale properly
 * 
 * DARK MODE TESTS:
 * [ ] Toggle dark mode
 * [ ] Habit cards still readable
 * [ ] Colors still match difficulty scheme
 * [ ] Background colors adjust properly
 */

/**
 * File Location
 * 
 * This file should be saved as:
 * hooks/sample-habits.data.ts
 * 
 * Then imported in hooks/useGameState.ts:
 * import { SAMPLE_HABITS } from './sample-habits.data';
 */
