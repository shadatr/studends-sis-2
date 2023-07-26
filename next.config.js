
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  generateEtags: false,
  revalidate: 0,
};

module.exports = nextConfig;
