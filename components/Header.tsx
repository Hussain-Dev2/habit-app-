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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 dark:bg-white/10 border-b border-blue-200/50 dark:border-white/20 shadow-sm dark:shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl">⚡</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            ClickerPro
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <ThemeToggle />
          
          {session ? (
            <>
              <Link
                href="/stats"
                className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-300 dark:text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200"
              >
                📊 Stats
              </Link>
              <Link
                href="/shop"
                className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-300 dark:text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200"
              >
                🛍️ Shop
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-yellow-300 dark:text-yellow-400 hover:text-yellow-200 hover:bg-yellow-500/20 border border-yellow-500/30 transition-all duration-200"
                >
                  ⚙️ Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-red-500/50 active:scale-95 transition-all duration-200"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200"
              >
                🔓 Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/50 active:scale-95 transition-all duration-200"
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