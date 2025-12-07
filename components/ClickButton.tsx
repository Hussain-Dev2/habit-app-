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
  const [isAdBreak, setIsAdBreak] = useState(false);
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
      setIsAdBreak(isEvery20thClick);
      const cooldown = isEvery20thClick ? 1500 : 10;
      setTimeout(() => {
        setLoading(false);
        setIsAdBreak(false);
      }, cooldown);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Combo counter */}
      {comboCount > 1 && (
        <div className="text-center animate-bounce">
          <div className="text-6xl font-extrabold bg-gradient-smooth-4 bg-clip-text text-transparent drop-shadow-lg animate-gradient">
            🔥 {comboCount}x COMBO!
          </div>
          <div className="text-base text-accent-sunset dark:text-accent-peach font-bold mt-3">Keep going for bigger rewards! 🎯</div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={`relative w-72 h-72 rounded-full text-8xl font-bold transition-all duration-300 transform shadow-2xl ${
          shake ? 'animate-bounce' : ''
        } ${
          loading
            ? 'bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 cursor-wait opacity-80 animate-pulse'
            : comboCount > 1
            ? 'bg-gradient-smooth-4 hover:shadow-glow-coral text-white hover:scale-110 active:scale-95 border-4 border-warm-300 dark:border-warm-400 animate-pulse-soft'
            : 'bg-gradient-smooth-1 hover:shadow-glow text-white hover:scale-110 active:scale-95 border-4 border-primary-300/50 dark:border-primary-600/50 animate-pulse-soft'
        } overflow-hidden cursor-pointer`}
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
            className="absolute w-3 h-3 rounded-full pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              background: comboCount > 1 ? 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px)`,
              animation: `burst 0.6s ease-out forwards`,
              opacity: 0.9,
            }}
          />
        ))}

        {/* Content */}
        <span className={`transition-all duration-300 block text-7xl ${loading ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
          {comboCount > 1 ? '🔥' : '✨'}
        </span>
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-8 border-gray-300 dark:border-gray-600 border-t-primary-500 dark:border-t-primary-400 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">✨</span>
              </div>
            </div>
          </div>
        )}

        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 blur-3xl ${
          comboCount > 1 
            ? 'bg-gradient-smooth-4 opacity-60' 
            : 'bg-gradient-smooth-1 hover:opacity-50'
        }`}></div>
      </button>

      {/* Floating points */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingPoints.map(point => (
          <div
            key={point.id}
            className={`absolute text-3xl font-extrabold ${
              point.type === 'combo' ? 'text-accent-sunset' : 
              point.type === 'bonus' ? 'text-accent-mint' : 
              'text-warm-400'
            }`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `floatUp 2s ease-out forwards`,
              fontWeight: point.type === 'combo' ? 'bold' : 'semibold',
            }}
          >
            {point.type === 'combo' ? '🔥' : point.type === 'bonus' ? '💰' : '⭐'}+{point.points}
          </div>
        ))}
      </div>

      {/* Achievement notification */}
      {achievement && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 glass bg-gradient-smooth-4 text-white px-10 py-6 rounded-3xl shadow-glow-coral animate-bounce z-50 border-2 border-warm-200">
          <p className="font-extrabold text-2xl flex items-center gap-2">
            <span className="animate-pulse-soft">🏆</span> Achievement Unlocked!
          </p>
          <p className="text-lg mt-1">{achievement.name} <span className="font-bold">(+{achievement.reward} pts)</span></p>
        </div>
      )}

      {/* Status text */}
      <div className="h-8">
        {loading && (
          <p className="text-base text-gray-600 dark:text-gray-400 animate-pulse font-bold">
            {isAdBreak ? (
              <>🎬 Ad Break! Preparing reward... 💰</>
            ) : (
              <>Processing your click... ✨</>
            )}
          </p>
        )}
      </div>

      {/* Info text */}
      <div className="text-center max-w-lg">
        <p className="text-base text-gray-700 dark:text-gray-300 mb-3 font-bold">
          🎮 Build combos for multiplier bonuses!
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
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