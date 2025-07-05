/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/**',
      },
    ],
    // Disable image optimization in development
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Disable static optimization to prevent caching issues
  output: 'standalone',
};

// In production, we want to optimize images
if (process.env.NODE_ENV === 'production') {
  nextConfig.images.unoptimized = false;
}

module.exports = nextConfig;
