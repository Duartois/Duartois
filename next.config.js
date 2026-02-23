/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar compressão gzip/brotli para reduzir tamanho dos assets no mobile
  compress: true,

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
    // Tamanhos otimizados para mobile (375, 414, 768) e desktop
    deviceSizes: [375, 414, 640, 768, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [16, 32, 64, 96, 128, 256, 384, 640, 750, 1080],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  // Headers de segurança e performance para mobile
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Habilita DNS prefetch para melhorar performance de conexão no mobile
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        // Cache longo para fontes (imutáveis após hash)
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache longo para imagens estáticas
        source: "/(.*\\.(?:png|jpg|jpeg|gif|svg|ico|avif|webp))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
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
