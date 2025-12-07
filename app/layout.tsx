import type { Metadata } from 'next';
import Header from '@/components/Header';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClickerPro - Click & Earn',
  description: 'Incremental clicker game with upgrades and shop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-gray-900 dark:via-primary-900 dark:to-secondary-900 text-gray-900 dark:text-gray-50 transition-all duration-500 ease-in-out">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}