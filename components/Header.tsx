'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import SettingsModal from './SettingsModal';
import { apiFetch } from '@/lib/client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      
      // Fetch unread notifications count
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchUnreadCount = async () => {
    try {
      const notifications = await apiFetch<any[]>('/notifications');
      setUnreadCount(notifications.filter(n => !n.isRead).length);
    } catch (error) {
      // Silently fail
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 glass backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border-b-2 border-primary-200/60 dark:border-primary-700/60 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-aurora rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-500 group-hover:scale-110 animate-pulse-soft">
            <span className="text-2xl sm:text-3xl">✨</span>
          </div>
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-aurora bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 animate-gradient">
            ClickVault
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-5 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-100/80 dark:hover:bg-cyan-900/50 border-2 border-transparent hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300 hover-scale"
          >
            ⚙️ {t.settings}
          </button>
          
          {session ? (
            <>
              <Link
                href="/inbox"
                className="relative px-5 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-100/80 dark:hover:bg-orange-900/50 border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 hover-scale"
              >
                🔔 {t.inbox}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/stats"
                className="px-5 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 border-2 border-transparent hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover-scale"
              >
                📊 {t.stats}
              </Link>
              <Link
                href="/shop"
                className="px-5 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-100/80 dark:hover:bg-primary-900/50 border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover-scale"
              >
                🛍️ {t.shop}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-5 py-3 rounded-xl font-bold text-sm glass bg-warm-100/80 dark:bg-warm-900/50 text-warm-700 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-300 hover:bg-warm-200/80 dark:hover:bg-warm-800/50 border-2 border-warm-300/50 dark:border-warm-600/50 hover:border-warm-500 transition-all duration-300 hover-scale"
                >
                  🛡️ {t.admin}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-3 rounded-xl font-bold text-sm bg-gradient-smooth-4 text-white shadow-lg hover:shadow-xl hover-scale active:scale-95 transition-all duration-300"
              >
                👋 {t.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-100/80 dark:hover:bg-primary-900/50 border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover-scale"
              >
                🔓 {t.login}
              </Link>
              <Link
                href="/register"
                className="px-5 py-3 rounded-xl font-bold text-sm bg-gradient-aurora hover:shadow-glow text-white shadow-lg hover:shadow-xl hover-scale active:scale-95 transition-all duration-300"
              >
                ✨ {t.register}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
          >
            ⚙️
          </button>
          {session && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
          {!session && (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-2 rounded-xl font-bold text-xs glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              >
                🔓 Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 rounded-xl font-bold text-xs bg-gradient-smooth-1 text-white shadow-lg"
              >
                ✨ Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {session && mobileMenuOpen && (
        <div className="lg:hidden glass backdrop-blur-2xl bg-white/95 dark:bg-gray-900/95 border-t border-primary-200/60 dark:border-primary-700/60">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/inbox"
              onClick={() => setMobileMenuOpen(false)}
              className="relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 transition-all"
            >
              📬 {t.inbox}
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/stats"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-secondary-100/80 dark:hover:bg-secondary-900/50 transition-all"
            >
              📊 {t.stats}
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-primary-100/80 dark:hover:bg-primary-900/50 transition-all"
            >
              🛍️ {t.shop}
            </Link>
            <Link
              href="/purchases"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 transition-all"
            >
              📜 {t.purchases}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-warm-100/80 dark:bg-warm-900/50 text-warm-700 dark:text-warm-400 transition-all"
              >
                ⚙️ {t.admin}
              </Link>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-gradient-smooth-4 text-white shadow-lg transition-all"
            >
              🚪 {t.logout}
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </header>
  );
}