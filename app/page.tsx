'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ClickButton from '@/components/ClickButton';
import UserCard from '@/components/UserCard';
import LevelCard from '@/components/LevelCard';
import Toast from '@/components/Toast';
import ActivitiesPanel from '@/components/ActivitiesPanel';
import ProtectedRoute from '@/components/ProtectedRoute';
import { GoogleAdSense, AdsterraAd, RewardedAdButton, AdContainer } from '@/components/ads';
import { apiFetch } from '@/lib/client';

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

  const handleClickError = (message: string) => {
    setToast({ message, type: 'error' });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">⚡</span>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                ClickerPro Dashboard
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg">Start your clicking journey and earn amazing rewards</p>
          </div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-3 gap-8 items-center mb-12">
            {/* Left: Level Card */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <LevelCard lifetimePoints={user.lifetimePoints || 0} />
            </div>

            {/* Center: User Stats */}
            <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <UserCard points={user.points} clicks={user.clicks} />
            </div>

            {/* Right: Click Button */}
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
              <ClickButton
                onSuccess={handleClickSuccess}
                onError={handleClickError}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="grid md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-6 hover:border-blue-300/50 dark:hover:border-white/40 transition-all duration-300 hover:shadow-xl">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Tips</span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                Click the button to earn <span className="font-bold text-yellow-600 dark:text-yellow-400">1 point</span> per click. Build combos for multipliers!
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-6 hover:border-blue-300/50 dark:hover:border-white/40 transition-all duration-300 hover:shadow-xl">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <span className="text-2xl">📈</span>
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Growth</span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                Try <span className="font-bold text-green-600 dark:text-green-400">multiple activities</span> to earn faster and unlock achievements!
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl p-6 hover:border-blue-300/50 dark:hover:border-white/40 transition-all duration-300 hover:shadow-xl">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <span className="text-2xl">🎁</span>
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Rewards</span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                Complete activities and visit the <span className="font-bold text-pink-600 dark:text-pink-400">Shop</span> to buy exclusive items!
              </p>
            </div>
          </div>

          {/* Activities Panel */}
          <div className="my-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <ActivitiesPanel />
          </div>

          {/* Ad Section */}
          <div className="my-12 animate-fade-in" style={{ animationDelay: '450ms' }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-3xl">📺</span>
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Earn More Points with Ads</span>
              </h2>
              
              {/* Rewarded Ad Button */}
              <div className="backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-green-200/50 dark:border-white/20 rounded-2xl p-6 mb-6">
                <p className="text-slate-700 dark:text-slate-300 mb-4">Watch advertisements to earn bonus points:</p>
                <RewardedAdButton 
                  onRewardEarned={(points) => {
                    setToast({
                      message: `🎉 Earned ${points} points from ad!`,
                      type: 'success',
                    });
                    fetchUser();
                  }}
                  className="w-full"
                />
              </div>

              {/* Display Ads */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Google AdSense */}
                <AdContainer placement="sidebar">
                  <GoogleAdSense placement="sidebar" />
                </AdContainer>

                {/* Adsterra Display Ad */}
                <AdContainer placement="sidebar">
                  <AdsterraAd width={300} height={250} />
                </AdContainer>
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
        </div>
      </main>
    </ProtectedRoute>
  );
}