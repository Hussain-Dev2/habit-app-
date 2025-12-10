'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DigitalProductCard from '@/components/DigitalProductCard';
import ScratchCardModal from '@/components/ScratchCardModal';
import Toast from '@/components/Toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import { apiFetch } from '@/lib/client';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string | null;
  costPoints: number;
  stock: number | null;
  imageUrl: string | null;
  category: string | null;
  value: string | null;
  region: string | null;
}

interface PurchaseResponse {
  message: string;
  redeemCode: string | null;
  newPoints: number;
  orderId: string;
  status: string;
  isPending: boolean;
  product: {
    title: string;
    value?: string;
  };
}

export default function Shop() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);

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

  const handlePurchase = async (productId: string) => {
    try {
      const response = await fetch('/api/store/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setToast({ message: data.error || 'Purchase failed', type: 'error' });
        return;
      }

      // Show scratch card modal OR pending notification
      if (data.isPending) {
        setToast({ 
          message: `⏳ ${data.product.title} will be delivered in less than 2 days. Check your Inbox!`, 
          type: 'success' 
        });
      } else {
        setPurchaseResult(data);
      }
      
      setUserPoints(data.newPoints);
      fetchProducts(); // Refresh stock
    } catch (error) {
      setToast({ message: 'Purchase failed', type: 'error' });
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))] as string[];
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);
  
  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader size="lg" color="orange" />
          <p className="text-slate-300 text-lg font-semibold">Loading amazing products...</p>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 -left-20 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
          {/* Header */}
          <div className="mb-8 sm:mb-10 lg:mb-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-5xl sm:text-6xl lg:text-7xl drop-shadow-lg">🛍️</span>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white drop-shadow-md">
                    Rewards Store
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base lg:text-lg xl:text-xl mt-1 sm:mt-2">Exchange your points for premium rewards</p>
                </div>
              </div>

              {/* Purchase History Link */}
              <Link
                href="/purchases"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700 hover:border-purple-500 rounded-xl text-white text-sm sm:text-base font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/20 w-full sm:w-auto text-center"
              >
                📜 My Purchases
              </Link>
            </div>

            {/* Points Card */}
            <div className="w-full sm:inline-block backdrop-blur-xl bg-gradient-to-br from-yellow-600/30 to-amber-600/20 border-2 border-yellow-400/50 rounded-2xl sm:rounded-3xl px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 shadow-xl">
              <p className="text-slate-300 text-xs sm:text-sm mb-1 sm:mb-2 font-bold flex items-center gap-2">
                <span className="text-lg sm:text-xl">💰</span>
                Available Points
              </p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-sm">
                {userPoints.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="mb-6 sm:mb-8 flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {selectedCategory !== 'All' ? (
            // Show filtered view when a category is selected
            filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <DigitalProductCard
                      product={product}
                      userPoints={userPoints}
                      onPurchase={handlePurchase}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 backdrop-blur-xl bg-slate-800/30 border-2 border-slate-700 rounded-2xl sm:rounded-3xl">
                <p className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6">📭</p>
                <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2">No products available</p>
                <p className="text-slate-400 text-sm sm:text-base">Check back soon for amazing deals!</p>
              </div>
            )
          ) : (
            // Show categories in separate rows when 'All' is selected
            products.length > 0 ? (
              <div className="space-y-8 sm:space-y-10 lg:space-y-12">
                {Object.entries(productsByCategory).map(([category, categoryProducts], categoryIndex) => (
                  <div key={category} className="animate-fade-in" style={{ animationDelay: `${categoryIndex * 150}ms` }}>
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-md flex items-center gap-3">
                        <span className="text-3xl sm:text-4xl">
                          {category === 'Gaming' ? '🎮' : 
                           category === 'Entertainment' ? '🎥' : 
                           category === 'Shopping' ? '🛍️' : 
                           category === 'Food' ? '🍕' : '🎁'}
                        </span>
                        {category}
                      </h2>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className="text-purple-400 hover:text-purple-300 text-sm sm:text-base font-semibold transition-colors"
                      >
                        View All →
                      </button>
                    </div>

                    {/* Products Horizontal Scroll */}
                    <div className="relative">
                      <div className="flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800/50 snap-x snap-mandatory">
                        {categoryProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] snap-start"
                          >
                            <DigitalProductCard
                              product={product}
                              userPoints={userPoints}
                              onPurchase={handlePurchase}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 backdrop-blur-xl bg-slate-800/30 border-2 border-slate-700 rounded-2xl sm:rounded-3xl">
                <p className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6">📭</p>
                <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2">No products available</p>
                <p className="text-slate-400 text-sm sm:text-base">Check back soon for amazing deals!</p>
              </div>
            )
          )}
        </div>

        {/* Scratch Card Modal */}
        {purchaseResult && purchaseResult.redeemCode && (
          <ScratchCardModal
            isOpen={true}
            onClose={() => setPurchaseResult(null)}
            code={purchaseResult.redeemCode}
            productTitle={purchaseResult.product.title}
            productValue={purchaseResult.product.value}
            orderId={purchaseResult.orderId}
          />
        )}

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