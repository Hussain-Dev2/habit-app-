'use client';

/**
 * FortuneCookie Component
 * 
 * Display motivational messages, tips, and fun facts
 * Users can "crack" a new cookie every few minutes
 */

import { useState, useEffect } from 'react';

const FORTUNE_MESSAGES = [
  { text: "Every click brings you closer to your goals! 🎯", type: "motivation" },
  { text: "Consistency is key - log in daily for streak bonuses! 🔥", type: "tip" },
  { text: "Did you know? Completing challenges gives extra points! 💡", type: "tip" },
  { text: "Your hard work is paying off! Keep clicking! 💪", type: "motivation" },
  { text: "Pro tip: Watch ads during cooldowns to maximize earnings! 📺", type: "tip" },
  { text: "You're doing amazing! Your dedication shows! ⭐", type: "motivation" },
  { text: "Referral system: Invite friends to earn passive points! 🤝", type: "tip" },
  { text: "The early bird gets the points! 🐦", type: "motivation" },
  { text: "Play mini-games for fun and extra rewards! 🎮", type: "tip" },
  { text: "Success is the sum of small efforts repeated! 📈", type: "motivation" },
  { text: "Check the leaderboard to see where you rank! 🏆", type: "tip" },
  { text: "Believe in yourself - you're a winner! 🌟", type: "motivation" },
  { text: "Daily challenges reset at midnight - don't miss them! ⏰", type: "tip" },
  { text: "Your potential is limitless! 🚀", type: "motivation" },
  { text: "Spin the wheel for random rewards! 🎡", type: "tip" },
  { text: "Small steps lead to big achievements! 👣", type: "motivation" },
  { text: "Fun fact: You can customize your profile in settings! ⚙️", type: "fact" },
  { text: "The journey of a thousand clicks begins with one! 🎯", type: "motivation" },
  { text: "Combo clicks give bonus multipliers! 🔥", type: "tip" },
  { text: "You're unstoppable! Keep going! 💥", type: "motivation" },
  { text: "Check your achievements to see what you've unlocked! 🏅", type: "tip" },
  { text: "Fortune favors the persistent! 🍀", type: "motivation" },
  { text: "Fun fact: The highest level user has over 1 million points! 👑", type: "fact" },
  { text: "Share with friends to spread the fun! 🎉", type: "tip" },
  { text: "Your future is bright! ☀️", type: "motivation" },
];

export default function FortuneCookie() {
  const [cracked, setCracked] = useState(false);
  const [fortune, setFortune] = useState('');
  
  // Initialize canCrack and cooldownTime based on localStorage
  const [canCrack, setCanCrack] = useState(() => {
    if (typeof window === 'undefined') return true;
    const lastCrack = localStorage.getItem('lastFortuneCrack');
    if (lastCrack) {
      const elapsed = Date.now() - parseInt(lastCrack);
      const cooldown = 5 * 60 * 1000; // 5 minutes
      return elapsed >= cooldown;
    }
    return true;
  });
  
  const [cooldownTime, setCooldownTime] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const lastCrack = localStorage.getItem('lastFortuneCrack');
    if (lastCrack) {
      const elapsed = Date.now() - parseInt(lastCrack);
      const cooldown = 5 * 60 * 1000; // 5 minutes
      if (elapsed < cooldown) {
        return Math.ceil((cooldown - elapsed) / 1000);
      }
    }
    return 0;
  });
  
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
        if (cooldownTime - 1 === 0) {
          setCanCrack(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const crackCookie = () => {
    if (!canCrack) return;

    // Random fortune
    const randomFortune = FORTUNE_MESSAGES[Math.floor(Math.random() * FORTUNE_MESSAGES.length)];
    setFortune(randomFortune.text);
    setCracked(true);
    
    // Save crack time
    localStorage.setItem('lastFortuneCrack', Date.now().toString());
    
    // Set cooldown
    setCanCrack(false);
    setCooldownTime(5 * 60); // 5 minutes

    // Reset after viewing
    setTimeout(() => {
      setCracked(false);
      setFortune('');
    }, 8000);
  };

  const handleHover = () => {
    if (canCrack && !cracked) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border-2 border-amber-200 dark:border-amber-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        🥠 Fortune Cookie
      </h2>

      <div className="flex flex-col items-center justify-center min-h-[200px]">
        {!cracked ? (
          <div className="text-center">
            <button
              onClick={crackCookie}
              onMouseEnter={handleHover}
              disabled={!canCrack}
              className={`relative transition-all duration-300 ${
                canCrack 
                  ? 'cursor-pointer hover:scale-110 transform' 
                  : 'opacity-50 cursor-not-allowed'
              } ${shake ? 'animate-wiggle' : ''}`}
            >
              <div className="text-8xl">🥠</div>
              {canCrack && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap animate-bounce">
                  Click to crack!
                </div>
              )}
            </button>
            
            {!canCrack && (
              <div className="mt-4 text-gray-600 dark:text-gray-400">
                <p className="text-sm">Next fortune in:</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCooldown(cooldownTime)}
                </p>
              </div>
            )}
            
            {canCrack && (
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                Crack open a fortune cookie for wisdom!
              </p>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-4 mb-4 animate-fortune-crack">
              <div className="text-6xl transform -rotate-12">🥠</div>
              <div className="text-6xl transform rotate-12">🥠</div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-xl max-w-md animate-fade-in border-2 border-amber-300 dark:border-amber-600">
              <div className="text-center">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-lg font-medium text-gray-800 dark:text-white italic">
                  "{fortune}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes fortune-crack {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(-20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        
        .animate-fortune-crack {
          animation: fortune-crack 0.6s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
