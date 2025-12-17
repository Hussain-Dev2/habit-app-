/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip static generation for API routes
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configure headers for ad networks
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://*.googlesyndication.com https://adservice.google.com https://*.doubleclick.net https://*.effectivegatecpm.com https://*.topcreativeformat.com https://*.highperformanceformat.com",
              "frame-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.effectivegatecpm.com https://*.topcreativeformat.com https://*.highperformanceformat.com",
              "img-src 'self' data: blob: https: http:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://pagead2.googlesyndication.com https://*.google-analytics.com https://*.effectivegatecpm.com https://*.topcreativeformat.com https://*.highperformanceformat.com https://api.knock.app wss://api.knock.app",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
