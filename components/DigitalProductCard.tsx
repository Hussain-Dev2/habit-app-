'use client';

import { useState } from 'react';

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

interface DigitalProductCardProps {
  product: Product;
  userPoints: number;
  onPurchase: (productId: string) => void;
}

export default function DigitalProductCard({ product, userPoints, onPurchase }: DigitalProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const canAfford = userPoints >= product.costPoints;
  const isOutOfStock = product.stock !== null && product.stock <= 0;

  const handleCardClick = () => {
    if (!isOutOfStock) {
      setShowModal(true);
    }
  };

  const handlePurchase = () => {
    onPurchase(product.id);
    setShowModal(false);
  };

  return (
    <>
      <div
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div className={`bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border overflow-hidden transition-all duration-300 h-full flex flex-col ${
          isHovered ? 'border-purple-500 shadow-xl shadow-purple-500/20 transform scale-105' : 'border-slate-700'
        }`}>
          {/* Product Image */}
          <div className="relative h-36 sm:h-40 md:h-44 lg:h-48 bg-gradient-to-br from-purple-900/50 to-blue-900/50 overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Fallback Icon (hidden by default if image loads) */}
            <div className={`w-full h-full flex items-center justify-center ${product.imageUrl ? 'hidden' : ''}`}>
              <span className="text-4xl sm:text-5xl lg:text-6xl">
                {getCategoryIcon(product.category)}
              </span>
            </div>
            
            {/* Category Badge */}
            {product.category && (
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                {product.category}
              </div>
            )}

            {/* Value Badge */}
            {product.value && (
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full text-xs font-bold text-white">
                {product.value}
              </div>
            )}

            {/* Region Flag Badge - Bottom Right Corner */}
            {product.region && (
              <div className="absolute bottom-2 right-2 px-2.5 py-1.5 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                <span className="text-xl">{getRegionFlag(product.region)}</span>
              </div>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg lg:text-xl">OUT OF STOCK</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 line-clamp-1">
              {product.title}
            </h3>
            
            {product.description && (
              <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Stock Info */}
            {product.stock !== null && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-slate-400 text-xs sm:text-sm">Stock:</span>
                <span className={`font-semibold text-xs sm:text-sm ${
                  product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {product.stock} available
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-auto">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl">⭐</span>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {product.costPoints.toLocaleString()}
                </span>
                <span className="text-slate-400 text-xs sm:text-sm ml-1">points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <div 
            className="relative bg-slate-800/95 backdrop-blur-xl border-2 border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Product Image */}
            <div className="relative h-64 bg-gradient-to-br from-purple-900/50 to-blue-900/50 overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain p-8"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Fallback Icon */}
              <div className={`w-full h-full flex items-center justify-center ${product.imageUrl ? 'hidden' : ''}`}>
                <span className="text-8xl">
                  {getCategoryIcon(product.category)}
                </span>
              </div>

              {/* Badges */}
              {product.category && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                  {product.category}
                </div>
              )}
              {product.value && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full text-sm font-bold text-white">
                  {product.value}
                </div>
              )}
              {/* Region Flag Badge - Bottom Right Corner */}
              {product.region && (
                <div className="absolute bottom-4 right-4 px-3 py-2 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                  <span className="text-2xl">{getRegionFlag(product.region)}</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-3">
                {product.title}
              </h2>

              {product.description && (
                <p className="text-slate-300 text-base mb-4">
                  {product.description}
                </p>
              )}

              {/* Stock Info */}
              {product.stock !== null ? (
                <div className="mb-4 flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                  <span className="text-slate-300 text-sm">Stock:</span>
                  <span className={`font-semibold text-sm ${
                    product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {product.stock} available
                  </span>
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                  <span className="text-green-400 text-sm font-semibold">♾️ Unlimited Stock</span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6 flex items-center gap-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-2 border-yellow-600/50 px-4 py-3 rounded-lg">
                <span className="text-3xl">⭐</span>
                <span className="text-3xl font-bold text-white">
                  {product.costPoints.toLocaleString()}
                </span>
                <span className="text-slate-300 text-base">points</span>
              </div>

              {/* Buy Button */}
              <button
                onClick={handlePurchase}
                disabled={!canAfford || isOutOfStock}
                className={`w-full py-3 rounded-lg text-lg font-bold transition-all duration-200 ${
                  isOutOfStock
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : canAfford
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/50'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isOutOfStock ? '❌ Sold Out' : canAfford ? '� Buy' : '⚠️ Not Enough Points'}
              </button>

              {/* Insufficient Points Warning */}
              {!canAfford && !isOutOfStock && (
                <div className="mt-3 text-center text-red-400 text-sm">
                  You need {(product.costPoints - userPoints).toLocaleString()} more points
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getCategoryIcon(category: string | null): string {
  if (!category) return '🎁';
  
  const icons: Record<string, string> = {
    'Google Play': '🎮',
    'iTunes': '🍎',
    'Steam': '🎯',
    'PlayStation': '🎮',
    'Xbox': '🎮',
    'Nintendo': '🎮',
    'Game Codes': '🎮',
    'Gift Cards': '🎁',
    'Premium': '💎',
  };

  for (const [key, icon] of Object.entries(icons)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }

  return '🎁';
}

function getRegionFlag(region: string | null): string {
  if (!region) return '🌍';
  
  const flags: Record<string, string> = {
    'Global': '🌍',
    'USA': '🇺🇸',
    'EU': '🇪🇺',
    'UK': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Middle East': '🇸🇦',
    'Asia': '🌏',
    'Latin America': '🌎',
    'Africa': '🌍',
  };

  return flags[region] || '🌍';
}
