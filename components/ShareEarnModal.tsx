'use client';

/**
 * Share & Earn Modal
 * 
 * Allows users to share their referral link and track referrals.
 * Users earn 100 points for each person who signs up using their link.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client';

interface ShareEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  referralEarnings: number;
}

export default function ShareEarnModal({ isOpen, onClose }: ShareEarnModalProps) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReferralLink();
    }
  }, [isOpen]);

  const fetchReferralLink = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<ReferralData>('/referral/link');
      setReferralData(data);
    } catch (error) {
      console.error('Failed to fetch referral link:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralData) return;
    
    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareVia = (platform: string) => {
    if (!referralData) return;

    const text = `Join ClickVault and start earning rewards! Use my link: ${referralData.referralLink}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(referralData.referralLink);

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎁</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Share & Earn
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Invite friends, earn rewards!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your referral link...</p>
          </div>
        ) : referralData ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {referralData.totalReferrals}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Referrals</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {referralData.referralEarnings}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Points Earned</p>
              </div>
            </div>

            {/* Reward Info */}
            <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-2 border-orange-300 dark:border-orange-600 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💰</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Earn 100 Points</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    For every friend who signs up!
                  </p>
                </div>
              </div>
            </div>

            {/* Referral Code */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Referral Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralData.referralCode}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-lg font-mono text-center text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Referral Link */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Referral Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralData.referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white overflow-hidden text-ellipsis"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold transition-colors whitespace-nowrap"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Share via
              </label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => shareVia('whatsapp')}
                  className="flex flex-col items-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-xs font-semibold">WhatsApp</span>
                </button>

                <button
                  onClick={() => shareVia('twitter')}
                  className="flex flex-col items-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="text-xs font-semibold">Twitter</span>
                </button>

                <button
                  onClick={() => shareVia('facebook')}
                  className="flex flex-col items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs font-semibold">Facebook</span>
                </button>

                <button
                  onClick={() => shareVia('telegram')}
                  className="flex flex-col items-center gap-2 p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="text-xs font-semibold">Telegram</span>
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">How it works:</h3>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-500">1.</span>
                  <span>Share your unique referral link with friends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-500">2.</span>
                  <span>They sign up using your link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-500">3.</span>
                  <span>You earn 100 points instantly!</span>
                </li>
              </ol>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Failed to load referral data</p>
            <button
              onClick={fetchReferralLink}
              className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
