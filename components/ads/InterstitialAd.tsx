'use client';

/**
 * Interstitial Ad Component
 * Full-screen ads that appear at strategic moments
 */

import { useEffect, useRef } from 'react';

interface InterstitialAdProps {
  onClose?: () => void;
}

export default function InterstitialAd({ onClose }: InterstitialAdProps) {
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    // Adsterra Popunder/Interstitial Ad - ID: 28139013
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : '28139013',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    `;
    document.body.appendChild(script);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.topcreativeformat.com/28139013/invoke.js';
    document.body.appendChild(invokeScript);

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (script.parentNode) document.body.removeChild(script);
      if (invokeScript.parentNode) document.body.removeChild(invokeScript);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-4xl w-full mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold z-10"
        >
          ✕
        </button>

        {/* Ad container */}
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div id="interstitial-ad-container" className="w-full flex justify-center">
            {/* Adsterra ad will load here */}
          </div>
          
          {/* Fallback Google AdSense */}
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-4681103183883079"
            data-ad-slot="YOUR_SLOT_ID"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        {/* Skip button appears after 3 seconds */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            إعلان - سيتم الإغلاق تلقائياً
          </p>
        </div>
      </div>
    </div>
  );
}
