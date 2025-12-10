import type { Metadata } from 'next';
import Header from '@/components/Header';
import { Providers } from './providers';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'ClickVault - Earn Rewards',
  description: 'Transform your clicks into rewards with our modern earning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Theme Script - Runs before page renders to prevent flash */}
        <script
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
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4681103183883079"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 text-gray-900 dark:text-gray-50 transition-all duration-500 ease-in-out">
        <Providers>
          <Header />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}