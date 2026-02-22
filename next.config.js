/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./hygraphImageLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ap-south-1.graphassets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "eu-central-1.graphassets.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [16, 32, 64, 96, 128, 256, 384, 640, 750, 1080],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@store": require("path").resolve(__dirname, "app/store"),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.optimization = {
      ...(config.optimization || {}),
      splitChunks: {
        ...(config.optimization?.splitChunks || {}),
        chunks: "all",
      },
    };

    return config;
  },
};

module.exports = nextConfig;
