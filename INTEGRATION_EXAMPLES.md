# Integration Guide - Using New Data Structures in Your App

## Overview

This guide shows how to integrate the new `useGameState` hook into your existing components.

---

## 1. Update Dashboard Component (`app/page.tsx`)

### Before (Current Implementation)
```tsx
interface User {
  id: string;
  points: number;
  clicks: number;
  lifetimePoints: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  
  const fetchUser = async () => {
    const data = await apiFetch<MeResponse>('/auth/me');
    setUser(data.user);
  };
  
  // ... manual state management
}
```

### After (Using New Hook)
```tsx
import { useGameState } from '@/hooks/useGameState';
import { User } from '@/lib/data-structures';

export default function Dashboard() {
  const { user, habits, loading, fetchUser } = useGameState();
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  if (loading) return <Loader />;
  if (!user) return <div>Please sign in</div>;
  
  return (
    <div>
      <h1>Points: {user.points}</h1>
      <h2>Level: {user.level}</h2>
      {/* Rest of dashboard */}
    </div>
  );
}
```

---

## 2. Update Click Button Component

### Before (Current)
```tsx
export default function ClickButton({ onSuccess }: Props) {
  const handleClick = async () => {
    const response = await fetch('/api/clicks', { method: 'POST' });
    const data = await response.json();
    onSuccess(data.points, data.clicks, data.lifetimePoints);
  };
  
  return <button onClick={handleClick}>Click!</button>;
}
```

### After (Updated for Habits)
```tsx
import { useGameState } from '@/hooks/useGameState';

interface HabitButtonProps {
  habitId: string;
  onSuccess?: (points: number) => void;
}

export default function HabitButton({ habitId, onSuccess }: HabitButtonProps) {
  const { completeHabit } = useGameState();
  
  const handleComplete = async () => {
    // Call API to complete habit (you'll create this)
    const response = await fetch(`/api/habits/${habitId}/complete`, {
      method: 'POST',
    });
    const data = await response.json();
    
    // Or use local state for demo:
    const completion = completeHabit(habitId);
    if (completion) {
      onSuccess?.(completion.totalPoints);
    }
  };
  
  return (
    <button onClick={handleComplete} className="habit-button">
      ✓ Complete Habit
    </button>
  );
}
```

---

## 3. Create New Habit List Component

### New Component: `components/HabitsList.tsx`
```tsx
'use client';

import { useGameState } from '@/hooks/useGameState';
import { Habit } from '@/lib/data-structures';
import HabitCard from './HabitCard';

interface HabitsListProps {
  filter?: 'active' | 'completed' | 'all';
}

export default function HabitsList({ filter = 'active' }: HabitsListProps) {
  const { habits, loading, error } = useGameState();
  
  if (loading) return <div>Loading habits...</div>;
  if (error) return <div className="error">{error}</div>;
  
  const filtered = habits.filter(h => {
    if (filter === 'active') return h.isActive;
    if (filter === 'completed') return h.completed;
    return true;
  });
  
  if (filtered.length === 0) {
    return <p className="empty">No habits yet. Create your first habit!</p>;
  }
  
  return (
    <div className="habits-grid">
      {filtered.map(habit => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
```

---

## 4. Create Habit Card Component

### New Component: `components/HabitCard.tsx`
```tsx
'use client';

import { Habit, HABIT_DIFFICULTY_POINTS } from '@/lib/data-structures';
import { useGameState } from '@/hooks/useGameState';

interface HabitCardProps {
  habit: Habit;
  onCompleted?: () => void;
}

export default function HabitCard({ habit, onCompleted }: HabitCardProps) {
  const { completeHabit } = useGameState();
  
  const basePoints = HABIT_DIFFICULTY_POINTS[habit.difficulty];
  
  const handleComplete = () => {
    const completion = completeHabit(habit.id);
    if (completion) {
      onCompleted?.();
      // Show toast: "+XXX points!" 
    }
  };
  
  return (
    <div className={`habit-card difficulty-${habit.difficulty}`}>
      {/* Header */}
      <div className="habit-header">
        <h3>{habit.title}</h3>
        <span className={`badge difficulty-${habit.difficulty}`}>
          {habit.difficulty}
        </span>
      </div>
      
      {/* Description */}
      {habit.description && (
        <p className="description">{habit.description}</p>
      )}
      
      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <span className="label">Streak</span>
          <span className="value">🔥 {habit.currentStreak} days</span>
        </div>
        <div className="stat">
          <span className="label">Best</span>
          <span className="value">👑 {habit.longestStreak} days</span>
        </div>
        <div className="stat">
          <span className="label">Points</span>
          <span className="value">⭐ {basePoints} pts</span>
        </div>
      </div>
      
      {/* Status */}
      {habit.completed ? (
        <div className="completed-today">✓ Completed Today</div>
      ) : (
        <button onClick={handleComplete} className="complete-btn">
          Complete Habit
        </button>
      )}
    </div>
  );
}
```

