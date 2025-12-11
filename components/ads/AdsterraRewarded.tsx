"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/client';

interface RewardResponse {
  success: boolean;
  reward: number;
  cooldownSeconds: number;
  user: {
    id: string;
    points: number;
    lifetimePoints: number;
    clicks: number;
    adWatchCount: number;
  };
}

interface AdsterraRewardedProps {
  onReward?: (payload: RewardResponse['user'], reward: number) => void;
  onError?: (message: string) => void;
}

const WATCH_SECONDS = 25;
const LOCAL_KEY = 'adsterra_rewarded_last_watch';
const COOLDOWN_SECONDS = 180;
const AD_CONTAINER_ID = 'adsterra-rewarded-container';

const ADSTERRA_KEY = process.env.NEXT_PUBLIC_ADSTERRA_REWARDED_KEY;
const ADSTERRA_CUSTOM_URL = process.env.NEXT_PUBLIC_ADSTERRA_REWARDED_SCRIPT_URL;

export default function AdsterraRewarded({ onReward, onError }: AdsterraRewardedProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hasConfig = useMemo(() => Boolean(ADSTERRA_KEY || ADSTERRA_CUSTOM_URL), []);

  useEffect(() => {
    // initialize cooldown from localStorage
    if (typeof window === 'undefined') return;
    const lastWatch = localStorage.getItem(LOCAL_KEY);
    if (lastWatch) {
      const elapsed = Math.floor((Date.now() - Number(lastWatch)) / 1000);
      const remaining = COOLDOWN_SECONDS - elapsed;
      if (remaining > 0) setCooldownLeft(remaining);
    }
  }, []);

  useEffect(() => {
    if (!isWatching) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        return next < 0 ? 0 : next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isWatching]);

  const teardownTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => teardownTimers(), [teardownTimers]);

  const injectAdsterra = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    if (!hasConfig) {
      setStatus('Adsterra key not configured');
      return;
    }

    if (typeof window === 'undefined') return;

    if (ADSTERRA_KEY) {
      (window as unknown as Record<string, unknown>).atOptions = {
        key: ADSTERRA_KEY,
        format: 'iframe',
        height: 250,
        width: 300,
        params: {},
      };
      const script = document.createElement('script');
      script.src = `https://www.highperformanceformat.com/${ADSTERRA_KEY}/invoke.js`;
      script.async = true;
      script.onerror = () => setStatus('Failed to load Adsterra creative');
      containerRef.current?.appendChild(script);
    } else if (ADSTERRA_CUSTOM_URL) {
      const script = document.createElement('script');
      script.src = ADSTERRA_CUSTOM_URL;
      script.async = true;
      script.onerror = () => setStatus('Failed to load Adsterra creative');
      containerRef.current?.appendChild(script);
    }
  }, [hasConfig, ADSTERRA_CUSTOM_URL, ADSTERRA_KEY]);

  const claimReward = useCallback(async () => {
    setIsClaiming(true);
    setStatus('Claiming reward...');
    try {
      const data = await apiFetch<RewardResponse>('/ads/rewarded', {
        method: 'POST',
        body: JSON.stringify({ completed: true }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_KEY, `${Date.now()}`);
        setCooldownLeft(data.cooldownSeconds);
      }

      setStatus(`+${data.reward} points added`);
      onReward?.(data.user, data.reward);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to grant reward';
      setStatus(message);
      onError?.(message);
    } finally {
      setIsClaiming(false);
      setIsWatching(false);
      setSecondsLeft(WATCH_SECONDS);
    }
  }, [onReward, onError]);

  const startWatching = useCallback(() => {
    if (!hasConfig) {
      const message = 'Set NEXT_PUBLIC_ADSTERRA_REWARDED_KEY or NEXT_PUBLIC_ADSTERRA_REWARDED_SCRIPT_URL';
      setStatus(message);
      onError?.(message);
      return;
    }

    if (cooldownLeft > 0) {
      const message = `Please wait ${cooldownLeft}s before the next rewarded ad.`;
      setStatus(message);
      onError?.(message);
      return;
    }

    setIsWatching(true);
    setSecondsLeft(WATCH_SECONDS);
    setStatus('Playing rewarded ad...');
    injectAdsterra();

    timerRef.current = setTimeout(() => {
      setStatus('Finished! Claiming reward...');
      claimReward();
    }, WATCH_SECONDS * 1000);
  }, [cooldownLeft, hasConfig, injectAdsterra, claimReward, onError]);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const cooldownTimer = setInterval(() => {
      setCooldownLeft((prev) => (prev - 1 < 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(cooldownTimer);
  }, [cooldownLeft]);

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-700/40 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-amber-950/50 dark:to-slate-900 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-600 dark:text-amber-300 font-semibold">Rewarded Ad</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">Watch an Adsterra video and earn points</p>
          </div>
        </div>
        <div className="text-xs bg-white/70 dark:bg-slate-800/60 border border-amber-200/70 dark:border-amber-700/50 rounded-full px-3 py-1 text-amber-700 dark:text-amber-200">
          +25 points
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-amber-200 dark:border-amber-700/50 bg-white/80 dark:bg-slate-900/70 p-3 mb-3">
        <div ref={containerRef} id={AD_CONTAINER_ID} className="min-h-[260px] flex items-center justify-center text-amber-700 dark:text-amber-100 text-sm">
          {hasConfig ? 'Tap play to load the ad' : 'Configure your Adsterra key to enable rewarded ads'}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {isWatching ? `Ad playing... ${secondsLeft}s left` : cooldownLeft > 0 ? `Cooldown: ${cooldownLeft}s` : status || 'Ready to watch and earn'}
        </div>
        <button
          type="button"
          onClick={startWatching}
          disabled={isWatching || isClaiming || cooldownLeft > 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold shadow hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isWatching ? 'Playing...' : isClaiming ? 'Claiming...' : cooldownLeft > 0 ? 'On Cooldown' : 'Watch & Earn'}
        </button>
      </div>
    </div>
  );
}
