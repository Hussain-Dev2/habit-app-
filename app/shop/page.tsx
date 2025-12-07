'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import StoreItem from '@/components/StoreItem';
import Toast from '@/components/Toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/client';

interface Product {
  id: string;
  title: string;
  description: string;
  costPoints: number;
  stock: number;
}

export default function Shop() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([fetchProducts(), fetchUserPoints()]);
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchProducts = async () => {
    try {
      const data = await apiFetch<{ products: Product[] }>('/store/products');
      setProducts(data.products);
    } catch (error) {
      setToast({
        message: 'Failed to load products',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const data = await apiFetch<{ user: { points: number } }>('/auth/me');
      setUserPoints(data.user.points);
    } catch (error) {
      console.error('Failed to fetch user points:', error);
    }
  };

  const handleBuy = (message: string, newPoints: number) => {
    setUserPoints(newPoints);
    setToast({ message, type: 'success' });
    fetchProducts(); // Refresh stock
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-slate-300">Loading amazing products...</p>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 -left-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <div className="mb-16 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-7xl drop-shadow-lg">🏪</span>
              <h1 className="text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient drop-shadow-md">
                Shop
              </h1>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-xl mb-8 font-semibold">Spend your points on exclusive rewards</p>

            {/* Points Card */}
            <div className="inline-block backdrop-blur-xl bg-gradient-to-br from-yellow-100/80 to-amber-100/70 dark:from-yellow-900/40 dark:to-amber-800/30 border-2 border-yellow-300/70 dark:border-yellow-400/50 rounded-3xl px-10 py-6 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 card-hover">
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2 font-bold flex items-center gap-2">
                <span className="text-xl">💰</span>
                Available Points
              </p>
              <p className="text-5xl font-extrabold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                {userPoints.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <StoreItem
                    id={product.id}
                    name={product.title}
                    description={product.description}
                    cost={product.costPoints}
                    stock={product.stock}
                    onBuy={handleBuy}
                    onError={(msg) => setToast({ message: msg, type: 'error' })}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 backdrop-blur-xl bg-white/60 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-3xl">
              <p className="text-8xl mb-6 animate-bounce-soft drop-shadow-lg">📭</p>
              <p className="text-slate-700 dark:text-slate-300 text-2xl font-bold mb-2">No products available</p>
              <p className="text-slate-600 dark:text-slate-400 text-base font-medium">Check back soon for amazing deals!</p>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}