export default function Contact() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-cyan-600 dark:text-cyan-400">Contact Us</h1>
        
        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <p className="text-lg mb-6">
              Have questions, feedback, or need support? We'd love to hear from you!
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-3 text-cyan-600 dark:text-cyan-400">📧 Email Support</h2>
              <p className="mb-2">For general inquiries and support:</p>
              <a href="mailto:dev.hussain.iq@gmail.com" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
                dev.hussain.iq@gmail.com
              </a>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-3 text-orange-600 dark:text-orange-400">💼 Business Inquiries</h2>
              <p className="mb-2">For partnerships and business matters:</p>
              <a href="mailto:devhussain90@gmail.com" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
                devhussain90@gmail.com
              </a>
            </div>
          </section>

          <section className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-3 text-emerald-600 dark:text-emerald-400">⏰ Response Time</h2>
            <p>
              We typically respond to all inquiries within 24-48 hours during business days.
              For urgent matters, please mark your email as "Urgent" in the subject line.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <summary className="font-bold cursor-pointer text-gray-900 dark:text-white">
                  How do I earn points?
                </summary>
                <p className="mt-2 text-sm">
                  You can earn points by clicking, watching ads, completing activities, spinning the wheel,
                  and participating in daily bonuses. Each activity has different point rewards and cooldowns.
                </p>
              </details>

              <details className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <summary className="font-bold cursor-pointer text-gray-900 dark:text-white">
                  How do I redeem my points?
                </summary>
                <p className="mt-2 text-sm">
                  Visit the Shop page to browse available digital products and rewards. Click on any item
                  to see the point cost and redeem your points.
                </p>
              </details>

              <details className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <summary className="font-bold cursor-pointer text-gray-900 dark:text-white">
                  What is the level system?
                </summary>
                <p className="mt-2 text-sm">
                  As you earn lifetime points, you progress through levels (1-12). Higher levels unlock
                  better multipliers for points, bigger ad rewards, and enhanced combo bonuses.
                </p>
              </details>

              <details className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <summary className="font-bold cursor-pointer text-gray-900 dark:text-white">
                  How do referrals work?
                </summary>
                <p className="mt-2 text-sm">
                  Share your unique referral link with friends. When they sign up using your link,
                  you earn 100 points and they receive a 250 point welcome bonus!
                </p>
              </details>
            </div>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Additional Resources</h2>
            <ul className="space-y-2">
              <li>
                📖 <a href="/privacy" className="text-cyan-600 dark:text-cyan-400 hover:underline">Privacy Policy</a>
              </li>
              <li>
                ℹ️ <a href="/about" className="text-cyan-600 dark:text-cyan-400 hover:underline">About Us</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
