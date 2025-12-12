'use client';

/**
 * Ad Block Detector Component
 * 
 * Detects if the user has an ad blocker enabled and shows a friendly message.
 * This helps users understand why ads aren't showing and encourages them to disable ad blockers.
 */

import { useEffect, useState } from 'react';

export default function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Method 1: Try to load a known ad script
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox adsbygoogle ad-placement';
        testAd.style.cssText = 'position:absolute;top:-1px;left:-1px;width:1px;height:1px;';
        document.body.appendChild(testAd);

        await new Promise(resolve => setTimeout(resolve, 100));

        const isBlocked = testAd.offsetHeight === 0 || testAd.clientHeight === 0;
        
        if (testAd.parentNode) {
          document.body.removeChild(testAd);
        }

        // Method 2: Check if AdSense script loaded
        const adSenseBlocked = typeof window.adsbygoogle === 'undefined' || 
                               !(window.adsbygoogle as any)?.loaded;

        setAdBlockDetected(isBlocked || adSenseBlocked);
      } catch (error) {
        // If error, assume ad blocker might be present
        setAdBlockDetected(true);
      }
    };

    // Run detection after a short delay to let page load
    const timer = setTimeout(detectAdBlock, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!adBlockDetected || !showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 border-l-4 border-yellow-500 dark:border-yellow-600 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">⚠️</span>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                Ad Blocker Detected
              </h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              We noticed you&apos;re using an ad blocker. Please disable it to:
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
              <li>✓ Support this free platform</li>
              <li>✓ Unlock all earning features</li>
              <li>✓ Maximize your reward potential</li>
            </ul>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          I&apos;ve Disabled My Ad Blocker - Reload
        </button>
      </div>
    </div>
  );
}
