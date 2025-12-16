export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-cyan-600 dark:text-cyan-400">About Gamified Habit Tracker</h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Our Mission</h2>
            <p>
              Transform your daily habits into an exciting gamified experience. We believe in making habit-building fun and rewarding through interactive challenges, achievement tracking, and a comprehensive rewards system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-cyan-600 dark:text-cyan-400">📌 Habit Tracking</h3>
                <p className="text-sm">Create and track daily habits with difficulty levels (Easy, Medium, Hard).</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400">⭐ XP Rewards</h3>
                <p className="text-sm">Earn XP points based on habit difficulty (10-50 points per completion).</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-emerald-600 dark:text-emerald-400">🔥 Streak System</h3>
                <p className="text-sm">Build consecutive day streaks and maintain momentum in your habits.</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-purple-600 dark:text-purple-400">🛍️ Rewards</h3>
                <p className="text-sm">Redeem your earned points for digital products in the marketplace.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">How It Works</h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">1.</span>
                <span>Sign up with your Google account to get started instantly</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">2.</span>
                <span>Create daily habits with different difficulty levels to match your goals</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">3.</span>
                <span>Complete habits daily to earn XP, build streaks, and level up</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">4.</span>
                <span>Redeem your XP points in the rewards marketplace for digital products</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Our Values</h2>
            <ul className="space-y-2">
              <li>✅ <strong>Motivation:</strong> Gamification that keeps you engaged and committed</li>
              <li>✅ <strong>Progress:</strong> Clear visibility into your habit development and streaks</li>
              <li>✅ <strong>Rewards:</strong> Real value for your consistency and dedication</li>
              <li>✅ <strong>Community:</strong> Compete and collaborate with other habit builders</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Join Us Today</h2>
            <p>
              Start building better habits today! Sign up now and begin your journey to establishing lasting habits while earning rewards and recognition.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
