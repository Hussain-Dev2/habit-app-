export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-cyan-600 dark:text-cyan-400">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including when you create an account,
              participate in activities, or communicate with us. This may include your email address and
              activity data within the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your requests and transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Advertising</h2>
            <p>
              We use Google AdSense to display advertisements on our site. Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.
              <br /><br />
              Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">Google's Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">www.aboutads.info</a>.
              <br /><br />
              For more information on how Google uses data when you use our partners' sites or apps, please visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">How Google uses data when you use our partners' sites or apps</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Data Security</h2>
            <p>
              We implement reasonable security measures to protect your personal information. However, no
              method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Third-Party Services</h2>
            <p>
              Our service may contain links to third-party websites. We are not responsible for the privacy
              practices of these external sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Children's Privacy</h2>
            <p>
              Our service is not directed to children under 13. We do not knowingly collect personal
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by
              posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our support channels.
            </p>
          </section>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}
