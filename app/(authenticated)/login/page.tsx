'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Toast from '@/components/Toast';

interface LoginResponse {
  token: string;
}

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' } | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      // Force a hard redirect to ensure the page refreshes
      window.location.href = '/';
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Use redirect: true to let NextAuth handle the redirect
      await signIn('google', { 
        callbackUrl: '/',
        redirect: true,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setToast({
        message: 'An error occurred during sign in.',
        type: 'error',
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Email/password login is deprecated - use Google OAuth instead
    setToast({
      message: 'Please use Google Sign-In to login',
      type: 'error',
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50/30 to-warm-50 dark:from-gray-900 dark:via-primary-900/50 dark:to-secondary-900/50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements - Soft dreamy orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-pastel-1 rounded-full mix-blend-normal filter blur-3xl opacity-40 dark:opacity-25 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-pastel-3 rounded-full mix-blend-normal filter blur-3xl opacity-40 dark:opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-pastel-4 rounded-full mix-blend-normal filter blur-3xl opacity-35 dark:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Modern glass card */}
        <div className="glass backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border-2 border-primary-200/60 dark:border-primary-700/60 rounded-3xl shadow-2xl p-10 hover:shadow-glow transition-all duration-500 card-lift">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-smooth-1 rounded-3xl mb-6 shadow-glow-lg animate-pulse-soft">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-smooth-1 bg-clip-text text-transparent mb-3 animate-gradient">
              ClickerPro
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base">Welcome back! Let's continue your journey 🚀</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 glass bg-white/60 dark:bg-gray-800/60 border-2 border-primary-200/50 dark:border-primary-700/50 rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-300"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 glass bg-white/60 dark:bg-gray-800/60 border-2 border-primary-200/50 dark:border-primary-700/50 rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 ${
                loading
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-smooth-1 hover:shadow-glow text-white shadow-lg hover-scale active:scale-95'
              }`}
            >
              {loading ? '🔄 Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 glass bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400 text-sm font-bold backdrop-blur-sm rounded-full">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full py-4 px-6 border-2 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 group ${
              loading
                ? 'glass bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
                : 'glass bg-white/60 dark:bg-gray-800/60 border-primary-200 dark:border-primary-700 text-gray-800 dark:text-white hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-glow hover-scale'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google Sign In</span>
              </>
            )}
          </button>

          {/* Footer */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-base mt-8">
            New to ClickerPro?{' '}
            <Link href="/register" className="font-bold bg-gradient-smooth-1 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              Create account →
            </Link>
          </p>
        </div>

        {/* Floating card info */}
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p className="flex items-center justify-center gap-3 flex-wrap">
            <span>🔒 Secure</span> • <span>🚀 Fast</span> • <span>✨ Beautiful</span>
          </p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
