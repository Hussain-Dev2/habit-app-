'use client';

/**
 * ClickButton Component
 * 
 * The main interactive button for the clicker game. This component handles:
 * - Click animations (ripple, shake, particles)
 * - Combo system (rewards rapid clicking)
 * - Floating points display
 * - Achievement notifications
 * - Level-based rewards
 * - Daily bonus tracking
 * 
 * Visual Effects:
 * - Ripple effect on click position
 * - Shake animation
 * - Particle burst (8 particles)
 * - Floating points that animate upward
 * - Achievement popup notifications
 * - Combo counter for consecutive clicks
 * 
 * Game Mechanics:
 * - Points earned per click scale with user level
 * - Combo bonuses for rapid clicking (resets after 3 seconds)
 * - Achievement unlocks for milestones
 * - Daily bonus multipliers
 * - Ad break cooldown every 20 clicks
 */

import { useState } from 'react';
import Loader from '@/components/Loader';
import { apiFetch } from '@/lib/client';
import { useLanguage } from '@/contexts/LanguageContext';
import InterstitialAd from '@/components/ads/InterstitialAd';

/**
 * API response structure from /api/points/click
 */
interface ClickResponse {
  user: { id: string; points: number; clicks: number; lifetimePoints: number };
  clickReward: number; // Base points earned from this click
  dailyBonus: number; // Bonus points from daily multiplier
  newAchievements: Array<{ name: string; reward: number }>; // Achievements unlocked
  streakDays: number; // Current daily login streak
  message?: string; // Optional status message
  comboCount?: number; // Server-side combo count
  comboBonus?: number; // Combo bonus percentage
  isLuckyClick?: boolean; // Was this a lucky click?
  luckyMultiplier?: number; // Lucky click multiplier (10x)
}

/**
 * Component props interface
 */
interface ClickButtonProps {
  onSuccess: (points: number, clicks: number, lifetimePoints: number, milestone: boolean) => void;
  onError: (message: string) => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

/**
 * Floating point animation data
 */
interface FloatingPoint {
  id: number;
  points: number; // Amount to display
  type: 'normal' | 'combo' | 'bonus'; // Affects color/style
}

/**
 * ClickButton Component
 * Main interactive button with animations and game logic
 */
export default function ClickButton({ onSuccess, onError, isAuthenticated = true, isAdmin = false }: ClickButtonProps) {
  // Internationalization
  const { t } = useLanguage();
  
  // Loading state - prevents spam clicking
  const [loading, setLoading] = useState(false);
  
  // Ad break state - shows cooldown after every 20 clicks
  const [isAdBreak, setIsAdBreak] = useState(false);
  
  // Ripple animation state (position where user clicked)
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  
  // Achievement notification state
  const [achievement, setAchievement] = useState<{ name: string; reward: number } | null>(null);
  
  // Floating points animations (show earned points flying upward)
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [nextFloatingId, setNextFloatingId] = useState(0);
  
  // Shake animation state
  const [shake, setShake] = useState(false);
  
  // Combo system - rewards rapid clicking
  const [comboCount, setComboCount] = useState(0);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Particle burst effect
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  // Interstitial ad state
  const [showInterstitial, setShowInterstitial] = useState(false);

  /**
   * Handle click event
   * 
   * This is the main game logic function. It:
   * 1. Triggers all visual animations (ripple, shake, particles)
   * 2. Updates combo counter
   * 3. Calls API to award points
   * 4. Shows floating points animation
   * 5. Displays achievement notifications
   * 6. Handles ad break cooldown
   * 
   * Performance: Uses setTimeout for cleanup to prevent memory leaks
   * Anti-spam: Loading state prevents concurrent clicks
   * 
   * @param e - Mouse event for ripple position calculation
   */
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      onError(t.signInRequired || 'Please sign in to start earning points!');
      return;
    }

    // Prevent spam clicking during API call
    if (loading) return;

    // ===== VISUAL EFFECTS =====
    
    // Ripple effect at click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // Relative X position
    const y = e.clientY - rect.top; // Relative Y position
    setRipple({ x, y });
    setTimeout(() => setRipple(null), 600); // Clear after animation

