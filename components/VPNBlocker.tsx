'use client';

/**
 * VPN Blocker Component
 * 
 * Detects if the user is using a VPN/Proxy and blocks access to the application.
 * Shows a warning page with instructions to disable VPN.
 * Automatically re-checks every 5 seconds.
 */

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Loader from './Loader';

interface VPNBlockerProps {
  children: React.ReactNode;
}

export default function VPNBlocker({ children }: VPNBlockerProps) {
  const { t, isArabic } = useLanguage();
  const [isChecking, setIsChecking] = useState(true);
  const [isVPN, setIsVPN] = useState(false);
  const [vpnInfo, setVpnInfo] = useState<{
    provider?: string;
    riskScore: number;
  } | null>(null);

  const checkVPN = async (bypassCache = false) => {
    try {
      // Add cache-busting parameter to force fresh check when retrying
      const url = bypassCache ? `/api/vpn-check?bypass=${Date.now()}` : '/api/vpn-check';
      const response = await fetch(url, {
        cache: 'no-store', // Prevent browser caching
      });
      const data = await response.json();
      
      // Only block if VPN is detected AND risk score is high
      // This prevents false positives from blocking legitimate users
      const shouldBlock = (data.isVPN || data.isProxy) && data.riskScore > 0.7;
      
      setIsVPN(shouldBlock);
      setVpnInfo({
        provider: data.provider,
        riskScore: data.riskScore,
      });
    } catch (error) {
      console.error('VPN check failed:', error);
      // On error, allow access (fail-safe)
      setIsVPN(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkVPN();
    
    // Re-check every 5 seconds if VPN is detected
    const interval = setInterval(() => {
      if (isVPN) {
        checkVPN();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isVPN]);

  // Show loader while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
        <Loader />
      </div>
    );
  }

  // Block access if VPN detected
  if (isVPN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center" dir={isArabic ? 'rtl' : 'ltr'}>
          {/* Warning Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30">
              <svg 
                className="w-12 h-12 text-red-600 dark:text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? '🚫 تم اكتشاف VPN' : '🚫 VPN Detected'}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {isArabic 
              ? 'يرجى إيقاف تشغيل VPN أو البروكسي للوصول إلى التطبيق. نحن نمنع استخدام VPN لمنع إساءة الاستخدام والاحتيال.'
              : 'Please disable your VPN or proxy to access the application. We block VPN usage to prevent abuse and fraud.'
            }
          </p>

          {/* VPN Info */}
          {vpnInfo?.provider && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? 'مزود الخدمة المكتشف:' : 'Detected Provider:'} 
                <span className="font-semibold text-gray-900 dark:text-white ml-2">
                  {vpnInfo.provider}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {isArabic ? 'مستوى الخطر:' : 'Risk Score:'} 
                <span className="font-semibold text-red-600 dark:text-red-400 ml-2">
                  {vpnInfo.riskScore}/100
                </span>
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6 text-left" dir={isArabic ? 'rtl' : 'ltr'}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              {isArabic ? '📋 كيفية إيقاف VPN:' : '📋 How to disable VPN:'}
            </h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="font-semibold mr-2 ml-2">1.</span>
                {isArabic 
                  ? 'افتح تطبيق VPN الخاص بك'
                  : 'Open your VPN application'
                }
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2 ml-2">2.</span>
                {isArabic 
                  ? 'انقر على زر "قطع الاتصال" أو "إيقاف"'
                  : 'Click "Disconnect" or "Stop" button'
                }
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2 ml-2">3.</span>
                {isArabic 
                  ? 'انتظر بضع ثوانٍ - سيتم إعادة التحقق تلقائيًا'
                  : 'Wait a few seconds - this page will auto-refresh'
                }
              </li>
            </ol>
          </div>

          {/* Retry Button */}
          <button
            onClick={() => checkVPN(true)}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            {isArabic ? '🔄 إعادة المحاولة الآن' : '🔄 Retry Now'}
          </button>

          {/* Auto-check indicator */}
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {isArabic 
              ? 'يتم إعادة التحقق تلقائيًا كل 5 ثوانٍ...'
              : 'Auto-checking every 5 seconds...'
            }
          </p>
        </div>
      </div>
    );
  }

  // VPN not detected - render children
  return <>{children}</>;
}
