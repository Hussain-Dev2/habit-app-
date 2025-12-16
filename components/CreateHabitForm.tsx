'use client';

/**
 * CreateHabitForm Component
 * 
 * Modal/Form for creating a new habit with validation
 */

import { useState } from 'react';
import { HABIT_CATEGORIES, HABIT_ICONS, HABIT_DIFFICULTY_REWARDS } from '@/lib/habit-constants';

interface CreateHabitFormProps {
  onSuccess: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function CreateHabitForm({ onSuccess, initialData, isEditing = false }: CreateHabitFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    difficulty: initialData?.difficulty || 'medium',
    category: initialData?.category || 'other',
    icon: initialData?.icon || '📌',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? '/api/habits/update' : '/api/habits/create';
      const body = isEditing 
        ? JSON.stringify({ habitId: initialData.id, data: formData })
        : JSON.stringify(formData);

      const res = await fetch(url, {
        method: 'POST',
        body,
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || `Failed to ${isEditing ? 'update' : 'create'} habit`);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {isEditing ? 'Edit Habit' : 'Create New Habit'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Habit Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Morning Exercise"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Why is this habit important?"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Difficulty *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  difficulty: e.target.value as any,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="easy">Easy ({HABIT_DIFFICULTY_REWARDS.easy} XP)</option>
              <option value="medium">Medium ({HABIT_DIFFICULTY_REWARDS.medium} XP)</option>
              <option value="hard">Hard ({HABIT_DIFFICULTY_REWARDS.hard} XP)</option>
              <option value="very_hard">Expert ({HABIT_DIFFICULTY_REWARDS.very_hard} XP)</option>
              <option value="epic">Epic ({HABIT_DIFFICULTY_REWARDS.epic} XP)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              {HABIT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-2">
            {Object.entries(HABIT_ICONS).map(([key, icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={`p-2 rounded text-2xl transition-all ${
                  formData.icon === icon
                    ? 'bg-blue-200 dark:bg-blue-700 ring-2 ring-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.name}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Creating...' : '✓ Create Habit'}
          </button>
        </div>
      </form>
    </div>
  );
}
