'use client';

import { useState, useEffect } from 'react';

// Confetti Effect for Celebration
const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none z-[110]">
    {/* Simple CSS or JS confetti would go here, using a placeholder animation for now */}
     <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #f00;
          top: -20px;
          animation: confetti-fall 3s linear forwards;
        }
      `}</style>
      {Array.from({ length: 50 }).map((_, i) => (
        <div 
          key={i} 
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}vw`,
            background: ['#FFC700', '#FF0000', '#2E3192', '#41BBC7'][Math.floor(Math.random() * 4)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}
  </div>
);

export default function GlobalNotificationHandler() {
  const [giftData, setGiftData] = useState<{ points: number } | null>(null);

  useEffect(() => {
    // Listen for messages from Service Worker
    const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
            const payload = event.data.payload;
            
            // Check if it's an admin gift
            if (payload.type === 'admin_gift' && payload.points) {
                setGiftData({ points: payload.points });
                // Play sound
                try {
                    const audio = new Audio('/sounds/success.mp3');
                    audio.play().catch(() => {});
                } catch(e) {}
            }
        }
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.removeEventListener('message', handleMessage);
        }
    };
  }, []);

  if (!giftData) return null;

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setGiftData(null)}
        />
        
        {/* Popup Card */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-yellow-500/50 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform animate-bounce-in">
            {/* Decoration */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900">
                <span className="text-5xl">🎁</span>
            </div>

            <div className="mt-8 space-y-4">
                <h2 className="text-2xl font-bold text-white">Congratulations!</h2>
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                    <p className="text-gray-300 text-sm uppercase tracking-wider font-semibold">You Received</p>
                    <p className="text-4xl font-black text-yellow-400 my-2 drop-shadow-md">
                        {giftData.points.toLocaleString()}
                    </p>
                    <p className="text-yellow-200 text-sm font-medium">✨ Points from RECKON ✨</p>
                </div>
                
                <p className="text-gray-400 text-sm">
                    Keep up the great work! Your rewards are waiting.
                </p>

                <button 
                    onClick={() => setGiftData(null)}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-slate-900 font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                >
                    Awesome!
                </button>
            </div>
        </div>
      </div>
    </>
  );
}
