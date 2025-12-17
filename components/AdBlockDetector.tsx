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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Ad Blocker Detected</h3>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We noticed that you are using an ad blocker. While we understand the desire for an ad-free experience, our platform relies entirely on advertising revenue to maintain our services and provide free features to our community.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
              Please consider disabling your ad blocker to help us:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <span className="text-green-500">✓</span> Keep this platform free for everyone
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <span className="text-green-500">✓</span> Support continuous development
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <span className="text-green-500">✓</span> Maintain server performance
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              I've Disabled It - Reload Page
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Continue with Ad Blocker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
