'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/client';

interface ClickResponse {
  user: { id: string; points: number; clicks: number };
  clickReward: number;
  dailyBonus: number;
  newAchievements: Array<{ name: string; reward: number }>;
  streakDays: number;
  message?: string;
}

interface ClickButtonProps {
  onSuccess: (points: number, clicks: number, milestone: boolean) => void;
  onError: (message: string) => void;
}

export default function ClickButton({ onSuccess, onError }: ClickButtonProps) {
  const [loading, setLoading] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const [achievement, setAchievement] = useState<{ name: string; reward: number } | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;

    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y });
    setTimeout(() => setRipple(null), 600);

    setLoading(true);
    let data: ClickResponse | null = null;
    try {
      data = await apiFetch<ClickResponse>('/points/click', { method: 'POST' });
      onSuccess(data.user.points, data.user.clicks, data.newAchievements.length > 0);
      
      // Show achievement notification if unlocked
      if (data.newAchievements.length > 0) {
        setAchievement(data.newAchievements[0]);
        setTimeout(() => setAchievement(null), 3000);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to click');
    } finally {
      // Check if this is every 20th click
      const isEvery20thClick = data && data.user.clicks % 20 === 0;
      const cooldown = isEvery20thClick ? 3000 : 50; // 3s for ads, 50ms normally
      setTimeout(() => setLoading(false), cooldown);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`relative w-56 h-56 rounded-full text-6xl font-bold transition-all duration-150 transform hover:scale-110 active:scale-100 shadow-2xl ${
          loading
            ? 'bg-slate-500/50 cursor-not-allowed opacity-60 blur-sm'
            : 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white hover:shadow-pink-500/50'
        } overflow-hidden`}
      >
        {/* Ripple effect */}
        {ripple && (
          <span
            className="absolute bg-white/30 rounded-full animate-ping"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 0.6s ease-out',
            }}
          />
        )}

        {/* Content */}
        <span className={`transition-all duration-200 ${loading ? 'scale-0' : 'scale-100'}`}>
          👆
        </span>
        <span className={`absolute transition-all duration-200 ${loading ? 'scale-100' : 'scale-0'}`}>
          ⏳
        </span>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </button>

      {/* Achievement notification */}
      {achievement && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce z-50">
          <p className="font-bold">🏆 Achievement Unlocked!</p>
          <p className="text-sm">{achievement.name} (+{achievement.reward} pts)</p>
        </div>
      )}

      {/* Loading text */}
      {loading && (
        <p className="text-sm text-slate-300 dark:text-slate-400 animate-pulse">
          Processing your click...
        </p>
      )}

      {/* Info text */}
      <p className="text-xs text-slate-600 dark:text-slate-400 text-center max-w-xs">
        Click the button to earn <span className="text-yellow-600 dark:text-yellow-400 font-semibold">10 points</span> 🎯
      </p>
    </div>
  );
}