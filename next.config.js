/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Explicitly set the root directory to avoid workspace detection issues
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.islamic.network' },
      { protocol: 'https', hostname: 'verses.quran.com' },
    ],
  },
  // Fix PWA manifest path
  async rewrites() {
    return [
      {
        source: '/manifest.webmanifest',
        destination: '/manifest.json',
      },
      {
        source: '/dev-sw.js',
        destination: '/sw.js',
      },
    ];
  },
};

module.exports = nextConfig;
