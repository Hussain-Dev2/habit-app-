/**
 * Ad Manager - Centralized ad system management
 * Handles ad lifecycle, caching, refresh, and analytics
 */

interface AdEvent {
  type: 'impression' | 'click' | 'error' | 'load' | 'revenue';
  network: 'adsense';
  slotId?: string;
  timestamp: number;
  value?: number;
}

interface AdMetrics {
  impressions: number;
  clicks: number;
  errors: number;
  revenue: number;
  lastRefresh: number;
}

class AdManager {
  private static instance: AdManager;
  private events: AdEvent[] = [];
  private metrics: Map<string, AdMetrics> = new Map();
  private adRefreshIntervals: Map<string, NodeJS.Timeout> = new Map();
  private adBlocked = false;
  private adBlockCheckDone = false;

  private constructor() {
    this.initializeMetrics();
  }

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  private initializeMetrics(): void {
    this.metrics.set('adsense', { impressions: 0, clicks: 0, errors: 0, revenue: 0, lastRefresh: 0 });
  }

  /**
   * Track ad events for analytics
   */
  trackEvent(event: AdEvent): void {
    this.events.push(event);
    const metrics = this.metrics.get(event.network);
    if (metrics) {
      if (event.type === 'impression') metrics.impressions++;
      if (event.type === 'click') metrics.clicks++;
      if (event.type === 'error') metrics.errors++;
      if (event.type === 'revenue' && event.value) metrics.revenue += event.value;
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Ad Manager] ${event.type.toUpperCase()} - ${event.network}`, event);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(network?: 'adsense'): AdMetrics | Map<string, AdMetrics> {
    if (network) {
      return this.metrics.get(network) || { impressions: 0, clicks: 0, errors: 0, revenue: 0, lastRefresh: 0 };
    }
    return this.metrics;
  }

  /**
   * Detect if ad blocker is active
   */
  async detectAdBlocker(): Promise<boolean> {
    if (this.adBlockCheckDone) {
      return this.adBlocked;
    }

    try {
      // Test 1: Check if Google AdSense script elements are present
      const bait = document.createElement('div');
      bait.className = 'adsbygoogle';
      bait.style.display = 'none';
      document.body.appendChild(bait);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (getComputedStyle(bait).display === 'none' && bait.offsetHeight === 0) {
        this.adBlocked = true;
      }

      document.body.removeChild(bait);

      // Test 2: Check for ad request fetch blocking
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);
      
      try {
        const response = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (error) {
        this.adBlocked = true;
        clearTimeout(timeout);
      }

      this.adBlockCheckDone = true;
      return this.adBlocked;
    } catch (error) {
      console.warn('[Ad Manager] Ad blocker detection failed:', error);
      this.adBlockCheckDone = true;
      return this.adBlocked;
    }
  }

  /**
   * Setup ad refresh for a container
   */
  setupAdRefresh(
    containerId: string,
    refreshCallback: () => void,
    intervalSeconds: number = 60
  ): void {
    // Clear existing interval if any
    if (this.adRefreshIntervals.has(containerId)) {
      clearInterval(this.adRefreshIntervals.get(containerId)!);
    }

    // Setup new interval (only in production to avoid development issues)
    if (process.env.NODE_ENV === 'production') {
      const interval = setInterval(() => {
        refreshCallback();
        this.trackEvent({
          type: 'load',
          network: 'adsense',
          timestamp: Date.now(),
        });
      }, intervalSeconds * 1000);

      this.adRefreshIntervals.set(containerId, interval);
    }
  }

  /**
   * Clean up refresh intervals
   */
  clearAdRefresh(containerId: string): void {
    const interval = this.adRefreshIntervals.get(containerId);
    if (interval) {
      clearInterval(interval);
      this.adRefreshIntervals.delete(containerId);
    }
  }

  /**
   * Get optimal ad size for viewport
   */
  getOptimalAdSize(): {width: number; height: number; format: string} {
    if (typeof window === 'undefined') {
      return { width: 300, height: 250, format: 'rectangle' };
    }

    const width = window.innerWidth;
    
    if (width < 480) {
      // Mobile: Banner
      return { width: 320, height: 50, format: 'banner' };
    } else if (width < 768) {
      // Tablet: Medium Rectangle
      return { width: 300, height: 250, format: 'rectangle' };
    } else {
      // Desktop: Large Rectangle or Wide Skyscraper
      return { width: 728, height: 90, format: 'leaderboard' };
    }
  }

  /**
   * Check if user has ad-free status or preference
   */
  shouldShowAds(): boolean {
    if (typeof window === 'undefined') return true;
    
    // Check localStorage for user preference
    const noAds = localStorage.getItem('user_no_ads') === 'true';
    return !noAds && !this.adBlocked;
  }

  /**
   * Get all events for debugging
   */
  getEvents(limit: number = 100): AdEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear all analytics data
   */
  clearAnalytics(): void {
    this.events = [];
    this.initializeMetrics();
  }
}

export default AdManager.getInstance();
