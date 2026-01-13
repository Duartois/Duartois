const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ap-south-1.graphassets.com",
      },
      {
        protocol: "https",
        hostname: "eu-central-1.graphassets.com",
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