---

## 5. Create Habit Form Component

### New Component: `components/HabitForm.tsx`
```tsx
'use client';

import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import {
  HabitDifficulty,
  HabitCategory,
  HABIT_DIFFICULTY_POINTS,
} from '@/lib/data-structures';

interface HabitFormProps {
  onSuccess?: () => void;
}

export default function HabitForm({ onSuccess }: HabitFormProps) {
  const { addHabit, user } = useGameState();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'fitness' as HabitCategory,
    difficulty: 'medium' as HabitDifficulty,
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in first');
      return;
    }
    
    addHabit({
      userId: user.id,
      ...formData,
      xpValue: HABIT_DIFFICULTY_POINTS[formData.difficulty],
      completed: false,
      currentStreak: 0,
      longestStreak: 0,
      isActive: true,
    });
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'fitness',
      difficulty: 'medium',
      frequency: 'daily',
    });
    
    onSuccess?.();
  };
  
  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <div className="form-group">
        <label>Habit Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          placeholder="e.g., Morning Run"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="e.g., 30-minute jog"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          <select
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value as HabitCategory})}
          >
            <option value="fitness">🏃 Fitness</option>
            <option value="health">🏥 Health</option>
            <option value="learning">📚 Learning</option>
            <option value="productivity">💼 Productivity</option>
            <option value="mindfulness">🧘 Mindfulness</option>
            <option value="social">👥 Social</option>
            <option value="creative">🎨 Creative</option>
            <option value="other">📌 Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={e => setFormData({...formData, difficulty: e.target.value as HabitDifficulty})}
          >
            <option value="easy">🟢 Easy (10 pts)</option>
            <option value="medium">🟡 Medium (25 pts)</option>
            <option value="hard">🔴 Hard (50 pts)</option>
            <option value="extreme">🟣 Extreme (100 pts)</option>
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label>Frequency</label>
        <select
          value={formData.frequency}
          onChange={e => setFormData({...formData, frequency: e.target.value as any})}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      
      <button type="submit" className="submit-btn">
        Create Habit
      </button>
    </form>
  );
}
```

---

## 6. Update Shop Component for Rewards

### Update: `app/shop/page.tsx`
```tsx
import { useGameState } from '@/hooks/useGameState';
import { Reward } from '@/lib/data-structures';

export default function Shop() {
  const { rewards, user, purchaseReward } = useGameState();
  
  const handlePurchase = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward) return;
    if (!user || user.points < reward.costPoints) {
      alert('Not enough points!');
      return;
    }
    
    const success = purchaseReward(rewardId);
    if (success) {
      alert(`Purchased ${reward.title}!`);
    }
  };
  
  return (
    <div className="shop">
      <h1>Rewards Shop</h1>
      <p>Your Points: {user?.points || 0}</p>
      
      <div className="rewards-grid">
        {rewards.map(reward => (
          <div key={reward.id} className="reward-card">
            {reward.imageUrl && <img src={reward.imageUrl} alt={reward.title} />}
            <h3>{reward.title}</h3>
            <p>{reward.description}</p>
            <p className="cost">💰 {reward.costPoints} points</p>
            
            {reward.stock !== null && (
              <p className="stock">Stock: {reward.stock}</p>
            )}
            
            <button
              onClick={() => handlePurchase(reward.id)}
              disabled={!user || user.points < reward.costPoints}
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Create Habits Page

### New Page: `app/habits/page.tsx`
```tsx
'use client';

import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import HabitsList from '@/components/HabitsList';
import HabitForm from '@/components/HabitForm';

