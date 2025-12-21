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
        if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
          // Check if container has width before loading ad
          const width = adRef.current.offsetWidth;
          if (width > 0) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isLoaded.current = true;
          } else {
            // Retry after a short delay if width is 0
            setTimeout(loadAd, 200);
          }
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    };

    // Delay ad loading to ensure container is rendered with dimensions
    const timeout = setTimeout(loadAd, 300);

    return () => {
      clearTimeout(timeout);
      isLoaded.current = false;
    };
  }, []);

  return (
    <div className={`w-full flex flex-col items-center my-8 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50 ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 font-medium select-none border px-2 py-0.5 rounded border-gray-200 dark:border-gray-600">
        Google Advertisement
      </span>
      <div className="w-full flex justify-center overflow-hidden min-h-[90px]">
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
    </div>
  );
}
