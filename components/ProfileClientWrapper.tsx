'use client';

import { useState } from 'react';
import CosmeticsShop from './CosmeticsShop';
import EditProfileModal from './EditProfileModal';
import { useRouter } from 'next/navigation';

export default function ProfileClientWrapper({ user }: { user: any }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <>
      {/* Actions Bar - Moved here to handle client state */}
      <div className="flex justify-end -mt-4 mb-6 sticky top-20 z-30">
        <button 
          onClick={() => setIsEditOpen(true)}
          className="bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl font-bold border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          ⚙️ Edit Details
        </button>
      </div>

      <CosmeticsShop 
        userPoints={user.points} 
        ownedIds={user.ownedCosmetics.map((c: any) => c.cosmeticItemId)}
        selectedAvatarId={user.selectedAvatarId}
        selectedFrameId={user.selectedFrameId}
        currentAvatarImage={user.selectedAvatar?.imageUrl}
        onUpdate={handleUpdate}
      />

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentUser={user}
      />
    </>
  );
}
