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

interface FloatingPoint {
  id: number;
  points: number;
  type: 'normal' | 'combo' | 'bonus';
}

export default function ClickButton({ onSuccess, onError }: ClickButtonProps) {
  const [loading, setLoading] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const [achievement, setAchievement] = useState<{ name: string; reward: number } | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [nextFloatingId, setNextFloatingId] = useState(0);
  const [shake, setShake] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;

    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y });
    setTimeout(() => setRipple(null), 600);

    // Shake effect
    setShake(true);
    setTimeout(() => setShake(false), 300);

    // Particle burst effect
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: Math.cos((i / 8) * Math.PI * 2) * 50,
      y: Math.sin((i / 8) * Math.PI * 2) * 50,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600);

    // Update combo
    const newCombo = comboCount + 1;
    setComboCount(newCombo);
    if (comboTimer) clearTimeout(comboTimer);
    const timer = setTimeout(() => setComboCount(0), 3000);
    setComboTimer(timer);

    setLoading(true);
    let data: ClickResponse | null = null;
    try {
      data = await apiFetch<ClickResponse>('/points/click', { method: 'POST' });
      onSuccess(data.user.points, data.user.clicks, data.newAchievements.length > 0);
      
      // Add floating points animation
      const newId = nextFloatingId;
      setNextFloatingId(newId + 1);
      const pointType = newCombo % 10 === 0 ? 'combo' : data.dailyBonus > 0 ? 'bonus' : 'normal';
      const displayPoints = data.clickReward + data.dailyBonus;
      setFloatingPoints([...floatingPoints, { id: newId, points: displayPoints, type: pointType }]);
      setTimeout(() => {
        setFloatingPoints(prev => prev.filter(p => p.id !== newId));
      }, 2000);
      
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
      const cooldown = isEvery20thClick ? 1500 : 10;
      setTimeout(() => setLoading(false), cooldown);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Combo counter */}
      {comboCount > 1 && (
        <div className="text-center animate-bounce">
          <div className="text-4xl font-bold text-yellow-400">
            🔥 {comboCount} COMBO!
          </div>
          <div className="text-xs text-yellow-300">Keep clicking to maintain combo!</div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={`relative w-56 h-56 rounded-full text-6xl font-bold transition-all duration-150 transform shadow-2xl ${
          shake ? 'animate-bounce' : ''
        } ${
          loading
            ? 'bg-slate-500/50 cursor-not-allowed opacity-60'
            : comboCount > 1
            ? 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 hover:from-orange-500 hover:via-red-600 hover:to-pink-700 text-white hover:shadow-red-500/50 hover:scale-110 active:scale-95'
            : 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white hover:shadow-pink-500/50 hover:scale-110 active:scale-95'
        } overflow-hidden cursor-pointer border-2 ${comboCount > 1 ? 'border-yellow-300' : 'border-transparent'}`}
      >
        {/* Ripple effect */}
        {ripple && (
          <span
            className="absolute bg-white/40 rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
              animation: 'ripple 0.6s ease-out',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Particle burst */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px)`,
              animation: `burst 0.6s ease-out forwards`,
              opacity: 0.8,
            }}
          />
        ))}

        {/* Content */}
        <span className={`transition-all duration-200 block text-5xl ${loading ? 'scale-0' : 'scale-100'}`}>
          {comboCount > 1 ? '🔥' : '👆'}
        </span>
        <span className={`absolute transition-all duration-200 ${loading ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          ⏳
        </span>

        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 blur-xl ${comboCount > 1 ? 'bg-orange-400/40 opacity-100' : 'bg-white/10 hover:opacity-100'}`}></div>
      </button>

      {/* Floating points */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingPoints.map(point => (
          <div
            key={point.id}
            className={`absolute text-2xl font-bold animate-float ${
              point.type === 'combo' ? 'text-orange-400' : 
              point.type === 'bonus' ? 'text-green-400' : 
              'text-yellow-400'
            }`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `float 2s ease-out forwards`,
              fontWeight: point.type === 'combo' ? 'bold' : 'semibold',
            }}
          >
            {point.type === 'combo' ? '🔥' : point.type === 'bonus' ? '💎' : '+'}{point.points}
          </div>
        ))}
      </div>

      {/* Achievement notification */}
      {achievement && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl shadow-xl animate-bounce z-50 border-2 border-yellow-200">
          <p className="font-bold text-lg">🏆 Achievement Unlocked!</p>
          <p className="text-sm">{achievement.name} (+{achievement.reward} pts)</p>
        </div>
      )}

      {/* Status text */}
      <div className="h-6">
        {loading && (
          <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse font-semibold">
            Processing click...
          </p>
        )}
      </div>

      {/* Info text */}
      <div className="text-center">
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
          🎮 Build combos for multiplier bonuses!
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Every 20 clicks = 🎬 Ad Break | Maintain streak = 🔥 Bonus multiplier
        </p>
      </div>

      <style jsx>{`
        @keyframes ripple {
          from {
            width: 20px;
            height: 20px;
            opacity: 1;
          }
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
        @keyframes float {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -200%);
          }
        }
        @keyframes burst {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--x), var(--y));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}