export default function HabitsPage() {
  const { user } = useGameState();
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="habits-page">
      <div className="header">
        <h1>📋 My Habits</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Habit'}
        </button>
      </div>
      
      {showForm && (
        <div className="form-section">
          <HabitForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
      
      <HabitsList filter="active" />
    </div>
  );
}
```

---

## 8. Update Main Dashboard

### Update: `app/page.tsx` Main Section
```tsx
import HabitsList from '@/components/HabitsList';
import { useGameState } from '@/hooks/useGameState';

export default function Dashboard() {
  const { user, habits, rewards, loading } = useGameState();
  
  if (loading) return <Loader />;
  if (!user) return <ProtectedRoute />;
  
  const habitsCompletedToday = habits.filter(h => h.completed).length;
  const totalHabits = habits.filter(h => h.isActive).length;
  
  return (
    <div className="dashboard">
      {/* Header Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Points</h3>
          <p className="big">{user.points.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Level</h3>
          <p className="big">{user.level}</p>
        </div>
        <div className="stat-card">
          <h3>Habits Today</h3>
          <p className="big">{habitsCompletedToday}/{totalHabits}</p>
        </div>
      </div>
      
      {/* Habits Section */}
      <section className="habits-section">
        <div className="section-header">
          <h2>🎯 Today's Habits</h2>
          <a href="/habits">View All</a>
        </div>
        <HabitsList filter="active" />
      </section>
      
      {/* Shop Preview */}
      <section className="shop-section">
        <div className="section-header">
          <h2>🎁 Rewards Shop</h2>
          <a href="/shop">Shop Now</a>
        </div>
        <div className="rewards-preview">
          {rewards.slice(0, 3).map(reward => (
            <div key={reward.id} className="reward-preview">
              <h4>{reward.title}</h4>
              <p>{reward.costPoints} pts</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## 9. Update User Card Component

### Update: `components/UserCard.tsx`
```tsx
import { useGameState } from '@/hooks/useGameState';

export default function UserCard() {
  const { user } = useGameState();
  
  if (!user) return null;
  
  return (
    <div className="user-card">
      <div className="points-section">
        <p className="label">💰 Points</p>
        <p className="value">{user.points.toLocaleString()}</p>
      </div>
      
      <div className="level-section">
        <p className="label">🎯 Level</p>
        <p className="value">{user.level}</p>
      </div>
      
      <div className="lifetime-section">
        <p className="label">⭐ Lifetime Earned</p>
        <p className="value">{user.lifetimePoints.toLocaleString()}</p>
      </div>
      
      {user.isAdmin && (
        <div className="admin-badge">👑 Admin</div>
      )}
    </div>
  );
}
```

---

## 10. Type Safety - Import in Components

### Best Practice:
```tsx
// Always import from data-structures
import {
  User,
  Reward,
  Habit,
  HabitCompletion,
  HabitDifficulty,
  HabitCategory,
  HABIT_DIFFICULTY_POINTS,
} from '@/lib/data-structures';

import { useGameState } from '@/hooks/useGameState';

// Now fully typed:
const { user, habits }: { user: User | null; habits: Habit[] } = useGameState();
```

---

## Summary of Changes

| File | Change | Status |
|------|--------|--------|
| `app/page.tsx` | Use `useGameState()` | Update |
| `components/ClickButton.tsx` | Rename to `HabitButton.tsx` | Rename |
| `components/HabitsList.tsx` | Create new | New |
| `components/HabitCard.tsx` | Create new | New |
| `components/HabitForm.tsx` | Create new | New |
| `components/UserCard.tsx` | Use `useGameState()` | Update |
| `app/shop/page.tsx` | Use Reward instead of Product | Update |
| `app/habits/page.tsx` | Create new | New |
| `app/habit/[id]/page.tsx` | Create new | New |

---

## Testing Your Integration

```tsx
// Test in a component:
import { useGameState } from '@/hooks/useGameState';

export function TestComponent() {
  const { user, habits, addPoints, completeHabit } = useGameState();
  
  return (
    <div>
      <h3>Test useGameState()</h3>
      <p>User: {user?.email}</p>
      <p>Habits: {habits.length}</p>
      <button onClick={() => addPoints(50)}>+50 Points</button>
      <button onClick={() => completeHabit(habits[0]?.id)}>
        Complete First Habit
      </button>
    </div>
  );
}
```

---

## Next Steps

1. ✅ Review these examples
2. ✅ Create the components mentioned
3. ✅ Update existing components
4. ⏭️ Create API routes (Phase 2)
5. ⏭️ Update database schema (Phase 2)
