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
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 glass backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border-b-2 border-primary-200/60 dark:border-primary-700/60 shadow-lg">
      {/* Absolute Profile Corner Button */}


      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between relative">
        {/* Logo */}
        {/* Logo / User Avatar */}
        <Link href={session ? "/profile" : "/"} className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-glow group-hover:shadow-glow-lg transition-all duration-500 group-hover:scale-110 ring-2 ring-white/50 dark:ring-gray-700/50">
            {session ? (
              <img 
                src={(session.user as any).avatarImage || session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}&background=random`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <img src="/RECKON.jpg" alt="RECKON" className="w-full h-full object-cover" />
            )}
          </div>
          <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-aurora bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 animate-gradient">
            RECKON
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-100/80 dark:hover:bg-cyan-900/50 border-2 border-transparent hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300 hover-scale"
          >
            ⚙️ {t.settings}
          </button>
          
          {session ? (
            <>
              <Link
                href="/habits"
                className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover-scale"
              >
                📌 {t.habits}
              </Link>
              <Link
                href="/templates"
                className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover-scale"
              >
                🎁 {t.templates || 'Templates'}
              </Link>


              <Link
                href="/leaderboard"
                className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/50 border-2 border-transparent hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-300 hover-scale"
              >
                🏆 {t.leaderboard}
              </Link>
              <Link
                href="/community"
                className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100/80 dark:hover:bg-green-900/50 border-2 border-transparent hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover-scale"
              >
                💬 {t.community}
              </Link>
              <Link
                href="/recommendations"
                className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-100/80 dark:hover:bg-pink-900/50 border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-600 transition-all duration-300 hover-scale"
              >
                🎯 {t.recommendations}
              </Link>
              <Link
                href="/shop"
                className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-100/80 dark:hover:bg-primary-900/50 border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover-scale"
              >
                🛍️ {t.shop}
              </Link>
              <Link
                href="/notifications-settings"
                className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover-scale"
              >
                🔔 {t.notifications || 'Notifications'}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-xl font-bold text-sm glass bg-warm-100/80 dark:bg-warm-900/50 text-warm-700 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-300 hover:bg-warm-200/80 dark:hover:bg-warm-800/50 border-2 border-warm-300/50 dark:border-warm-600/50 hover:border-warm-500 transition-all duration-300 hover-scale"
                >
                  🛡️ {t.admin}
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100/80 dark:hover:bg-red-900/50 border-2 border-transparent hover:border-red-300 dark:hover:border-red-600 transition-all duration-300 hover-scale"
              >
                � {t.logout || 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-100/80 dark:hover:bg-primary-900/50 border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover-scale"
              >
                🔓 {t.login}
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 rounded-xl font-bold text-sm bg-gradient-aurora hover:shadow-glow text-white shadow-lg hover:shadow-xl hover-scale active:scale-95 transition-all duration-300"
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
        <div className="lg:hidden fixed inset-x-0 top-[60px] sm:top-[72px] bottom-0 z-40 glass backdrop-blur-3xl bg-white/95 dark:bg-gray-900/95 border-t border-primary-200/60 dark:border-primary-700/60 overflow-y-auto animate-slide-in-top">
          <div className="px-4 py-6 space-y-3">

            <Link
              href="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 transition-all"
            >
              🎁 {t.templates || 'Templates'}
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/50 transition-all"
            >
              🏆 {t.leaderboard}
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-green-100/80 dark:hover:bg-green-900/50 transition-all"
            >
              💬 {t.community}
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-cyan-100/80 dark:hover:bg-cyan-900/50 transition-all"
            >
              👤 {(t as any).profile || 'Profile'}
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-primary-100/80 dark:hover:bg-primary-900/50 transition-all"
            >
              🛍️ {t.shop}
            </Link>
            <Link
              href="/notifications-settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm glass bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 transition-all"
            >
              🔔 {t.notifications || 'Notifications'}
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