'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiFetch } from '@/lib/client';
import AdminRecommendationManager from '@/components/AdminRecommendationManager';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  category: 'Book' | 'Course';
}

export default function RecommendationsPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const isAdmin = session?.user?.email && (session.user as any).isAdmin; // Assuming isAdmin is available
  
  // Note: For cleaner code, we fetch public recommendations here for normal users
  // Admins manage them in the component. 
  // Ideally, we might want to share state or refetch, but simplicity first.
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'books' | 'courses'>('books');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      fetchRecommendations();
    } else {
        setLoading(false); // Admin manages their own data in the sub-component
    }
  }, [isAdmin]);

  const fetchRecommendations = async () => {
    try {
      const data = await apiFetch<Recommendation[]>('/recommendations');
      setRecommendations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter(
    r => (activeTab === 'books' && r.category === 'Book') || (activeTab === 'courses' && r.category === 'Course')
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-orange-50 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements (copied from Stats page) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">🎯</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent">
              {t.recommendationsTitle || 'Recommended for You'}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            {t.recommendationsDesc || 'Curated books and courses to boost your growth'}
          </p>
        </div>

        {isAdmin ? (
            // Admin View
            <div className="animate-fade-in">
                <AdminRecommendationManager />
            </div>
        ) : (
            // User View
            <>
                {/* Tab Navigation */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 w-fit">
                        <button
                        onClick={() => setActiveTab('books')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                            activeTab === 'books'
                            ? 'bg-gradient-ocean text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        >
                        📚 {t.books || 'Books'}
                        </button>
                        <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                            activeTab === 'courses'
                            ? 'bg-gradient-ocean text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        >
                        🎓 {t.courses || 'Courses'}
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading...</div>
                ) : filteredRecommendations.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-white/30 dark:bg-black/20 rounded-xl backdrop-blur">
                        <p>No recommendations found in this category yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {filteredRecommendations.map((rec) => (
                            <div key={rec.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="h-48 overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                                    {rec.imageUrl ? (
                                        <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                            {rec.category === 'Book' ? '📚' : '🎓'}
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur rounded px-2 py-1 text-xs font-bold text-white uppercase">
                                        {rec.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white line-clamp-1">{rec.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 h-14">
                                        {rec.description}
                                    </p>
                                    {rec.url && (
                                        <a 
                                            href={rec.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="block w-full py-2.5 text-center bg-gradient-ocean text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                                        >
                                            {t.learnMore || 'Learn More'} →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </div>
    </main>
  );
}
