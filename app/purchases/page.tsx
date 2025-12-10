'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScratchCardModal from '@/components/ScratchCardModal';
import Loader from '@/components/Loader';
import Link from 'next/link';

interface Purchase {
  id: string;
  createdAt: string;
  cost: number;
  redeemCode: string | null;
  isRevealed: boolean;
  isUsed: boolean;
  status: string;
  deliveredAt: string | null;
  product: {
    title: string;
    value?: string;
    category?: string;
    imageUrl?: string;
  };
}

export default function PurchasesPage() {
  const { status } = useSession();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPurchases();
    }
  }, [status]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/store/purchases');
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleUsed = async (purchaseId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/store/toggle-used', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: purchaseId, isUsed: !currentStatus }),
      });
      
      setPurchases(purchases.map(p => 
        p.id === purchaseId ? { ...p, isUsed: !currentStatus } : p
      ));
    } catch (error) {
      console.error('Failed to toggle used status:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader size="lg" color="emerald" />
          <p className="text-slate-300 text-lg font-semibold">Loading your purchases...</p>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-4xl sm:text-5xl lg:text-6xl">📜</span>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">My Purchases</h1>
                  <p className="text-slate-300 mt-1 sm:mt-2 text-sm sm:text-base">View all your redeemed codes</p>
                </div>
              </div>

              <Link
                href="/shop"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-white text-sm sm:text-base font-semibold transition-all shadow-lg w-full sm:w-auto text-center"
              >
                🏪 Back to Shop
              </Link>
            </div>
          </div>

          {/* Purchases List */}
          {purchases.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className={`bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border overflow-hidden transition-all ${
                    purchase.isUsed ? 'border-slate-700 opacity-60' : 'border-slate-700 hover:border-purple-500'
                  }`}
                >
                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                        {purchase.product.imageUrl ? (
                          <img
                            src={purchase.product.imageUrl}
                            alt={purchase.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">
                            🎁
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0 mb-3">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                              {purchase.product.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
                              {purchase.product.category && (
                                <span className="px-2 py-1 bg-slate-700 rounded-full">
                                  {purchase.product.category}
                                </span>
                              )}
                              {purchase.product.value && (
                                <span className="text-yellow-400 font-semibold">
                                  {purchase.product.value}
                                </span>
                              )}
                              <span>
                                {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-xs sm:text-sm">Cost:</span>
                            <span className="text-white font-bold text-sm sm:text-base">{purchase.cost.toLocaleString()} pts</span>
                          </div>
                        </div>

                        {/* Code Display */}
                        <div className="bg-slate-900/50 rounded-xl p-3 sm:p-4 mb-3">
                          {purchase.status === 'pending' ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <div className="text-2xl sm:text-3xl animate-pulse">⏳</div>
                              <div>
                                <p className="text-yellow-400 font-semibold mb-1 text-sm sm:text-base">
                                  Order Pending
                                </p>
                                <p className="text-slate-400 text-xs sm:text-sm">
                                  Your {purchase.product.title} will be delivered in less than 2 days.
                                  You'll receive a notification when ready!
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex-1 w-full">
                                <p className="text-slate-400 text-xs mb-1">Redeem Code:</p>
                                {purchase.isRevealed ? (
                                  <p className="text-white font-mono text-sm sm:text-base lg:text-lg font-bold break-all">
                                    {purchase.redeemCode}
                                  </p>
                                ) : (
                                  <button
                                    onClick={() => setSelectedPurchase(purchase)}
                                    className="text-purple-400 hover:text-purple-300 font-semibold text-xs sm:text-sm"
                                  >
                                    Click to reveal code
                                  </button>
                                )}
                              </div>

                              {purchase.isRevealed && purchase.redeemCode && (
                                <button
                                  onClick={() => handleCopyCode(purchase.redeemCode!, purchase.id)}
                                  className="w-full sm:w-auto sm:ml-4 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                  {copiedId === purchase.id ? (
                                    <>
                                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                      </svg>
                                      Copy
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                          {purchase.status === 'delivered' && (
                            <button
                              onClick={() => toggleUsed(purchase.id, purchase.isUsed)}
                              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2 ${
                                purchase.isUsed
                                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {purchase.isUsed ? (
                                <>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Used
                                </>
                              ) : (
                                <>Mark as Used</>
                              )}
                            </button>
                          )}

                          {!purchase.isRevealed && purchase.status === 'delivered' && (
                            <button
                              onClick={() => setSelectedPurchase(purchase)}
                              className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm sm:text-base font-semibold transition-all"
                            >
                              Reveal Code
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 backdrop-blur-xl bg-slate-800/30 border-2 border-slate-700 rounded-2xl sm:rounded-3xl">
              <p className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6">🛒</p>
              <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2">No purchases yet</p>
              <p className="text-slate-400 text-sm sm:text-base mb-4 sm:mb-6 text-center px-4">Start shopping to see your redeemed codes here</p>
              <Link
                href="/shop"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-white text-sm sm:text-base font-semibold transition-all"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>

        {/* Scratch Card Modal */}
        {selectedPurchase && selectedPurchase.redeemCode && (
          <ScratchCardModal
            isOpen={true}
            onClose={() => {
              setSelectedPurchase(null);
              fetchPurchases(); // Refresh to update revealed status
            }}
            code={selectedPurchase.redeemCode}
            productTitle={selectedPurchase.product.title}
            productValue={selectedPurchase.product.value}
            orderId={selectedPurchase.id}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
