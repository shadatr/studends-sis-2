/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'cache',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
