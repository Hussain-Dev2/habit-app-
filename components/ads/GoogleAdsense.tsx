'use client';

/**
 * Google AdSense Component
 * 
 * Displays Google AdSense ads with different formats.
 * Uses your AdSense client ID: ca-pub-4681103183883079
 * 
 * Ad Formats:
 * - display: Responsive display ad (auto-sized)
 * - in-article: In-article ad (better for content)
 * - in-feed: In-feed ad (for listings)
 * - multiplex: Multiplex ad (related content)
 */

import { useEffect, useRef } from 'react';

interface GoogleAdsenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>> & { push: (params: Record<string, unknown>) => void };
  }
}

export default function GoogleAdsense({ 
  adSlot, 
  adFormat = 'auto',
  style = {},
  className = ''
}: GoogleAdsenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Only load once per mount and wait for script to be ready
    if (isLoaded.current) return;
    
    const loadAd = () => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isLoaded.current = true;
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    };

    // Delay ad loading slightly to ensure script is ready
    const timeout = setTimeout(loadAd, 100);

    return () => {
      clearTimeout(timeout);
      isLoaded.current = false;
    };
  }, []);

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          minHeight: '90px',
          ...style
        }}
        data-ad-client="ca-pub-4681103183883079"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
