'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      // Check admin status
      const checkAdmin = async () => {
        try {
          const response = await fetch('/api/admin/check');
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } catch (error) {
          console.error('Failed to check admin status:', error);
        }
      };
      checkAdmin();
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 glass backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border-b-2 border-primary-200/60 dark:border-primary-700/60 shadow-lg">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-smooth-1 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-500 group-hover:scale-110 animate-pulse-soft">
            <span className="text-3xl">✨</span>
          </div>
          <span className="text-3xl font-bold bg-gradient-smooth-1 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 animate-gradient">
            ClickerPro
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {session ? (
            <>
              <Link
                href="/stats"
                className="px-5 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-secondary-600 dark:hover:text-secondary-400 hover:bg-secondary-100/80 dark:hover:bg-secondary-900/50 border-2 border-transparent hover:border-secondary-300 dark:hover:border-secondary-600 transition-all duration-300 hover-scale"
              >
                📊 Stats
              </Link>
              <Link
                href="/shop"
                className="px-5 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-100/80 dark:hover:bg-primary-900/50 border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover-scale"
              >
                🛍️ Shop
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-5 py-3 rounded-xl font-bold text-sm glass bg-warm-100/80 dark:bg-warm-900/50 text-warm-700 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-300 hover:bg-warm-200/80 dark:hover:bg-warm-800/50 border-2 border-warm-300/50 dark:border-warm-600/50 hover:border-warm-500 transition-all duration-300 hover-scale"
                >
                  ⚙️ Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-3 rounded-xl font-bold text-sm bg-gradient-smooth-4 hover:shadow-glow-coral text-white shadow-lg hover:shadow-xl hover-scale active:scale-95 transition-all duration-300"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-100/80 dark:hover:bg-primary-900/50 border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover-scale"
              >
                🔓 Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-3 rounded-xl font-bold text-sm bg-gradient-smooth-1 hover:shadow-glow text-white shadow-lg hover:shadow-xl hover-scale active:scale-95 transition-all duration-300"
              >
                ✨ Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}