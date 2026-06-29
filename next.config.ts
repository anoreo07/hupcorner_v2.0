import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

export default nextConfig
