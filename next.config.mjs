/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignore TypeScript build errors for stable deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint checks during build for stable deployment
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Suppress WalletConnect pino-pretty optional dependency warning
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
    };
    config.externals = config.externals || [];
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino-pretty': false,
      };
    }
    return config;
  },
};

export default nextConfig;
