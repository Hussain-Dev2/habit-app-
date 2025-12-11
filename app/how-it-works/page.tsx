export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 text-cyan-600 dark:text-cyan-400 text-center">
          How RECKON Works
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl mb-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">1️⃣</span> Getting Started
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                RECKON is a rewards platform where you can earn points through various engaging activities. 
                Simply sign up with your Google account to get started instantly - no complicated registration process!
              </p>
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl">
                <h3 className="font-bold mb-2 text-cyan-700 dark:text-cyan-400">What you get:</h3>
                <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Instant account creation with Google OAuth</li>
                  <li>Starting points to begin your journey</li>
                  <li>Access to all earning activities</li>
                  <li>Personalized dashboard to track progress</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">2️⃣</span> Earning Points
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                There are multiple ways to earn points on RECKON. Each activity offers different rewards and has its own cooldown period to ensure fair play.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                  <h3 className="font-bold text-lg mb-2 text-orange-700 dark:text-orange-400">🖱️ Clicking</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Simple clicks earn you base points. Build combos for multipliers!
                  </p>
                </div>
                
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                  <h3 className="font-bold text-lg mb-2 text-emerald-700 dark:text-emerald-400">📺 Watching Ads</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Watch rewarded videos to earn substantial points quickly.
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <h3 className="font-bold text-lg mb-2 text-purple-700 dark:text-purple-400">🎡 Spin Wheel</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Test your luck with the spin wheel for random rewards!
                  </p>
                </div>
                
                <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl">
                  <h3 className="font-bold text-lg mb-2 text-pink-700 dark:text-pink-400">👥 Referrals</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Share your link and earn 100 points per referral!
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">3️⃣</span> Level System
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                As you earn lifetime points, you progress through 12 levels. Each level unlocks better multipliers and bonuses:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-xl">
                  <span className="text-3xl">🌱</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Level 1-3: Beginner</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start building your foundation</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-xl">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Level 4-7: Intermediate</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unlock powerful multipliers</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl">
                  <span className="text-3xl">👑</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Level 8-12: Expert</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Maximum rewards and bonuses</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">4️⃣</span> Redeeming Rewards
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Visit the Shop to browse available digital products and rewards. Use your hard-earned points to redeem:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-xl">💳</span>
                  <span>Gift cards and vouchers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">🎮</span>
                  <span>Gaming codes and subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">🎁</span>
                  <span>Premium features and boosts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✨</span>
                  <span>Exclusive digital products</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">5️⃣</span> Tips for Success
              </h2>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Check daily:</strong> Don`t miss your daily bonus for consistent progress</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Plan activities:</strong> Understand cooldown times to maximize efficiency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Build combos:</strong> Rapid clicking gives bonus multipliers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Share your link:</strong> Referrals give you AND your friends bonus points</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Level up:</strong> Higher levels unlock better rewards automatically</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        {/* Ad Space */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-4681103183883079"
            data-ad-slot="YOUR_SLOT_ID"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </main>
  );
}
