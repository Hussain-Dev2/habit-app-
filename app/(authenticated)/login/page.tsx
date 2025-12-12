'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Loader from '@/components/Loader';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // If already authenticated, redirect to home
    if (status === 'authenticated') {
      window.location.href = '/';
      return;
    }

    // Automatically trigger Google sign-in
    if (status === 'unauthenticated') {
      signIn('google', { 
        callbackUrl: '/',
        redirect: true,
      });
    }
  }, [status, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50/30 to-cyan-100 dark:from-gray-900 dark:via-cyan-950/50 dark:to-orange-950/50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6">
        <Loader size="lg" color="cyan" />
        <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">
          Redirecting to Google Sign-In...
        </p>
      </div>
    </main>
  );
}
