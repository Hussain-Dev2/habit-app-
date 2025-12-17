import ChatSystem from '@/components/ChatSystem';
import GoogleAdsense from '@/components/ads/GoogleAdsense';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Chat | Clicker App',
  description: 'Chat with other players in the global community.',
};

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
        <p className="text-gray-400">Connect with other players from around the world.</p>
      </div>
      
      <ChatSystem />

      {/* Google AdSense - Tiny Banner */}
      <div className="mt-8 flex justify-center">
        <GoogleAdsense 
          adSlot="1234567890" 
          adFormat="horizontal"
          style={{ height: '90px', width: '100%', maxWidth: '728px' }}
          className="bg-gray-800/50 rounded-lg overflow-hidden"
        />
      </div>
    </div>
  );
}
