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