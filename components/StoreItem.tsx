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
    <div className="group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden hover:border-white/40 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/5 group-hover:to-purple-500/10 transition-all duration-300"></div>

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {name}
          </h3>
          <p className="text-slate-300 text-sm line-clamp-2">{description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Cost</p>
            <p className="text-lg font-bold text-yellow-400">
              {cost.toLocaleString()} 
              <span className="text-xs ml-1">⭐</span>
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Stock</p>
            <p className={`text-lg font-bold ${
              isOutOfStock ? 'text-red-400' : 'text-green-400'
            }`}>
              {stock}
              <span className="text-xs ml-1">{isOutOfStock ? '❌' : '✅'}</span>
            </p>
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuy}
          disabled={loading || isOutOfStock}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isOutOfStock
              ? 'bg-slate-600/50 cursor-not-allowed text-slate-400 border border-slate-500/30'
              : loading
              ? 'bg-purple-500/50 cursor-not-allowed text-white border border-purple-400/30'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 active:scale-95 border border-pink-400/30'
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
