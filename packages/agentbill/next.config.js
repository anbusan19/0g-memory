/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@0gfoundation/0g-storage-ts-sdk', 'ethers'],
  },
};

module.exports = nextConfig;
