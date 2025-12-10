'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => Promise<number>; // Returns the reward amount
  reward: number | null;
}

export default function AdWatchModal({ isOpen, onClose, onComplete, reward }: AdWatchModalProps) {
  const { t } = useLanguage();
  const [isWatching, setIsWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  const AD_DURATION = 15; // 15 seconds ad duration

  // Simulate ad loading when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Simulate ad loading (check if ad is available)
    const loadTimeout = setTimeout(() => {
      // 80% chance ad is available
      if (Math.random() > 0.2) {
        setAdLoaded(true);
      } else {
        setAdError(true);
      }
    }, 1500);

    return () => {
      clearTimeout(loadTimeout);
      // Cleanup on unmount
      setAdLoaded(false);
      setAdError(false);
      setIsWatching(false);
      setProgress(0);
      setShowReward(false);
    };
  }, [isOpen]);

  const handleStartAd = () => {
    if (!adLoaded || isWatching) return;

    setIsWatching(true);
    setProgress(0);

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (AD_DURATION * 10)); // Update every 100ms
      });
    }, 100);

    // Complete ad after duration
    setTimeout(async () => {
      clearInterval(interval);
      setIsWatching(false);
      setProgress(100);
      
      try {
        await onComplete();
      } catch (error) {
        console.error('Failed to claim reward:', error);
      }
    }, AD_DURATION * 1000);
  };

  const handleClose = () => {
    if (!isWatching) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-purple-400 dark:border-purple-600 relative">
        {!isWatching && !showReward && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ✕
          </button>
        )}

        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-600 bg-clip-text text-transparent">
          📺 {t.watchAdActivity || 'Watch Ad'}
        </h2>

        {/* Ad Loading State */}
        {!adLoaded && !adError && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300">Loading advertisement...</p>
          </div>
        )}

        {/* Ad Not Available */}
        {adError && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Ads Available</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Please try again later
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              {t.close || 'Close'}
            </button>
          </div>
        )}

        {/* Ad Ready / Watching */}
        {adLoaded && !showReward && (
          <div>
            {/* Mock Ad Content */}
            <div className="mb-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8 text-center border-2 border-purple-300 dark:border-purple-700">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                Advertisement
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isWatching ? 'Please watch the full ad...' : 'Ready to play'}
              </p>
              
              {/* Progress Bar */}
              {isWatching && (
                <div className="mt-6">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {Math.ceil(AD_DURATION - (progress / 100 * AD_DURATION))}s remaining
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-semibold">
                    ⚠️ Don&apos;t close or you won&apos;t get points!
                  </p>
                </div>
              )}
            </div>

            {/* Start/Watching Button */}
            {!isWatching && (
              <button
                onClick={handleStartAd}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg"
              >
                ▶️ Start Watching
              </button>
            )}
            
            {isWatching && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Watch the full ad to earn your reward...
              </div>
            )}
          </div>
        )}

        {/* Reward Display */}
        {showReward && reward !== null && (
          <div className="text-center py-4">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white rounded-2xl p-6 mb-4 animate-bounce">
              <div className="text-6xl mb-2">🎉</div>
              <div className="text-4xl font-extrabold">+{reward}</div>
              <div className="text-xl font-semibold">{t.points || 'Points'}</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Thanks for watching!
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg"
            >
              {t.close || 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
