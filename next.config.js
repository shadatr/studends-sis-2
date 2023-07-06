
/** @type {import('next').NextConfig} */
const nextConfig = {
  vercel: {
    build: {
      cache: false,
    },
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-storage',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
