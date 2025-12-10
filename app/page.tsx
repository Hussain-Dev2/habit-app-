'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ClickButton from '@/components/ClickButton';
import UserCard from '@/components/UserCard';
import LevelCard from '@/components/LevelCard';
import Toast from '@/components/Toast';
import ActivitiesPanel from '@/components/ActivitiesPanel';
import RandomAd from '@/components/ads/RandomAd';
import AdsterraRewarded from '@/components/ads/AdsterraRewarded';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import { apiFetch } from '@/lib/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  id: string;
  points: number;
  clicks: number;
  lifetimePoints: number;
}

interface MeResponse {
  user: User;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUser();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchUser = async () => {
    try {
      const data = await apiFetch<MeResponse>('/auth/me');
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setToast({
        message: 'Failed to load user data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClickSuccess = (points: number, clicks: number, milestone: boolean) => {
    setUser((prev) => prev ? { ...prev, points, clicks } : null);
    
    if (milestone) {
      setToast({
        message: `🎉 Milestone reached! ${clicks} clicks!`,
        type: 'info',
      });
      // TODO: Integrate ad SDK here
      // showAdvertisement();
    }
  };

  const handleRewardSuccess = (
    rewardedUser: { id: string; points: number; lifetimePoints: number; clicks: number },
    reward: number,
  ) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            points: rewardedUser.points,
            lifetimePoints: rewardedUser.lifetimePoints,
            clicks: rewardedUser.clicks ?? prev.clicks,
          }
        : {
            id: rewardedUser.id,
            points: rewardedUser.points,
            lifetimePoints: rewardedUser.lifetimePoints,
            clicks: rewardedUser.clicks,
          }
    );

    setToast({
      message: `✅ Rewarded ad complete: +${reward} points`,
      type: 'success',
    });
  };

  const handleRewardError = (message: string) => {
    setToast({ message, type: 'error' });
  };

  const handleClickError = (message: string) => {
    setToast({ message, type: 'error' });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader size="lg" color="cyan" />
          <p className="text-slate-300 text-lg font-semibold">{t.loadingDashboard}</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50/30 to-cyan-100 dark:from-gray-900 dark:via-cyan-950/50 dark:to-orange-950/50 relative overflow-hidden">
        {/* Animated background elements - Modern floating orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-ocean rounded-full mix-blend-normal filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-sunset rounded-full mix-blend-normal filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-gradient-tropical rounded-full mix-blend-normal filter blur-3xl opacity-25 dark:opacity-15 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-aurora rounded-full mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
          {/* Header */}
          <div className="mb-8 sm:mb-10 lg:mb-12 animate-fade-in">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl animate-float">💸</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-aurora bg-clip-text text-transparent animate-gradient">
                {t.dashboard}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg">{t.dashboardSubtitle}</p>
          </div>

          {/* Sponsored rail - randomize slots and variants */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10 animate-fade-in" style={{ animationDelay: '120ms' }}>
            <RandomAd label="Sponsored • Hero" />
            <RandomAd label="Sponsored • Sidebar" />
          </div>

          {/* Main Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-center mb-8 sm:mb-10 lg:mb-12">
            {/* Left: Level Card */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <LevelCard lifetimePoints={user.lifetimePoints || 0} />
            </div>

            {/* Center: User Stats */}
            <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <UserCard points={user.points} clicks={user.clicks} />
            </div>

            {/* Right: Click Button */}
            <div className="flex justify-center sm:col-span-2 lg:col-span-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <ClickButton
                onSuccess={handleClickSuccess}
                onError={handleClickError}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="group glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-cyan-200/50 dark:border-cyan-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 card-lift hover:border-cyan-400 dark:hover:border-cyan-500 transition-all duration-500 hover:shadow-glow">
              <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl animate-pulse-soft">🚀</span>
                <span className="bg-gradient-ocean bg-clip-text text-transparent">Quick Start</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                Click to earn <span className="font-bold text-cyan-600 dark:text-cyan-400">points</span> — build combos for amazing multipliers! ⚡
              </p>
            </div>

            <div className="group glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 card-lift hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-500 hover:shadow-glow-mint">
              <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl animate-pulse-soft">🎯</span>
                <span className="bg-gradient-tropical bg-clip-text text-transparent">Level Up</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                Explore <span className="font-bold text-emerald-600 dark:text-emerald-400">activities</span> to boost earnings and unlock achievements! 🏆
              </p>
            </div>

            <div className="group glass backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 border-orange-200/50 dark:border-orange-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 card-lift hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-500 hover:shadow-glow-coral sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl animate-pulse-soft">🎉</span>
                <span className="bg-gradient-sunset bg-clip-text text-transparent">Rewards</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                Complete tasks and visit the <span className="font-bold text-orange-600 dark:text-orange-400">Store</span> for exclusive items! 🛍️
              </p>
            </div>
          </div>

            {/* Rewarded ad + inline sponsored */}
            <div className="grid lg:grid-cols-[2fr_1fr] gap-4 sm:gap-5 lg:gap-6 my-8 sm:my-10 lg:my-12 animate-fade-in" style={{ animationDelay: '350ms' }}>
              <AdsterraRewarded onReward={handleRewardSuccess} onError={handleRewardError} />
              <RandomAd label="Sponsored • Inline" />
            </div>

          {/* Activities Panel */}
          <div className="my-8 sm:my-10 lg:my-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <ActivitiesPanel onPointsEarned={fetchUser} lifetimePoints={user?.lifetimePoints || 0} />
          </div>

          {/* Footer sponsored slot */}
          <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
            <RandomAd label="Sponsored • Footer" />
          </div>

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