'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminProductManager from '@/components/AdminProductManager';
import AdminUserManager from '@/components/AdminUserManager';

type TabType = 'products' | 'users' | 'analytics';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      // Check if user is admin
      const checkAdmin = async () => {
        try {
          const response = await fetch('/api/admin/check', {
            method: 'GET',
          });
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          if (!data.isAdmin) {
            router.push('/');
          }
        } catch (error) {
          console.error('Failed to check admin status:', error);
          router.push('/');
        } finally {
          setLoading(false);
        }
      };
      checkAdmin();
    }
  }, [session, status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚙️ Admin Dashboard</h1>
          <p className="text-slate-400">Manage your store and users</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'products'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📦 Products
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'users'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Analytics
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'products' && <AdminProductManager />}
          {activeTab === 'users' && <AdminUserManager />}
          {activeTab === 'analytics' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
              <p className="text-slate-400">Analytics coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
