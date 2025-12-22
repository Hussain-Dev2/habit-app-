'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import DigitalProductCard from '@/components/DigitalProductCard';
import ScratchCardModal from '@/components/ScratchCardModal';
import Toast from '@/components/Toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import { apiFetch } from '@/lib/client';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

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

/**
 * Rewards Marketplace Page
 * 
 * Users can browse and purchase rewards using their earned points.
 * Points are spent to acquire rewards, but level is NOT affected by purchases.
 * Level is determined solely by lifetimePoints (earned points), not current points.
 */
export default function RewardsMarketplace() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const isAuthenticated = status === 'authenticated';

  const fetchData = useCallback(async () => {
    try {
      const productPromise = apiFetch<{ products: Product[] }>('/store/products');
      const userPromise = isAuthenticated ? apiFetch<{ user: { points: number } }>('/auth/me') : Promise.resolve(null);
      
      const [productData, userData] = await Promise.all([productPromise, userPromise]);
      
      setProducts(productData.products || []);
      if (userData) {
        setUserPoints(userData.user.points);
      }
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
      setToast({
        message: 'Failed to load products. Please try again later.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePurchase = async (productId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setToast({ 
        message: '🔐 Please sign in to purchase items from the store!', 
        type: 'error' 
      });
      return;
    }

    if (purchasing) return;
    setPurchasing(productId);

    // Optimistic check
    const product = products.find(p => p.id === productId);
    if (product && userPoints < product.costPoints) {
      setToast({ message: 'Not enough points!', type: 'error' });
      setPurchasing(null);
      return;
    }

    try {
      const data = await apiFetch<PurchaseResponse>('/store/buy', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });

      // Handle successful purchase
      if (data.isPending) {
        setToast({ 
          message: `⏳ ${data.product.title} will be delivered in less than 2 days. Check your Inbox!`, 
          type: 'success' 
        });
      } else {
        setPurchaseResult(data);
        setToast({
            message: data.message || 'Purchase successful!',
            type: 'success'
        });
      }
      
      setUserPoints(data.newPoints);
      // Refresh products to update stock
      fetchData();
    } catch (error: any) {
      setToast({ message: error.message || 'Purchase failed', type: 'error' });
    } finally {
      setPurchasing(null);
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
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader size="lg" color="orange" />
          <p className="text-gray-600 dark:text-slate-300 text-lg font-semibold">Loading amazing rewards...</p>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900 relative overflow-hidden">
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
                <span className="text-5xl sm:text-6xl lg:text-7xl drop-shadow-lg">🎁</span>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">
                    {t.digitalStore || 'Rewards Marketplace'}
                  </h1>
                  <p className="text-gray-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg xl:text-xl mt-1 sm:mt-2">{t.rewardsPanelDesc}</p>
                </div>
              </div>

              {/* Purchase History Link */}
              <Link
                href="/purchases"
                className="px-4 sm:px-6 py-2 sm:py-3 glass bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-gray-200 dark:border-slate-700 hover:border-purple-500 rounded-xl text-gray-700 dark:text-white text-sm sm:text-base font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/20 w-full sm:w-auto text-center"
              >
                📜 {t.myPurchases}
              </Link>
            </div>

            {/* Points Card */}
            <div className="w-full sm:inline-block backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-600/30 dark:to-amber-600/20 border-2 border-yellow-500/30 dark:border-yellow-400/50 rounded-2xl sm:rounded-3xl px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 shadow-xl">
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm mb-1 sm:mb-2 font-bold flex items-center gap-2">
                <span className="text-lg sm:text-xl">⭐</span>
                {t.spendablePoints}
              </p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-yellow-600 dark:text-white drop-shadow-sm">
                {userPoints.toLocaleString()}
              </p>
            </div>
          </div>
          {/* Featured: Streak Freeze */}
          {products.find(p => p.title.includes('Streak Freeze')) && (
            <div className="mb-8 sm:mb-10 lg:mb-12 animate-fade-in">
              <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/40 dark:to-cyan-600/40 border-2 border-cyan-500/30 dark:border-cyan-400/60 rounded-3xl sm:rounded-4xl p-6 sm:p-8 lg:p-10 shadow-xl dark:shadow-2xl dark:shadow-cyan-500/20">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 text-center sm:text-left">
                  <span className="text-5xl sm:text-6xl">🧊</span>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {t.streakFreezeTitle}
                    </h2>
                    <p className="text-gray-600 dark:text-slate-200 text-sm sm:text-base lg:text-lg">
                      {t.streakFreezeDesc}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-2 bg-white/80 dark:bg-black/30 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-gray-200 dark:border-transparent w-full sm:w-auto justify-center">
                    <span className="text-2xl sm:text-3xl">⭐</span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-600 dark:text-cyan-300">50 Points</span>
                  </div>
                  <button
                    onClick={() => handlePurchase(products.find(p => p.title.includes('Streak Freeze'))?.id || '')}
                    disabled={userPoints < 50}
                    className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-white text-sm sm:text-base lg:text-lg transition-all ${
                      userPoints < 50
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-xl hover:shadow-cyan-500/50 active:scale-95'
                    }`}
                  >
                    {userPoints < 50 ? t.needMore + ' ' + t.morePoints : t.getFreezeNow}
                  </button>
                </div>
              </div>
            </div>
          )}
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
                      : 'bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/50 border border-gray-200 dark:border-slate-700'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
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
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 glass bg-white/30 dark:bg-slate-800/30 border-2 border-gray-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl">
                <p className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6">📭</p>
                <p className="text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2">{t.noProductsAvailable}</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base">{t.checkBackSoon}</p>
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
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white drop-shadow-md flex items-center gap-3">
                        <span className="text-3xl sm:text-4xl">
                          {category === 'Gaming' ? '🎮' : 
                           category === 'Entertainment' ? '🎥' : 
                           category === 'Shopping' ? '🛍️' : 
                           category === 'Food' ? '🍕' : '🎁'}
                        </span>
                        {category} Rewards
                      </h2>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-sm sm:text-base font-semibold transition-colors"
                      >
                        {t.viewAll}
                      </button>
                    </div>

                    {/* Products Horizontal Scroll */}
                    <div className="relative">
                      <div className="flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-200 dark:scrollbar-track-slate-800/50 snap-x snap-mandatory">
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
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 glass bg-white/30 dark:bg-slate-800/30 border-2 border-gray-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl">
                <p className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6">📭</p>
                <p className="text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2">No products available</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base">Check back soon for amazing deals!</p>
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

        {/* Sign-in prompt for non-authenticated users */}
        {!isAuthenticated && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 glass backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400 dark:border-purple-600 rounded-2xl p-4 text-center animate-fade-in shadow-glow max-w-md mx-4">
            <p className="text-white font-semibold mb-2">{t.signInToClaim}</p>
            <a
              href="/login"
              className="inline-block px-6 py-2 bg-gradient-ocean text-white font-semibold rounded-lg hover:shadow-glow transition-all duration-300 text-sm"
            >
              {t.signInRegister}
            </a>
          </div>
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