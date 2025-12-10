'use client';

import { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import SpinWheelModal from '@/components/SpinWheelModal';
import AdWatchModal from '@/components/AdWatchModal';
import { apiFetch } from '@/lib/client';
import { calculateLevel } from '@/lib/level-system';

interface Activity {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  cooldown: number; // in seconds
  energyCost: number;
}

const ACTIVITIES: Activity[] = [
  {
    id: 'daily_bonus',
    name: 'Daily Bonus',
    description: 'Claim your daily reward',
    icon: '🎁',
    reward: 100,
    cooldown: 86400, // 24 hours
    energyCost: 0,
  },
  {
    id: 'watch_ad',
    name: 'Watch Ad',
    description: 'Watch a short ad for points',
    icon: '📺',
    reward: 50,
    cooldown: 300, // 5 minutes
    energyCost: 0,
  },
  {
    id: 'spin_wheel',
    name: 'Spin Wheel',
    description: 'Try your luck for big rewards!',
    icon: '🎡',
    reward: 200,
    cooldown: 21600, // 6 hours
    energyCost: 0,
  },
  {
    id: 'complete_task',
    name: 'Mini Task',
    description: 'Complete quick challenges',
    icon: '✅',
    reward: 75,
    cooldown: 600, // 10 minutes
    energyCost: 5,
  },
  {
    id: 'share_reward',
    name: 'Share & Earn',
    description: 'Share with friends for bonus',
    icon: '🔗',
    reward: 30,
    cooldown: 1800, // 30 minutes
    energyCost: 0,
  },
];

interface ActivityTimestamp {
  [key: string]: number; // timestamp of last completion
}

interface ActivitiesPanelProps {
  onPointsEarned?: () => void;
  lifetimePoints?: number;
}

export default function ActivitiesPanel({ onPointsEarned, lifetimePoints = 0 }: ActivitiesPanelProps = {}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<ActivityTimestamp>({});
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({
    text: '',
    type: 'success',
  });
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [spinReward, setSpinReward] = useState<number | null>(null);
  const [showAdWatch, setShowAdWatch] = useState(false);
  const [adReward, setAdReward] = useState<number>(0);

  // Calculate user's level
  const level = calculateLevel(lifetimePoints);

  // Fetch activity status from server
  useEffect(() => {
    const fetchActivityStatus = async () => {
      try {
        const response = await apiFetch<{ 
          activityStatus: Record<string, { canComplete: boolean; remainingSeconds: number }> 
        }>('/points/activity-status');
        
        // Convert to timestamp format
        const now = Math.floor(Date.now() / 1000);
        const timestamps: ActivityTimestamp = {};
        
        for (const [activityId, status] of Object.entries(response.activityStatus)) {
          if (!status.canComplete) {
            // Calculate when it was last completed
            const activity = ACTIVITIES.find(a => a.id === activityId);
            if (activity) {
              timestamps[activityId] = now - (activity.cooldown - status.remainingSeconds);
            }
          }
        }
        
        setLastActivity(timestamps);
      } catch (error) {
        console.error('Failed to fetch activity status:', error);
      }
    };

    fetchActivityStatus();
    
    // Refresh status every minute
    const interval = setInterval(fetchActivityStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate actual rewards based on level
  const getActivityReward = (activity: Activity): number => {
    if (activity.id === 'daily_bonus') {
      return Math.floor(activity.reward * level.dailyBonusMultiplier);
    } else if (activity.id === 'watch_ad') {
      return level.adReward;
    } else {
      return Math.floor(activity.reward * level.clickMultiplier);
    }
  };

  const canComplete = (activity: Activity): boolean => {
    const lastTime = lastActivity[activity.id] || 0;
    const now = Math.floor(Date.now() / 1000);
    return now - lastTime >= activity.cooldown;
  };

  const getTimeRemaining = (activity: Activity): string => {
    const lastTime = lastActivity[activity.id] || 0;
    const now = Math.floor(Date.now() / 1000);
    const remaining = activity.cooldown - (now - lastTime);

    if (remaining <= 0) return 'Ready!';
    if (remaining < 60) return `${remaining}s`;
    if (remaining < 3600) return `${Math.floor(remaining / 60)}m`;
    return `${Math.floor(remaining / 3600)}h`;
  };

  const handleActivityClick = async (activity: Activity) => {
    if (!canComplete(activity)) {
      setMessage({
        text: `Available in ${getTimeRemaining(activity)}`,
        type: 'error',
      });
      return;
    }

    // Special handling for spin wheel
    if (activity.id === 'spin_wheel') {
      setSpinReward(null);
      setShowSpinWheel(true);
      return;
    }

    // Special handling for watch ad
    if (activity.id === 'watch_ad') {
      setAdReward(getActivityReward(activity));
      setShowAdWatch(true);
      return;
    }

    setLoading(activity.id);
    try {
      // Call the activity endpoint
      const response = await apiFetch<{ 
        success: boolean; 
        reward: number; 
        user: { points: number };
        error?: string;
        cooldownRemaining?: number;
      }>('/points/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: activity.id }),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setLastActivity({
        ...lastActivity,
        [activity.id]: Math.floor(Date.now() / 1000),
      });

      setMessage({
        text: `+${response.reward} points! ${activity.icon}`,
        type: 'success',
      });

      // Refresh parent component's user data
      if (onPointsEarned) {
        onPointsEarned();
      }

      setTimeout(() => setMessage({ text: '', type: 'success' }), 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Activity failed';
      setMessage({
        text: errorMessage,
        type: 'error',
      });
      setTimeout(() => setMessage({ text: '', type: 'error' }), 3000);
    } finally {
      setLoading(null);
    }
  };

  const handleSpin = async (): Promise<number> => {
    try {
      const response = await apiFetch<{ 
        success: boolean; 
        reward: number; 
        user: { points: number };
      }>('/points/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: 'spin_wheel' }),
      });

      setLastActivity({
        ...lastActivity,
        spin_wheel: Math.floor(Date.now() / 1000),
      });

      // Refresh parent component's user data
      if (onPointsEarned) {
        onPointsEarned();
      }

      return response.reward;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Spin failed';
      setMessage({
        text: errorMessage,
        type: 'error',
      });
      setShowSpinWheel(false);
      throw error;
    }
  };

  const handleWatchAd = async (): Promise<number> => {
    try {
      const response = await apiFetch<{ 
        success: boolean; 
        reward: number; 
        user: { points: number };
      }>('/points/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: 'watch_ad' }),
      });

      setLastActivity({
        ...lastActivity,
        watch_ad: Math.floor(Date.now() / 1000),
      });

      setMessage({
        text: `+${response.reward} points from ad! 📺`,
        type: 'success',
      });

      // Refresh parent component's user data
      if (onPointsEarned) {
        onPointsEarned();
      }

      setTimeout(() => setMessage({ text: '', type: 'success' }), 2000);
      setShowAdWatch(false);
      return response.reward;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ad watch failed';
      setMessage({
        text: errorMessage,
        type: 'error',
      });
      setTimeout(() => setMessage({ text: '', type: 'error' }), 3000);
      setShowAdWatch(false);
      throw error;
    }
  };

  return (
    <>
      <SpinWheelModal
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        onSpin={handleSpin}
        reward={spinReward}
      />

      <AdWatchModal
        isOpen={showAdWatch}
        onClose={() => setShowAdWatch(false)}
        onComplete={handleWatchAd}
        reward={adReward}
      />

      <div className="w-full max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-white">
        🎮 Earn More Points
      </h2>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg text-center text-white ${
            message.type === 'success'
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACTIVITIES.map(activity => (
          <div
            key={activity.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              canComplete(activity)
                ? 'border-green-500 hover:shadow-lg hover:scale-105 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                : 'border-slate-300 opacity-60 bg-slate-100 dark:bg-slate-800'
            }`}
            onClick={() => handleActivityClick(activity)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-4xl">{activity.icon}</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-500">
                  +{getActivityReward(activity)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  points
                </div>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 dark:text-white mb-1">
              {activity.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              {activity.description}
            </p>

            <div className="flex items-center justify-between">
              {activity.energyCost > 0 && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  ⚡ {activity.energyCost} energy
                </div>
              )}
              <div className={`text-xs font-semibold ${
                canComplete(activity)
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {getTimeRemaining(activity)}
              </div>
            </div>

            {loading === activity.id && (
              <div className="mt-3 flex justify-center items-center gap-2">
                <Loader size="sm" color="emerald" />
                <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Processing...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Pro Tips:</strong> Mix up your activities to stay engaged and earn bonus multipliers. Build streaks for bigger rewards!
        </p>
      </div>
      </div>
    </>
  );
}
