import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@0gfoundation/0g-storage-ts-sdk', 'ethers'],
  },
};

export default nextConfig;
