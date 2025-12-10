'use client';

/**
 * Main Dashboard Page
 * 
 * This is the primary user interface where users can:
 * - Click to earn points
 * - View their current stats (points, level, clicks)
 * - Complete activities for bonus rewards
 * - Watch ads for additional points
 * - Track their progression through the level system
 * 
 * Features:
 * - Real-time user data fetching and updates
 * - Multi-language support (EN/AR)
 * - Responsive design for all devices
 * - Toast notifications for user feedback
 * - Protected route requiring authentication
 * - Animated background and UI elements
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ClickButton from '@/components/ClickButton';
import UserCard from '@/components/UserCard';
import LevelCard from '@/components/LevelCard';
import Toast from '@/components/Toast';
import ActivitiesPanel from '@/components/ActivitiesPanel';
import RandomAd from '@/components/ads/RandomAd';
import AdsterraRewarded from '@/components/ads/AdsterraRewarded';
import AdsterraSocialBar from '@/components/ads/AdsterraSocialBar';
import AdsterraNativeBar from '@/components/ads/AdsterraNativeBar';
import GoogleAdsense from '@/components/ads/GoogleAdsense';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import { apiFetch } from '@/lib/client';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * User data interface - represents the authenticated user's game stats
 */
interface User {
  id: string;
  points: number; // Current spendable points
  clicks: number; // Total lifetime clicks
  lifetimePoints: number; // Total points earned (used for level calculation)
}

/**
 * API response structure from /api/auth/me endpoint
 */
interface MeResponse {
  user: User;
}

/**
 * Dashboard Component
 * Main game interface with click mechanics, user stats, and activity system
 */
