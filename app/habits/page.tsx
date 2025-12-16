'use client';

/**
 * Habits Dashboard Page
 * 
 * Main page for users to view, create, and manage habits
 * Optimized for performance and UX
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/client';
import Toast from '@/components/Toast';
import Loader from '@/components/Loader';
import Link from 'next/link';
import { HABIT_CATEGORIES, HABIT_ICONS, HABIT_DIFFICULTY_REWARDS, DIFFICULTY_COLORS } from '@/lib/habit-constants';

// Lazy load heavy components
const CreateHabitForm = dynamic(() => Promise.resolve(CreateHabitFormComponent), { 
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-64"></div>
});

interface Habit {
  id: string;
  name: string;
  description: string | null;
  icon?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard' | 'epic';
  streak: number;
  maxStreak?: number;
  totalCompleted?: number;
  isCompleted: boolean;
  lastCompletedAt?: string;
  freezeCount: number;
  isCurrentlyFrozen: boolean;
}

interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  todayCompletions: number;
  weekCompletions: number;
  longestStreak: number;
  habitsCompleted: number;
}

interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  featured: boolean;
  usageCount: number;
  habits: Array<{
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    targetDays: number[];
  }>;
}

// Memoized Habit Card Component
const HabitCard = ({ 
  habit, 
  onComplete, 
  isCompleting,
  onUseFreeze,
  onBuyFreeze,
  onDelete,
  onEdit
}: { 
  habit: Habit; 
  onComplete: (id: string) => void; 
  isCompleting: boolean;
  onUseFreeze: (id: string) => void;
  onBuyFreeze: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
}) => {
  const colors = DIFFICULTY_COLORS[habit.difficulty] || DIFFICULTY_COLORS.easy;
  const xpReward = HABIT_DIFFICULTY_REWARDS[habit.difficulty] || 0;

  return (
    <div
      className={`glass-card glass-hover border-2 ${
        habit.isCompleted
          ? 'bg-green-50/80 dark:bg-green-900/30 border-green-300/50 dark:border-green-700/50'
          : 'border-white/40 dark:border-gray-700/40'
      }`}
    >
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white truncate tracking-tight">{habit.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(habit)}
                className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Edit Habit"
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this habit?')) {
                    onDelete(habit.id);
                  }
                }}
                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete Habit"
              >
                🗑️
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-medium">{habit.category || 'General'}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap flex-shrink-0 ${colors.bg} ${colors.text} ${colors.border || ''} border`}>
          {colors.label} ({xpReward} XP)
        </span>
      </div>

      {habit.totalCompleted !== undefined && (
        <div className="mb-4 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">✅ {habit.totalCompleted}</span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">🏆 {habit.maxStreak || 0} max</span>
          {habit.freezeCount > 0 && (
            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">
              🧊 {habit.freezeCount}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mb-5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
        <span className="text-2xl sm:text-3xl flex-shrink-0 filter drop-shadow-md">🔥</span>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-bold text-orange-600 dark:text-orange-400 text-base">{habit.streak} day streak</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              style={{ width: `${Math.min((habit.streak / 30) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {habit.freezeCount > 0 && !habit.isCompleted && !habit.isCurrentlyFrozen && (
          <button
            onClick={() => onUseFreeze(habit.id)}
            disabled={habit.isCompleted || isCompleting}
            className="flex-1 min-w-[120px] py-3 rounded-xl font-bold transition-all duration-300 text-sm bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🧊 Use Freeze
          </button>
        )}
        {!habit.isCompleted && (
          <button
            onClick={() => onBuyFreeze(habit.id)}
            disabled={isCompleting || habit.freezeCount >= 1}
            className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 text-sm ${
              habit.freezeCount >= 1 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                : 'bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={habit.freezeCount >= 1 ? "You already have a freeze" : "Buy Streak Freeze - 50 points"}
          >
            {habit.freezeCount >= 1 ? '🧊 Owned' : '+ 🧊'}
          </button>
        )}
        <button
          onClick={() => onComplete(habit.id)}
          disabled={habit.isCompleted || isCompleting}
          className={`flex-1 min-w-[120px] py-3 rounded-xl font-bold transition-all duration-300 text-sm shadow-md hover:-translate-y-0.5 ${
            habit.isCompleted
              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 cursor-not-allowed border border-green-200 dark:border-green-800'
              : 'bg-gradient-ocean text-white hover:shadow-glow active:scale-95 disabled:opacity-50'
          }`}
        >
          {isCompleting ? '⏳ Completing...' : habit.isCompleted ? '✓ Completed' : 'Complete Now'}
        </button>
      </div>
    </div>
  );
};

// Create Habit Form Component
function CreateHabitFormComponent({ onSuccess, initialData, isEditing = false }: { onSuccess: () => void; initialData?: any; isEditing?: boolean }) {
  const [formData, setFormData] = useState({ 
    name: initialData?.name || '', 
    difficulty: initialData?.difficulty || 'easy', 
    category: initialData?.category || 'Health' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setToast({ message: 'Please enter a habit name', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditing ? '/api/habits/update' : '/api/habits/create';
      const body = isEditing 
        ? JSON.stringify({ habitId: initialData.id, data: formData })
        : JSON.stringify(formData);

      await apiFetch(url, {
        method: 'POST',
        body,
      });

      setToast({ message: `✅ Habit ${isEditing ? 'updated' : 'created'}!`, type: 'success' });
      if (!isEditing) {
        setFormData({ name: '', difficulty: 'easy', category: 'Health' });
      }
      onSuccess();
    } catch (error: any) {
      setToast({ message: error.message || `Failed to ${isEditing ? 'update' : 'create'}`, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 flex items-center justify-between">
        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Need inspiration?</span>
        <Link href="/templates" className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 hover:underline">
          Browse Templates →
        </Link>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Habit Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Morning Exercise"
          className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium placeholder:text-gray-400"
          disabled={submitting}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="easy">Easy ({HABIT_DIFFICULTY_REWARDS.easy} XP)</option>
            <option value="medium">Medium ({HABIT_DIFFICULTY_REWARDS.medium} XP)</option>
            <option value="hard">Hard ({HABIT_DIFFICULTY_REWARDS.hard} XP)</option>
            <option value="very_hard">Expert ({HABIT_DIFFICULTY_REWARDS.very_hard} XP)</option>
            <option value="epic">Epic ({HABIT_DIFFICULTY_REWARDS.epic} XP)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium appearance-none cursor-pointer"
          >
            {HABIT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-ocean text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-glow hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 mt-2"
      >
        {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Habit' : 'Create Habit')}
      </button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  );
}

export default function HabitsPage() {
  const { status } = useSession();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [featuredTemplates, setFeaturedTemplates] = useState<HabitTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await apiFetch('/habits/delete', {
        method: 'POST',
        body: JSON.stringify({ habitId }),
      });
      setToast({ message: '🗑️ Habit deleted', type: 'success' });
      fetchHabits();
      fetchStats();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete', type: 'error' });
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowCreateForm(true);
  };

  const fetchHabits = useCallback(async () => {
    try {
      const data = await apiFetch<{ habits: Habit[] }>('/habits/list');
      setHabits(data.habits || []);
    } catch (error) {
      setToast({ message: 'Failed to load habits', type: 'error' });
      console.error('Error fetching habits:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiFetch<HabitStats>('/habits/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await apiFetch<HabitTemplate[]>('/templates');
      // Sort by featured and take first 3
      const featured = data.filter(t => t.featured).slice(0, 3);
      setFeaturedTemplates(featured.length > 0 ? featured : data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      Promise.all([fetchHabits(), fetchStats(), fetchTemplates()]).finally(() => setLoading(false));
    }
  }, [status, fetchHabits, fetchStats, fetchTemplates]);

  const applyTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      await apiFetch('/templates', {
        method: 'POST',
        body: JSON.stringify({ templateId }),
      });
      setToast({ message: '✅ Template applied!', type: 'success' });
      await Promise.all([fetchHabits(), fetchStats()]);
    } catch (error) {
      setToast({ message: 'Failed to apply template', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteHabit = useCallback(async (habitId: string) => {
    if (completingHabit) return;

    // 1. Optimistic Update
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;

    const originalHabit = habits[habitIndex];
    const optimisticHabit = {
      ...originalHabit,
      isCompleted: true,
      streak: originalHabit.streak + 1,
      totalCompleted: (originalHabit.totalCompleted || 0) + 1,
      lastCompletedAt: new Date().toISOString(),
    };

    // Update local state immediately
    setHabits(prev => {
      const newHabits = [...prev];
      newHabits[habitIndex] = optimisticHabit;
      return newHabits;
    });

    setCompletingHabit(habitId);

    try {
      const response = await apiFetch<any>('/habits/complete', {
        method: 'POST',
        body: JSON.stringify({ habitId }),
      });

      // 2. Handle Success & Critical Hit
      const isCritical = response.isCritical;
      const xpEarned = response.pointsEarned;
      const newAchievements = response.newAchievements || [];
      
      let message = isCritical 
          ? `🔥 CRITICAL SUCCESS! Double XP! +${xpEarned} XP!` 
          : `✅ +${xpEarned} XP!${response.leveledUp ? ' 🎉 Level Up!' : ''}`;

      if (newAchievements.length > 0) {
        message += ` 🏆 ${newAchievements.length} Achievement(s) Unlocked!`;
      }
      
      setToast({
        message,
        type: 'success',
      });

      // Update stats in background
      fetchStats();
      
      // If leveled up, we might want to refresh everything to be safe
      if (response.leveledUp) {
        fetchHabits();
      }

    } catch (error: any) {
      // 3. Rollback on Error
      setHabits(prev => {
        const newHabits = [...prev];
        newHabits[habitIndex] = originalHabit;
        return newHabits;
      });
      
      setToast({ message: error.message || 'Failed to complete habit', type: 'error' });
    } finally {
      setCompletingHabit(null);
    }
  }, [completingHabit, habits, fetchHabits, fetchStats]);

  const handleUseFreeze = useCallback(async (habitId: string) => {
    if (completingHabit) return;

    setCompletingHabit(habitId);
    try {
      const response = await apiFetch<any>('/habits/freeze-streak', {
        method: 'POST',
        body: JSON.stringify({ habitId }),
      });

      setToast({
        message: response.message || '✨ Streak saved!',
        type: 'success',
      });

      await Promise.all([fetchHabits(), fetchStats()]);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to use freeze', type: 'error' });
    } finally {
      setCompletingHabit(null);
    }
  }, [completingHabit, fetchHabits, fetchStats]);

  const handleBuyFreeze = useCallback(async (habitId: string) => {
    if (completingHabit) return;

    setCompletingHabit(habitId);
    try {
      const response = await apiFetch<any>('/habits/buy-freeze', {
        method: 'POST',
        body: JSON.stringify({ habitId }),
      });

      setToast({
        message: response.message || '🧊 Freeze purchased!',
        type: 'success',
      });

      await Promise.all([fetchHabits(), fetchStats()]);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to buy freeze', type: 'error' });
    } finally {
      setCompletingHabit(null);
    }
  }, [completingHabit, fetchHabits, fetchStats]);

  const completedCount = useMemo(() => habits.filter(h => h.isCompleted).length, [habits]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <Loader size="lg" color="cyan" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-3 sm:px-4 md:px-6 py-3 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with improved styling - Responsive */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <div className="flex items-start gap-2 sm:gap-3 mb-2">
              <span className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">📌</span>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-aurora bg-clip-text text-transparent break-words">
                  My Habits
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {completedCount} of {habits.length} completed today
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid - Responsive for all sizes */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 animate-fade-in">
              {[
                { label: 'Total', value: stats.totalHabits, icon: '📌', color: 'blue' },
                { label: 'Today', value: stats.todayCompletions, icon: '✅', color: 'green' },
                { label: 'Best Streak', value: stats.longestStreak, icon: '🔥', color: 'orange' },
                { label: 'This Week', value: stats.weekCompletions, icon: '📊', color: 'purple' },
                { label: 'Completed', value: stats.habitsCompleted, icon: '⭐', color: 'pink' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="glass-card glass-hover border border-white/40 dark:border-gray-700/40 p-4 sm:p-5"
                >
                  <div className="text-2xl sm:text-3xl mb-2 filter drop-shadow-sm">{stat.icon}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Create Habit Section - Responsive */}
          <div className="mb-8 animate-fade-in">
            {!showCreateForm ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex-1 bg-gradient-ocean text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-glow hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">+</span> Create New Habit
                </button>
                <Link
                  href="/templates"
                  className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-purple-200 dark:border-purple-900/50 px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-700 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">✨</span> Browse Templates
                </Link>
              </div>
            ) : (
              <div className="glass-card border border-blue-200/50 dark:border-blue-700/50 animate-fade-in p-6 sm:p-8">
                <h3 className="font-black text-2xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                </h3>
                <CreateHabitForm
                  onSuccess={async () => {
                    setShowCreateForm(false);
                    setEditingHabit(null);
                    await Promise.all([fetchHabits(), fetchStats()]);
                  }}
                  initialData={editingHabit}
                  isEditing={!!editingHabit}
                />
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingHabit(null);
                  }}
                  className="w-full mt-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Featured Templates Section */}
          {!showCreateForm && featuredTemplates.length > 0 && (
            <div className="mb-6 sm:mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Popular Templates</h3>
                <Link href="/templates" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {featuredTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:scale-110 transition-transform">
                        {template.icon}
                      </span>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{template.habits.length} habits</p>
                      </div>
                    </div>
                    <button
                      onClick={() => applyTemplate(template.id)}
                      className="w-full py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      Add Pack +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habits Grid - Responsive */}
          <div className="animate-fade-in">
            {habits.length === 0 ? (
              <div className="glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-lg sm:rounded-xl p-6 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📌</div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">No Habits Yet</h3>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Create your first habit to start earning XP!</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-block bg-gradient-ocean text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:shadow-glow transition-all text-sm sm:text-base"
                >
                  🎯 Create First Habit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onComplete={handleCompleteHabit}
                    isCompleting={completingHabit === habit.id}
                    onUseFreeze={handleUseFreeze}
                    onBuyFreeze={handleBuyFreeze}
                    onDelete={handleDeleteHabit}
                    onEdit={handleEditHabit}
                  />
                ))}
              </div>
            )}
          </div>

          {/* CTA Cards - Responsive Grid */}
          {habits.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-12 animate-fade-in">
              <Link href="/habit-analytics" className="glass backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-glow transition-all duration-300">
                <h3 className="font-bold text-sm sm:text-lg flex items-center gap-2 mb-1 sm:mb-2">
                  <span className="text-lg sm:text-xl">📊</span>
                  <span>Analytics</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Daily, weekly & monthly tracking</p>
              </Link>

              <Link href="/stats" className="glass backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-cyan-300 dark:border-cyan-600 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-glow transition-all duration-300">
                <h3 className="font-bold text-sm sm:text-lg flex items-center gap-2 mb-1 sm:mb-2">
                  <span className="text-lg sm:text-xl">📈</span>
                  <span>Stats</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Track progress & achievements</p>
              </Link>

              <Link href="/shop" className="glass backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-emerald-300 dark:border-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-glow transition-all duration-300">
                <h3 className="font-bold text-sm sm:text-lg flex items-center gap-2 mb-1 sm:mb-2">
                  <span className="text-lg sm:text-xl">🛍️</span>
                  <span>Rewards</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Redeem XP for rewards</p>
              </Link>
            </div>
          )}

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
