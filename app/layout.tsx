import type { Metadata } from 'next';
import Header from '@/components/Header';
import VPNBlocker from '@/components/VPNBlocker';
import { Providers } from './providers';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"
import NotificationPrompt from '@/components/NotificationPrompt';

export const metadata: Metadata = {
  title: 'Gamified Habit Tracker - Track Habits, Earn Rewards',
  description: 'Build better habits with gamification. Track daily habits, earn XP points, level up, and redeem rewards!',
  icons: {
    icon: [
      { url: '/RECKON.jpg', sizes: 'any' },
      { url: '/RECKON.jpg', sizes: '16x16', type: 'image/jpeg' },
      { url: '/RECKON.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/RECKON.jpg', sizes: '192x192', type: 'image/jpeg' },
      { url: '/RECKON.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/RECKON.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme Script - Runs before page renders to prevent flash */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const isDark = theme === 'dark' || 
                    (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Google AdSense - Configured for non-intrusive ads */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4681103183883079"
          crossOrigin="anonymous"
          suppressHydrationWarning
        />
        {/* Google AdSense Auto Ads - Configuration to prevent navigation interference */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined' && window.adsbygoogle) {
                  try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({
                      google_ad_client: "ca-pub-4681103183883079",
                      enable_page_level_ads: true,
                      overlays: {bottom: false, top: false} // Disable sticky anchor ads that block navigation
                    });
                  } catch (e) {}
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 text-gray-900 dark:text-gray-50 transition-all duration-500 ease-in-out">
        <Providers>
          <VPNBlocker>
            <Header />
            {children}
            
            {/* Footer with important links for AdSense compliance */}
            <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 mt-12">
              <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-cyan-600 dark:text-cyan-400">RECKON</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Transform your engagement into rewards
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400">About Us</a></li>
                      <li><a href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400">Contact</a></li>
                      <li><a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400">Privacy Policy</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Legal</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>© {new Date().getFullYear()} RECKON</li>
                      <li>All rights reserved</li>
                      <li className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        Dev: <a href="https://my-porto-eosin.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium">Hussain-Dev</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </footer>
            
            <Analytics />
            <NotificationPrompt />
          </VPNBlocker>
        </Providers>
      </body>
    </html>
  );
}