export default function Dashboard() {
  // NextAuth session management
  const { data: session, status } = useSession();
  
  // Internationalization hook for multi-language support
  const { t } = useLanguage();
  
  // User state management
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Toast notification state for user feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  /**
   * Effect: Fetch user data when authentication status changes
   * 
   * Triggers when user logs in or authentication state is confirmed.
   * Handles both authenticated and unauthenticated states.
   */
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUser();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  /**
   * Fetch current user data from the API
   * 
   * Retrieves the user's latest stats including points, clicks, and lifetime points.
   * Called on initial load and after completing activities to refresh data.
   * 
   * @throws Displays error toast if fetch fails
   */
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

  /**
   * Handle successful click action
   * 
   * Updates local user state with new points and clicks.
   * Shows milestone notification when user reaches click milestones.
   * 
   * @param points - Updated total points
   * @param clicks - Updated total clicks
   * @param milestone - Whether a milestone was reached (triggers achievement)
   */
  const handleClickSuccess = (points: number, clicks: number, milestone: boolean) => {
    // Update user state with new values
    setUser((prev) => prev ? { ...prev, points, clicks } : null);
    
    // Show milestone celebration
    if (milestone) {
      setToast({
        message: `🎉 Milestone reached! ${clicks} clicks!`,
        type: 'info',
      });
      // TODO: Integrate ad SDK here for monetization
      // showAdvertisement();
    }
  };

  /**
   * Handle successful rewarded ad completion
   * 
   * Called when user successfully watches a rewarded video ad.
   * Updates user state with new points and lifetime points earned from the ad.
   * 
   * @param rewardedUser - Updated user object with new point totals
   * @param reward - Amount of points earned from this ad
   */
  const handleRewardSuccess = (
    rewardedUser: { id: string; points: number; lifetimePoints: number; clicks: number },
    reward: number,
  ) => {
    // Update user state - preserve existing if available, otherwise create new
    setUser((prev) =>
      prev
        ? {
            ...prev,
            points: rewardedUser.points,
            lifetimePoints: rewardedUser.lifetimePoints,
            clicks: rewardedUser.clicks ?? prev.clicks, // Fallback to previous clicks if not provided
          }
        : {
            id: rewardedUser.id,
            points: rewardedUser.points,
            lifetimePoints: rewardedUser.lifetimePoints,
            clicks: rewardedUser.clicks,
          }
    );

    // Show success notification
    setToast({
      message: `✅ Rewarded ad complete: +${reward} points`,
      type: 'success',
    });
  };

  /**
   * Handle rewarded ad errors
   * 
   * @param message - Error message to display
   */
  const handleRewardError = (message: string) => {
    setToast({ message, type: 'error' });
  };

  /**
   * Handle click action errors
   * 
   * @param message - Error message to display
   */
  const handleClickError = (message: string) => {
    setToast({ message, type: 'error' });
  };

  if (loading && status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader size="lg" color="cyan" />
          <p className="text-slate-300 text-lg font-semibold">{t.loadingDashboard}</p>
        </div>
      </main>
    );
  }

  // Show demo data for non-authenticated users
  const displayUser = user || { id: 'guest', points: 0, clicks: 0, lifetimePoints: 0 };
  const isAuthenticated = status === 'authenticated';

  return (
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

          {/* Google AdSense - Top Banner */}
          <div className="mb-6 sm:mb-8 lg:mb-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <GoogleAdsense 
              adSlot="1234567890" 
              adFormat="horizontal"
              style={{ minHeight: '90px' }}
            />
          </div>

          {/* Adsterra Social Bar */}
          <div className="mb-6 sm:mb-8 lg:mb-10 animate-fade-in" style={{ animationDelay: '110ms' }}>
            <AdsterraSocialBar />
          </div>

          {/* Google AdSense - Dual Display Ads */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10 animate-fade-in" style={{ animationDelay: '120ms' }}>
            <GoogleAdsense 
              adSlot="1234567891" 
              adFormat="rectangle"
              style={{ minHeight: '250px' }}
            />
            <GoogleAdsense 
              adSlot="1234567892" 
              adFormat="rectangle"
              style={{ minHeight: '250px' }}
            />
          </div>

          {/* Main Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-center mb-8 sm:mb-10 lg:mb-12">
            {/* Left: Level Card */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <LevelCard lifetimePoints={displayUser.lifetimePoints || 0} />
            </div>

            {/* Center: User Stats */}
            <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <UserCard points={displayUser.points} clicks={displayUser.clicks} />
            </div>

            {/* Right: Click Button */}
            <div className="flex justify-center sm:col-span-2 lg:col-span-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <ClickButton
                onSuccess={handleClickSuccess}
                onError={handleClickError}
                isAuthenticated={isAuthenticated}
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

          {/* Google AdSense - In-Article Ad */}
          <div className="my-6 sm:my-8 animate-fade-in" style={{ animationDelay: '350ms' }}>
            <GoogleAdsense 
              adSlot="1234567893" 
              adFormat="fluid"
              style={{ minHeight: '200px' }}
            />
          </div>

            {/* Rewarded ad + inline sponsored */}
          {/* Activities Panel */}
          <div className="my-8 sm:my-10 lg:my-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <ActivitiesPanel 
              onPointsEarned={fetchUser} 
              lifetimePoints={displayUser.lifetimePoints || 0}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Google AdSense - Display Ad */}
          <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
            <GoogleAdsense 
              adSlot="1234567894" 
              adFormat="auto"
              style={{ minHeight: '280px' }}
            />
          </div>

          {/* Adsterra Native Bar */}
          <div className="my-6 sm:my-8 animate-fade-in" style={{ animationDelay: '480ms' }}>
            <AdsterraNativeBar />
          </div>

          {/* Google AdSense - Footer Banner */}
          <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
            <GoogleAdsense 
              adSlot="1234567895" 
              adFormat="horizontal"
              style={{ minHeight: '90px' }}
            />
          </div>

          {/* Sign-in prompt for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-8 glass backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-300 dark:border-cyan-600 rounded-3xl p-6 text-center animate-fade-in">
              <p className="text-lg font-semibold mb-3">🔐 {t.signInToPlay || 'Sign in to start earning points!'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {t.signInDescription || 'Create an account to save your progress, earn rewards, and compete with others!'}
              </p>
              <a
                href="/login"
                className="inline-block px-8 py-3 bg-gradient-ocean text-white font-semibold rounded-xl hover:shadow-glow transition-all duration-300"
              >
                {t.signIn || 'Sign In / Register'}
              </a>
            </div>
          )}

          {/* Footer Section */}
          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 animate-fade-in" style={{ animationDelay: '550ms' }}>
            <div className="text-center space-y-4">
              {/* Referral Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <a 
                  href="https://beta.publishers.adsterra.com/referral/TrFeRtUeQH" 
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  📢 Earn with Adsterra
                </a>
              </div>
              
              {/* Copyright & Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>© 2025 ClickVault. All rights reserved.</p>
                <p className="text-[10px]">Monetized with Google AdSense & Adsterra</p>
              </div>
            </div>
          </footer>

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </main>
  );
}