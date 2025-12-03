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
      <body className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}