'use client';

import { useState, useEffect } from 'react';
import { REWARDED_AD_CONFIG, ADSTERRA_CONFIG } from '@/lib/ads/ad-config';
import { 
  canWatchRewardedAd, 
  trackAdCompletion,
  loadAdsterraScript,
  resetRewardedAdCountIfNewDay,
  getRewardedAdCount,
} from '@/lib/ads/ad-utils';
import { apiFetch } from '@/lib/client';

interface RewardedAdButtonProps {
  onRewardEarned?: (points: number) => void;
  className?: string;
}

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({ 
  onRewardEarned,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canWatch, setCanWatch] = useState(true);
  const [message, setMessage] = useState('');
  const [showAd, setShowAd] = useState(false);
  const [adsRemaining, setAdsRemaining] = useState(REWARDED_AD_CONFIG.dailyLimit);

  useEffect(() => {
    resetRewardedAdCountIfNewDay();
    const count = getRewardedAdCount();
    setAdsRemaining(REWARDED_AD_CONFIG.dailyLimit - count);

    // Check if can watch
    const result = canWatchRewardedAd();
    setCanWatch(result.allowed);
    if (result.reason) {
      setMessage(result.reason);
    }
  }, []);

  const handleWatchAd = async () => {
    setIsLoading(true);
    
    try {
      // Load Adsterra script
      if (ADSTERRA_CONFIG.enabled) {
        loadAdsterraScript(ADSTERRA_CONFIG.zonId);
        setShowAd(true);

        // Simulate ad watching (5 seconds)
        // In production, you'd use Adsterra's callback
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Process reward
        const data = await apiFetch('/api/points/reward-ad', {
          method: 'POST',
          body: JSON.stringify({
            adType: 'adsterra',
          }),
        });

        if (data && (data as any).success) {
          trackAdCompletion();
          
          const newCount = getRewardedAdCount();
          setAdsRemaining(REWARDED_AD_CONFIG.dailyLimit - newCount);
          
          setMessage(`✓ Earned ${REWARDED_AD_CONFIG.pointsReward} points!`);
          onRewardEarned?.(REWARDED_AD_CONFIG.pointsReward);

          // Check if can watch again
          const nextCheck = canWatchRewardedAd();
          setCanWatch(nextCheck.allowed);
          if (nextCheck.reason) {
            setMessage(nextCheck.reason);
          }

          // Reset message after 3 seconds
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('Failed to claim reward');
        }

        setShowAd(false);
      } else {
        setMessage('Rewarded ads not configured');
      }
    } catch (error) {
      console.error('Error processing reward:', error);
      setMessage('Error claiming reward');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={handleWatchAd}
        disabled={!canWatch || isLoading}
        className={`
          px-4 py-2 rounded-lg font-semibold transition-all
          ${canWatch 
            ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }
          ${isLoading ? 'opacity-75' : ''}
        `}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Watching Ad...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            📺 Watch Ad (+{REWARDED_AD_CONFIG.pointsReward} pts)
          </span>
        )}
      </button>

      {message && (
        <p className={`text-sm text-center ${message.includes('✓') ? 'text-green-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}

      <p className="text-xs text-gray-500 text-center">
        Ads available today: {adsRemaining}/{REWARDED_AD_CONFIG.dailyLimit}
      </p>

      {showAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold mb-4">Watch Advertisement</h3>
            <div
              id={`adsterra-zone-${ADSTERRA_CONFIG.zonId}`}
              style={{
                width: '100%',
                minHeight: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f0f0f0',
              }}
            >
              <p className="text-gray-500">Loading ad...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardedAdButton;
