// Load root .env for local dev. dotenv silently no-ops if the file is absent
// (e.g. on Vercel, where env vars are injected directly into process.env).
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@0gfoundation/0g-storage-ts-sdk', 'ethers'],
  },
};

module.exports = nextConfig;
