// Utility functions for ads
import { REWARDED_AD_CONFIG } from './ad-config';

// Store rewarded ad completion times in localStorage (client-side only)
export const getLastRewardedAdTime = (): number => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('lastRewardedAdTime');
  return stored ? parseInt(stored, 10) : 0;
};

export const setLastRewardedAdTime = (timestamp: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lastRewardedAdTime', timestamp.toString());
};

export const getRewardedAdCount = (): number => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('rewardedAdCount');
  return stored ? parseInt(stored, 10) : 0;
};

export const setRewardedAdCount = (count: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rewardedAdCount', count.toString());
};

export const resetRewardedAdCountIfNewDay = (): void => {
  if (typeof window === 'undefined') return;
  
  const lastReset = localStorage.getItem('rewardedAdCountLastReset');
  const today = new Date().toDateString();
  
  if (lastReset !== today) {
    setRewardedAdCount(0);
    localStorage.setItem('rewardedAdCountLastReset', today);
  }
};

// Check if user can watch another rewarded ad
export const canWatchRewardedAd = (): { allowed: boolean; reason?: string } => {
  if (typeof window === 'undefined') {
    return { allowed: false, reason: 'Not on client side' };
  }

  resetRewardedAdCountIfNewDay();

  const lastAdTime = getLastRewardedAdTime();
  const now = Date.now();
  const cooldownMs = REWARDED_AD_CONFIG.cooldownMinutes * 60 * 1000;

  if (now - lastAdTime < cooldownMs) {
    const remainingMs = cooldownMs - (now - lastAdTime);
    const remainingMins = Math.ceil(remainingMs / 60000);
    return { 
      allowed: false, 
      reason: `Wait ${remainingMins}m before next ad` 
    };
  }

  const count = getRewardedAdCount();
  if (count >= REWARDED_AD_CONFIG.dailyLimit) {
    return { 
      allowed: false, 
      reason: `Daily limit (${REWARDED_AD_CONFIG.dailyLimit}) reached` 
    };
  }

  return { allowed: true };
};

// Track ad completion
export const trackAdCompletion = (): void => {
  if (typeof window === 'undefined') return;
  
  setLastRewardedAdTime(Date.now());
  const currentCount = getRewardedAdCount();
  setRewardedAdCount(currentCount + 1);
};

// Dynamically load Google AdSense script
export const loadGoogleAdSenseScript = (clientId: string): void => {
  if (typeof window === 'undefined') return;
  
  // Check if script already loaded
  if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);

  // Push ad unit configuration
  (window as any).adsbygoogle = (window as any).adsbygoogle || [];
  (window as any).adsbygoogle.push({});
};

// Dynamically load Adsterra script
export const loadAdsterraScript = (zoneId: string): void => {
  if (typeof window === 'undefined') return;

  // Check if script already loaded
  if (document.querySelector('script[src*="adsterra.com"]')) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://ads.adsterra.com/banner/show?zoneId=${zoneId}`;
  document.head.appendChild(script);
};
