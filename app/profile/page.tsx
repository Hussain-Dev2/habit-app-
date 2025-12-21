import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import ProfileClientWrapper from '../../components/ProfileClientWrapper';

import { User } from '@prisma/client';

// Define explicit types since proper generation failed
interface CosmeticItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  rarity: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCosmetic {
  id: string;
  userId: string;
  cosmeticItemId: string;
  purchasedAt: Date;
  isEquipped: boolean;
}

// Define explicit type for user with relations to handle potential Prisma type sync issues
interface ExtendedUser extends User {
  ownedCosmetics: UserCosmetic[];
  selectedAvatar: CosmeticItem | null;
  selectedFrame: CosmeticItem | null;
  selectedAvatarId: string | null;
  selectedFrameId: string | null;
}

async function getUserProfile(): Promise<ExtendedUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      ownedCosmetics: true,
      selectedAvatar: true,
      selectedFrame: true
    } as any // Cast include to any to avoid TS errors if types are outdated
  });
  
  return user as unknown as ExtendedUser | null;
}

export default async function ProfilePage() {
  const user = await getUserProfile();

  if (!user) {
    redirect('/login');
  }

  // Calculate some stats to show based on Plan
  const joinDate = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <div className="glass bg-white/80 dark:bg-gray-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl border border-white/20">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-8 z-10">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full ring-4 ring-white dark:ring-gray-700 shadow-xl overflow-visible">
                {/* Frame - Hidden for now */}
                {false && user.selectedFrame && (
                   <img 
                     src={user.selectedFrame.imageUrl} 
                     alt="Frame" 
                     className="absolute top-1/2 left-1/2 w-[115%] h-[115%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 object-contain"
                     style={{ mixBlendMode: 'multiply' }}
                   />
                )}
                
                {/* Avatar */}
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                  {user.selectedAvatar ? (
                    <img src={user.selectedAvatar.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-4xl">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                {user.name || 'Anonymous User'}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">
                @{user.email?.split('@')[0]} • Joined {joinDate}
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-white/50 dark:bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-500 block">💎 Balance</span>
                  <span className="text-xl font-bold text-primary-600">{user.points.toLocaleString()}</span>
                </div>
                 <div className="bg-white/50 dark:bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-500 block">🔥 Streak</span>
                  <span className="text-xl font-bold text-orange-500">{user.streakDays} Days</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 min-w-[200px]">
               <Link
                href="/stats"
                className="w-full py-3 px-6 rounded-xl font-bold text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all"
              >
                📊 Stats & Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Cosmetics Shop Wrapper */}
        <ProfileClientWrapper 
          user={user} 
        />
        
      </div>
    </div>
  );
}
