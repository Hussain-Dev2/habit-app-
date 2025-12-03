/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip static generation for API routes
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
