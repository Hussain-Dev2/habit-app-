'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

type Cosmetic = {
  id: string;
  name: string;
  description: string;
  type: 'AVATAR' | 'FRAME';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  price: number;
  imageUrl: string;
};

type Props = {
  userPoints: number;
  ownedIds: string[];
  selectedAvatarId?: string | null;
  selectedFrameId?: string | null;
  currentAvatarImage?: string | null; // URL of current avatar
  onUpdate: () => void;
};

const RARITY_STYLES = {
  COMMON: {
    border: 'border-slate-300 dark:border-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    glow: ''
  },
  RARE: {
    border: 'border-blue-300 dark:border-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]'
  },
  EPIC: {
    border: 'border-purple-400 dark:border-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]'
  },
  LEGENDARY: {
    border: 'border-yellow-400 dark:border-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    glow: 'shadow-[0_0_25px_rgba(234,179,8,0.35)]'
  },
};

export default function CosmeticsShop({ userPoints, ownedIds, selectedAvatarId, selectedFrameId, currentAvatarImage, onUpdate }: Props) {
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [activeTab, setActiveTab] = useState<'AVATAR' | 'FRAME'>('AVATAR');
  const [filter, setFilter] = useState<'ALL' | 'OWNED' | 'SHOP'>('ALL');
  const [loading, setLoading] = useState(false);
  
  // UI States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [purchaseModal, setPurchaseModal] = useState<{ isOpen: boolean; item: Cosmetic | null }>({ isOpen: false, item: null });
  
  const router = useRouter();

  useEffect(() => {
    fetchCosmetics();
  }, []);

  const fetchCosmetics = async () => {
    try {
      const data = await apiFetch<Cosmetic[]>('/cosmetics');
      setCosmetics(data);
    } catch (error) {
      console.error('Failed to fetch cosmetics', error);
      setToast({ message: 'Failed to load shop items', type: 'error' });
    }
  };

  const initiatePurchase = (item: Cosmetic) => {
    if (userPoints < item.price) {
      setToast({ message: `Need ${item.price - userPoints} more points!`, type: 'error' });
      return;
    }
    setPurchaseModal({ isOpen: true, item });
  };

  const confirmPurchase = async () => {
    const item = purchaseModal.item;
    if (!item) return;

    setLoading(true);
    setPurchaseModal({ isOpen: false, item: null });

    try {
      await apiFetch('/cosmetics/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosmeticId: item.id })
      });
      onUpdate(); 
      setToast({ message: `Purchased ${item.name}!`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Purchase failed. Try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (id: string, type: 'AVATAR' | 'FRAME') => {
    setLoading(true);
    try {
      await apiFetch('/cosmetics/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosmeticId: id, type })
      });
      onUpdate();
      router.refresh(); 
      setToast({ message: 'Equipped successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to equip item', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = cosmetics.filter(item => {
    if (item.type !== activeTab) return false;
    if (filter === 'OWNED') return ownedIds.includes(item.id);
    if (filter === 'SHOP') return !ownedIds.includes(item.id);
    return true;
  });

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 rounded-[2rem] p-6 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal 
        isOpen={purchaseModal.isOpen}
        title="Confirm Purchase"
        message={`Are you sure you want to buy "${purchaseModal.item?.name}" for ${purchaseModal.item?.price} points?`}
        confirmText="Buy Now"
        onConfirm={confirmPurchase}
        onCancel={() => setPurchaseModal({ isOpen: false, item: null })}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
        <h2 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
          Cosmetics Shop
        </h2>
        
        <div className="flex gap-4 items-center flex-wrap justify-center">
            {/* Type Switcher disabled for now */}
            {false && (
            <div className="flex p-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600/50">
            {(['AVATAR'] as const).map(tab => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === tab 
                    ? 'bg-white dark:bg-gray-600 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                >
                {tab === 'AVATAR' ? '👤 Avatars' : '🖼️ Frames'}
                </button>
            ))}
            </div>
            )}

            <div className="relative">
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="appearance-none pl-5 pr-10 py-3 rounded-2xl font-bold text-sm border-2 border-transparent bg-gray-100 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-primary-400 transition-all cursor-pointer"
                >
                    <option value="ALL">All Items</option>
                    <option value="OWNED">My Inventory</option>
                    <option value="SHOP">Unowned</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    ▼
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => {
          const isOwned = ownedIds.includes(item.id);
          const isEquipped = item.type === 'AVATAR' ? selectedAvatarId === item.id : selectedFrameId === item.id;
          const style = RARITY_STYLES[item.rarity];
          
          return (
            <div 
              key={item.id} 
              className={`relative group p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center bg-white dark:bg-gray-800 ${style.border} ${style.bg} ${style.glow} hover:-translate-y-2 hover:shadow-2xl ${
                  isEquipped ? 'ring-4 ring-green-400 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 border-green-500' : ''
              }`}
            >
              <div className={`absolute top-0 right-0 m-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${style.badge}`}>
                  {item.rarity}
              </div>

              <div className="aspect-square w-full mb-4 relative flex items-center justify-center p-4">
                 <div className="relative w-full h-full drop-shadow-xl transition-transform group-hover:scale-110 duration-500 flex items-center justify-center">
                    
                    {/* If listing FRAMES, show current avatar underneath for preview */}
                    {item.type === 'FRAME' && currentAvatarImage && (
                        <div className="absolute inset-2 sm:inset-3 rounded-full overflow-hidden z-0 bg-gray-100 dark:bg-gray-700">
                             <img src={currentAvatarImage} alt="Preview Avatar" className="w-full h-full object-cover opacity-90" />
                        </div>
                    )}

                    {item.imageUrl ? (
                        <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className={`w-full h-full z-10 relative ${item.type === 'FRAME' ? 'scale-110 object-contain' : 'object-contain'}`}
                            style={item.type === 'FRAME' ? { mixBlendMode: 'multiply' } : undefined}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-4xl z-10">?</div>
                    )}
                 </div>
              </div>
              
              <div className="text-center w-full mt-auto space-y-3">
                <h3 className="font-extrabold text-gray-800 dark:text-white truncate px-2" title={item.name}>{item.name}</h3>
                
                {isOwned ? (
                  <button
                    onClick={() => !isEquipped && handleEquip(item.id, item.type)}
                    disabled={isEquipped || loading}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
                      isEquipped 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default ring-1 ring-green-500/30' 
                      : 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200'
                    }`}
                  >
                    {isEquipped ? '✓ Equipped' : 'Equip'}
                  </button>
                ) : (
                  <button
                    onClick={() => initiatePurchase(item)}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                      userPoints >= item.price
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-orange-500/25 hover:brightness-110'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>💎</span> {item.price === 0 ? 'Free' : item.price.toLocaleString()}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 animate-fade-in">
          <div className="text-6xl mb-4 opacity-50">🛍️</div>
          <p className="font-medium text-lg">No items found in this category.</p>
        </div>
      )}
    </div>
  );
}
