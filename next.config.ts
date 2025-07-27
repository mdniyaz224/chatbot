import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for Netlify
  images: {
    unoptimized: true
  },
  
  // Enable experimental features for better compatibility
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },

  // Webpack configuration for MongoDB compatibility
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config;
  }
};

export default nextConfig;
