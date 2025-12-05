/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-5bf2f52797de4587a60587bc9dbfb63f.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'canlog-backend.onrender.com',
        pathname: '/**',
      },
    ],
  },
  trailingSlash: true,
};

module.exports = nextConfig;
