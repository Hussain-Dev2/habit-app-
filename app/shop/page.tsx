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
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">🏪</span>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Shop
              </h1>
            </div>
            <p className="text-slate-300 text-lg mb-6">Spend your points on exclusive rewards</p>

            {/* Points Card */}
            <div className="inline-block backdrop-blur-xl bg-white/60 dark:bg-white/10 border border-blue-200/50 dark:border-white/20 rounded-2xl px-8 py-4 shadow-lg dark:shadow-lg hover:shadow-xl transition-shadow duration-300">
              <p className="text-slate-300 text-sm mb-1">Available Points</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
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
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-6xl mb-4">📭</p>
              <p className="text-slate-300 text-xl">No products available</p>
              <p className="text-slate-400 text-sm mt-2">Check back soon for amazing deals!</p>
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