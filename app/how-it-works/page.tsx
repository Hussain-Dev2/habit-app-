export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 text-cyan-600 dark:text-cyan-400 text-center">
          How Gamified Habit Tracker Works
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl mb-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">1️⃣</span> Getting Started
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Build better habits with our gamified habit tracker! Simply sign up with your Google account to get started instantly - no complicated registration process!
              </p>
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl">
                <h3 className="font-bold mb-2 text-cyan-700 dark:text-cyan-400">What you get:</h3>
                <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Instant account creation with Google OAuth</li>
                  <li>Starting XP points to begin your journey</li>
                  <li>Access to create and track habits</li>
                  <li>Personalized dashboard to monitor progress</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">2️⃣</span> Creating Habits
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Create habits with difficulty levels to match your goals. Each difficulty level rewards different amounts of XP when completed:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-400">🟢 Easy</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Simple daily habits
                  </p>
                  <div className="text-center font-bold text-green-600 dark:text-green-400">+10 XP</div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
                  <h3 className="font-bold text-lg mb-2 text-yellow-700 dark:text-yellow-400">🟡 Medium</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Moderate commitment
                  </p>
                  <div className="text-center font-bold text-yellow-600 dark:text-yellow-400">+25 XP</div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                  <h3 className="font-bold text-lg mb-2 text-red-700 dark:text-red-400">🔴 Hard</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Challenging goals
                  </p>
                  <div className="text-center font-bold text-red-600 dark:text-red-400">+50 XP</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">3️⃣</span> Earning XP & Building Streaks
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Complete your habits daily to earn XP points and build streaks. The more consistent you are, the more rewarding the experience:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-xl">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Earn XP Points</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">10-50 XP per habit completion based on difficulty</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-xl">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Build Streaks</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete habits daily to maintain consecutive day streaks</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl">
                  <span className="text-3xl">📈</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Level Up</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Every 100 XP earned gives you 1 level</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">4️⃣</span> Redeeming Rewards
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Visit the Rewards Marketplace to browse available digital products. Use your hard-earned XP to redeem:
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
                    <span><strong>Be consistent:</strong> Daily completions build momentum and increase streaks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Start small:</strong> Create achievable habits before tackling challenging ones</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Track progress:</strong> Use the stats dashboard to monitor your achievements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Mix difficulties:</strong> Combine easy, medium, and hard habits for balanced XP</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span><strong>Celebrate wins:</strong> Redeem rewards when you reach milestones!</span>
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
