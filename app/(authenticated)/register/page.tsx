'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Toast from '@/components/Toast';

export default function Register() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' } | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Registration is now done through Google OAuth
    setToast({
      message: 'Please use Google Sign-In to register',
      type: 'error',
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl shadow-2xl dark:shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl">🎮</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Join ClickerPro
            </h1>
            <p className="text-slate-300 text-sm">Start your clicking journey today and earn amazing rewards</p>
          </div>

          {/* Info section */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <p className="text-2xl mb-1">⚡</p>
              <p className="text-xs text-slate-300">Fast</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <p className="text-2xl mb-1">🎯</p>
              <p className="text-xs text-slate-300">Fun</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <p className="text-2xl mb-1">🏆</p>
              <p className="text-xs text-slate-300">Rewarding</p>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={() => signIn('google', { redirect: true, callbackUrl: '/' })}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-pink-500/50 transition-all duration-200 flex items-center justify-center gap-3 group active:scale-95"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>🚀 Create Account</span>
          </button>

          {/* Features list */}
          <div className="mt-8 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <p className="text-slate-300">One-click signup with Google</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <p className="text-slate-300">Instant rewards & bonuses</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <p className="text-slate-300">Join thousands of players</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-300 text-sm mt-8">
            Already a clicker?{' '}
            <Link href="/login" className="font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              Sign In
            </Link>
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