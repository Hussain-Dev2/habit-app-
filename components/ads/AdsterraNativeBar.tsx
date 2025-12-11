'use client';

/**
 * Adsterra Native Bar Ad Component
 * 
 * Displays a native bar ad from Adsterra network.
 * This is a non-intrusive ad format that appears as a bar.
 */

import { useEffect } from 'react';

// Global flag to prevent duplicate script loading
let scriptLoaded = false;

export default function AdsterraNativeBar() {
  useEffect(() => {
    // Only run on client side and load script once globally
    if (typeof window === 'undefined' || scriptLoaded) return;

    // Check if script already exists in the document
    const existingScript = document.querySelector(
      'script[src*="233a167aa950834c2307f2f53e2c8726"]'
    );
    
    if (existingScript) {
      scriptLoaded = true;
      return;
    }

    // Create and inject the Adsterra script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl28232367.effectivegatecpm.com/233a167aa950834c2307f2f53e2c8726/invoke.js';
    
    script.onerror = () => {
      console.warn('Adsterra Native Bar ad failed to load');
      scriptLoaded = false;
    };
    
    script.onload = () => {
      scriptLoaded = true;
    };
    
    document.body.appendChild(script);
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-4">
      <div 
        id="container-233a167aa950834c2307f2f53e2c8726"
        className="w-full min-h-[90px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
      >
        {/* Fallback content while ad loads */}
        <span className="text-xs text-gray-400">Advertisement</span>
      </div>
    </div>
  );
}
