'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import { apiFetch } from '@/lib/client';

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

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<HabitTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      console.log('🔄 Loading templates from API...');
      const data = await apiFetch<HabitTemplate[]>('/templates');
      console.log('✅ Templates loaded:', data.length, 'templates');
      console.log('Templates data:', data);
      setTemplates(data);
    } catch (error) {
      console.error('❌ Failed to load templates:', error);
      setToast({ message: 'Failed to load templates', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (templateId: string) => {
    setApplying(templateId);
    try {
      const result = await apiFetch('/templates', {
        method: 'POST',
        body: JSON.stringify({ templateId })
      });

      const response = result as { message?: string; success?: boolean; habits?: unknown[] };

      setToast({ 
        message: response.message || 'Habits created successfully! 🎉', 
        type: 'success' 
      });

      // Redirect to habits page after 2 seconds
      setTimeout(() => {
        router.push('/habits');
      }, 2000);
    } catch (error) {
      console.error('Failed to apply template:', error);
      setToast({ 
        message: (error as Error).message || 'Failed to create habits', 
        type: 'error' 
      });
    } finally {
      setApplying(null);
    }
  };

  const categories = [
    { id: 'all', name: 'All Packs', icon: '🌟' },
    { id: 'health', name: 'Health', icon: '💪' },
    { id: 'productivity', name: 'Productivity', icon: '📈' },
    { id: 'fitness', name: 'Fitness', icon: '🏋️' },
    { id: 'learning', name: 'Learning', icon: '📚' },
    { id: 'mindfulness', name: 'Mindfulness', icon: '🧘' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const featuredTemplates = filteredTemplates.filter(t => t.featured);
  const regularTemplates = filteredTemplates.filter(t => !t.featured);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎁 Habit Template Packs
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Jump-start your journey with ready-made habit collections. Choose a pack and start building positive habits instantly!
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover-scale ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/50'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Featured Templates */}
          {featuredTemplates.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <span>⭐</span> Featured Packs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTemplates.map(template => (
                  <div
                    key={template.id}
                    className="glass bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border-2 border-yellow-300/50 dark:border-yellow-600/50 hover:shadow-2xl transition-all duration-300 hover-scale"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{template.icon}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>👥</span>
                        <span>{template.usageCount}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {template.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Includes {template.habits.length} habits:
                      </p>
                      {template.habits.slice(0, 3).map((habit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(habit.difficulty)}`}>
                            {habit.difficulty}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 truncate">
                            {habit.name}
                          </span>
                        </div>
                      ))}
                      {template.habits.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          + {template.habits.length - 3} more habits...
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => applyTemplate(template.id)}
                      disabled={applying !== null}
                      className="w-full py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover-scale active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: template.color }}
                    >
                      {applying === template.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader />
                          Creating...
                        </span>
                      ) : (
                        <>🚀 Start This Pack</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Templates */}
          {regularTemplates.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <span>📦</span> All Packs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {regularTemplates.map(template => (
                  <div
                    key={template.id}
                    className="glass bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale"
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                      {template.name.replace(/^[^\s]+\s/, '')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {template.habits.length} habits • {template.usageCount} users
                    </p>
                    <button
                      onClick={() => applyTemplate(template.id)}
                      disabled={applying !== null}
                      className="w-full py-2 rounded-xl font-bold text-white text-sm shadow-md hover:shadow-lg transition-all duration-300 hover-scale active:scale-95 disabled:opacity-50"
                      style={{ background: template.color }}
                    >
                      {applying === template.id ? '⏳' : '🚀'} Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No templates found in this category
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 glass bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <span>💡</span> How it works
            </h3>
            <ul className="space-y-2 text-blue-700 dark:text-blue-400 text-sm">
              <li className="flex items-start gap-2">
                <span>1️⃣</span>
                <span>Choose a template pack that matches your goals</span>
              </li>
              <li className="flex items-start gap-2">
                <span>2️⃣</span>
                <span>Click &quot;Start This Pack&quot; to instantly create all habits</span>
              </li>
              <li className="flex items-start gap-2">
                <span>3️⃣</span>
                <span>All habits will be added to your dashboard - start tracking today!</span>
              </li>
              <li className="flex items-start gap-2">
                <span>4️⃣</span>
                <span>You can customize or delete any habit after creation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ProtectedRoute>
  );
}