    // Shake animation for button feedback
    setShake(true);
    setTimeout(() => setShake(false), 300);

    // Particle burst effect (8 particles in circle pattern)
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      // Calculate position using circular distribution
      x: Math.cos((i / 8) * Math.PI * 2) * 50,
      y: Math.sin((i / 8) * Math.PI * 2) * 50,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600); // Clear after animation

    // ===== COMBO SYSTEM =====
    
    // Increment combo count for rapid clicking
    const newCombo = comboCount + 1;
    setComboCount(newCombo);
    
    // Reset combo after 3 seconds of inactivity
    if (comboTimer) clearTimeout(comboTimer);
    const timer = setTimeout(() => setComboCount(0), 3000);
    setComboTimer(timer);

    // ===== API CALL =====
    
    let data: ClickResponse | null = null;
    try {
      // Set loading only during the actual API call
      setLoading(true);
      
      // Call smart points API with level bonuses and achievements
      data = await apiFetch<ClickResponse>('/points/click', { method: 'POST' });
      
      // Notify parent component of success
      onSuccess(data.user.points, data.user.clicks, data.user.lifetimePoints, data.newAchievements.length > 0);
      
      // ===== LUCKY CLICK NOTIFICATION =====
      if (data.isLuckyClick) {
        // Show special lucky click notification
        setAchievement({ 
          name: '🍀 LUCKY CLICK!', 
          reward: Math.floor(data.clickReward * 0.9) // Show bonus gained
        });
        setTimeout(() => setAchievement(null), 2000);
      }
      
      // ===== FLOATING POINTS ANIMATION =====
      
      const newId = nextFloatingId;
      setNextFloatingId(newId + 1);
      
      // Determine point type for styling
      const pointType = data.isLuckyClick
        ? 'combo' // Lucky clicks get special styling
        : newCombo % 10 === 0 
        ? 'combo' // Every 10th combo gets special styling
        : data.dailyBonus > 0 
        ? 'bonus' // Daily bonus active
        : 'normal'; // Regular points
      
      // Total points to display (base + bonus)
      const displayPoints = data.clickReward + data.dailyBonus;
      
      // Add to floating points array
      setFloatingPoints([...floatingPoints, { id: newId, points: displayPoints, type: pointType }]);
      
      // Remove after animation completes
      setTimeout(() => {
        setFloatingPoints(prev => prev.filter(p => p.id !== newId));
      }, 2000);
      
      // ===== ACHIEVEMENT NOTIFICATION =====
      
      if (data.newAchievements.length > 0 && !data.isLuckyClick) {
        setAchievement(data.newAchievements[0]); // Show first achievement
        setTimeout(() => setAchievement(null), 3000); // Hide after 3 seconds
      }
    } catch (error) {
      // Handle API errors
      onError(error instanceof Error ? error.message : 'Failed to click');
    } finally {
      // ===== AD BREAK COOLDOWN =====
      
      // Every 50th click triggers an interstitial ad (reduced frequency) - Skip for admins
      const isEvery50thClick = data && data.user.clicks % 50 === 0 && !isAdmin;
      setIsAdBreak(isEvery50thClick);
      
      if (isEvery50thClick) {
        // Show interstitial ad
        setShowInterstitial(true);
        setTimeout(() => setLoading(false), 300);
      } else {
        // Immediate unlock for regular clicks
        setLoading(false);
      }
    }
  };

  return (
    <>
      {/* Interstitial Ad */}
      {showInterstitial && (
        <InterstitialAd onClose={() => {
          setShowInterstitial(false);
          setIsAdBreak(false);
        }} />
      )}
      
    <div className="flex flex-col items-center gap-6 relative">
      {/* Combo counter */}
      {comboCount > 1 && (
        <div className="text-center animate-bounce">
          <div className="text-6xl font-extrabold bg-gradient-smooth-4 bg-clip-text text-transparent drop-shadow-lg animate-gradient">
            🔥 {comboCount}x {t.combo.toUpperCase()}!
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
            <Loader size="lg" color="cyan" />
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
    </>
  );
}