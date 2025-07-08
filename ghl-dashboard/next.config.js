/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,
  
  // Disable source maps in development for faster builds
  productionBrowserSourceMaps: false,
  
  // Optimize images
  images: {
    domains: ['graph.facebook.com'],
  },
  
  // Experimental features for better performance
  experimental: {
    // Disable CSS optimization as it may cause issues
    // optimizeCss: true,
  },
  
  // Turbopack configuration (now stable)
  turbopack: {
    resolveAlias: {
      // Add any import aliases if needed
    },
  },
  
  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  // Webpack configuration for faster builds
  webpack: (config, { dev, isServer }) => {
    // In development, use cheaper source maps
    if (dev && !isServer) {
      config.devtool = 'cheap-module-source-map';
    }
    
    return config;
  },
};

module.exports = nextConfig;