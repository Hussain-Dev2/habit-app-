'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/client';

interface StoreItemProps {
  id: string;
  name: string;
  description: string;
  cost: number;
  stock: number;
  onBuy: (message: string, newPoints: number) => void;
  onError: (msg: string) => void;
}

export default function StoreItem({
  id,
  name,
  description,
  cost,
  stock,
  onBuy,
  onError,
}: StoreItemProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{
        message: string;
        user: { id: string; points: number; clicks: number };
      }>('/store/buy', {
        method: 'POST',
        body: JSON.stringify({ productId: id }),
      });

      onBuy(data.message, data.user.points);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to buy item');
    } finally {
      setLoading(false);
    }
  };

  const isOutOfStock = stock === 0;

  return (
    <div className="group relative backdrop-blur-xl bg-white/70 dark:bg-white/10 border-2 border-blue-200/50 dark:border-white/20 rounded-3xl overflow-hidden hover:border-purple-400/70 dark:hover:border-purple-400/60 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 card-hover">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/10 group-hover:to-purple-500/15 transition-all duration-300"></div>

      <div className="p-8 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-3">
            {name}
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-2 font-medium">{description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-100/80 to-amber-100/70 dark:from-yellow-900/30 dark:to-amber-800/20 border-2 border-yellow-300/60 dark:border-yellow-400/40 rounded-xl p-4 hover:border-yellow-400/80 transition-all duration-200 hover:shadow-md">
            <p className="text-xs text-slate-700 dark:text-slate-400 mb-2 font-semibold">💰 Cost</p>
            <p className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-400">
              {cost.toLocaleString()}
              <span className="text-base ml-1">⭐</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-100/80 to-indigo-100/70 dark:from-blue-900/30 dark:to-indigo-800/20 border-2 border-blue-300/60 dark:border-blue-400/40 rounded-xl p-4 hover:border-blue-400/80 transition-all duration-200 hover:shadow-md">
            <p className="text-xs text-slate-700 dark:text-slate-400 mb-2 font-semibold">📦 Stock</p>
            <p className={`text-2xl font-extrabold ${
              isOutOfStock ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {stock}
              <span className="text-base ml-1">{isOutOfStock ? '❌' : '✅'}</span>
            </p>
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuy}
          disabled={loading || isOutOfStock}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
            isOutOfStock
              ? 'bg-slate-300/50 dark:bg-slate-600/50 cursor-not-allowed text-slate-600 dark:text-slate-400 border-2 border-slate-400/30 dark:border-slate-500/30'
              : loading
              ? 'bg-purple-400/50 dark:bg-purple-500/50 cursor-not-allowed text-white border-2 border-purple-400/50'
              : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50 active:scale-95 border-2 border-pink-400/40'
          }`}
        >
          {isOutOfStock ? (
            <>
              <span>📭</span>
              <span>Out of Stock</span>
            </>
          ) : loading ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>🛒</span>
              <span>Buy Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
