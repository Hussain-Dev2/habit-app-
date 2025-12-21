'use client';

import { useState } from 'react';
import PointsStatsCard from '@/components/PointsStatsCard';
import AchievementsComponent from '@/components/AchievementsComponent';
import PointsHistoryComponent from '@/components/PointsHistoryComponent';
import HabitAnalyticsDashboard from '@/components/HabitAnalyticsDashboard';
import GoogleAdsense from '@/components/ads/GoogleAdsense';
import { useSession } from 'next-auth/react';

export default function StatsPage() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-orange-50 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">📊</span>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent">
                Statistics & Analytics
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg">Monitor your earnings, habits, and achievements</p>
          </div>


          {/* Tab Navigation */}
          {isAuthenticated && (
            <div className="mb-8 animate-fade-in">
              <div className="flex gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 w-fit">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-gradient-ocean text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-gradient-ocean text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Habit Analytics
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {isAuthenticated ? (
            <div className="animate-fade-in">
              {activeTab === 'overview' ? (
                <>
                  {/* Stats Section */}
                  <div className="mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <PointsStatsCard />
                  </div>

                  {/* Middle Ad Banner */}
                  <div className="my-12 animate-fade-in">
                    <GoogleAdsense 
                      adSlot="1234567890" 
                      adFormat="auto"
                      className="min-h-[250px] bg-gray-100/50 dark:bg-gray-800/50 rounded-lg overflow-hidden"
                    />
                  </div>

                  {/* Achievements and History Grid */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <AchievementsComponent />
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                      <PointsHistoryComponent />
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <HabitAnalyticsDashboard />
                </div>
              )}
            </div>
          ) : (
            <div className="glass backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border-2 border-cyan-300 dark:border-cyan-600 rounded-3xl p-8 text-center animate-fade-in">
              <p className="text-3xl mb-4">🔒</p>
              <p className="text-2xl font-bold mb-3">Sign in to view your stats</p>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Track your performance, view achievements, and see your complete points history!
              </p>
              <a
                href="/login"
                className="inline-block px-8 py-3 bg-gradient-ocean text-white font-semibold rounded-xl hover:shadow-glow transition-all duration-300"
              >
                Sign In / Register
              </a>
            </div>
          )}
        </div>
      </main>
  );
}
