/**
 * Ad utilities and helpers
 * Helper functions for ad-related operations
 */

import adManager from './ad-manager';

// Extend Window interface for AdSense
declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

/**
 * Check if ads should be shown to user
 */
export async function shouldShowAds(): Promise<boolean> {
  try {
    const hasAdBlocker = await adManager.detectAdBlocker();
    const userPreference = adManager.shouldShowAds();
    return !hasAdBlocker && userPreference;
  } catch (error) {
    console.warn('Error checking ad display:', error);
    return true; // Default to showing ads
  }
}

/**
 * Get ad size based on viewport width
 */
export function getAdSizeForViewport(viewportWidth: number = 0): {
  width: number;
  height: number;
  format: string;
} {
  const width = viewportWidth || (typeof window !== 'undefined' ? window.innerWidth : 0);

  if (width < 480) {
    return { width: 320, height: 50, format: 'mobile-banner' };
  } else if (width < 768) {
    return { width: 300, height: 250, format: 'tablet-rectangle' };
  } else if (width < 1024) {
    return { width: 728, height: 90, format: 'desktop-leaderboard' };
  } else {
    return { width: 970, height: 250, format: 'desktop-wide' };
  }
}

/**
 * Format CPM/CPV values for display
 */
export function formatAdRevenue(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Calculate CTR (Click-Through Rate)
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

/**
 * Calculate CPM (Cost Per Mille/Thousand)
 */
export function calculateCPM(revenue: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (revenue / impressions) * 1000;
}

/**
 * Calculate CPC (Cost Per Click)
 */
export function calculateCPC(revenue: number, clicks: number): number {
  if (clicks === 0) return 0;
  return revenue / clicks;
}

/**
 * Get ad performance grade
 */
export function getAdGrade(ctr: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (ctr >= 2.0) return 'A';
  if (ctr >= 1.5) return 'B';
  if (ctr >= 1.0) return 'C';
  if (ctr >= 0.5) return 'D';
  return 'F';
}

/**
 * Wait for AdSense to be available
 */
export async function waitForAdSense(timeout: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

/**
 * Trigger ad refresh
 */
export function refreshAds(): void {
  try {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adManager.trackEvent({
        type: 'load',
        network: 'adsense',
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.warn('Ad refresh error:', error);
    adManager.trackEvent({
      type: 'error',
      network: 'adsense',
      timestamp: Date.now(),
    });
  }
}

/**
 * Set user ad preference
 */
export function setAdPreference(noAds: boolean): void {
  if (typeof window !== 'undefined') {
    if (noAds) {
      localStorage.setItem('user_no_ads', 'true');
    } else {
      localStorage.removeItem('user_no_ads');
    }
  }
}

/**
 * Get user ad preference
 */
export function getAdPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('user_no_ads') === 'true';
}

/**
 * Get ad metrics summary
 */
export function getAdMetricsSummary(): {
  totalImpressions: number;
  totalClicks: number;
  totalErrors: number;
  totalRevenue: number;
  avgCTR: number;
  avgCPM: number;
} {
  const adsense = adManager.getMetrics('adsense') as any;

  const totalImpressions = adsense.impressions;
  const totalClicks = adsense.clicks;
  const totalErrors = adsense.errors;
  const totalRevenue = adsense.revenue;

  return {
    totalImpressions,
    totalClicks,
    totalErrors,
    totalRevenue,
    avgCTR: calculateCTR(totalClicks, totalImpressions),
    avgCPM: calculateCPM(totalRevenue, totalImpressions),
  };
}

/**
 * Generate ad report
 */
export function generateAdReport(): string {
  const summary = getAdMetricsSummary();
  const adsense = adManager.getMetrics('adsense') as any;

  return `
Ad Performance Report
=====================

OVERALL METRICS (GOOGLE ADSENSE)
---------------
Total Impressions: ${summary.totalImpressions}
Total Clicks: ${summary.totalClicks}
Click-Through Rate: ${summary.avgCTR.toFixed(2)}%
Average CPM: ${formatAdRevenue(summary.avgCPM * 100)}
Total Revenue: ${formatAdRevenue(summary.totalRevenue)}
Performance Grade: ${getAdGrade(summary.avgCTR)}

DETAILS
--------------
Impressions: ${adsense.impressions}
Clicks: ${adsense.clicks}
CTR: ${calculateCTR(adsense.clicks, adsense.impressions).toFixed(2)}%
CPM: ${formatAdRevenue(calculateCPM(adsense.revenue, adsense.impressions) * 100)}
Revenue: ${formatAdRevenue(adsense.revenue)}
Errors: ${adsense.errors}

Generated: ${new Date().toISOString()}
`;
}

/**
 * Log ad report to console
 */
export function logAdReport(): void {
  console.log(generateAdReport());
}

/**
 * Export ad metrics as JSON
 */
export function exportAdMetrics(): string {
  return JSON.stringify(
    {
      metrics: adManager.getMetrics(),
      summary: getAdMetricsSummary(),
      events: adManager.getEvents(50),
      timestamp: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * Download ad metrics as JSON file
 */
export function downloadAdMetrics(): void {
  if (typeof window === 'undefined') return;

  const data = exportAdMetrics();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ad-metrics-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
