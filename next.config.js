/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /*
     * Allow Next.js Image Optimization for GraphCMS/Hygraph assets.
     * Both CDN regions used in projectDetails.ts are covered.
     */
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

    /*
     * Generate srcsets at these widths so the browser always finds
     * a size close to what it needs — no more than ~20% waste.
     *
     * Breakpoints chosen to match the layout's real rendered widths:
     *   - 640  → mobile full-width gallery
     *   - 828  → medium mobile (Next.js default kept)
     *   - 1080 → tablet / work cover column
     *   - 1200 → small desktop hero
     *   - 1440 → standard desktop (--left-right-margin: 240px × 2 = 480px off)
     *   - 1920 → large desktop / retina
     *   - 2560 → 2× retina desktop
     */
    deviceSizes: [640, 828, 1080, 1200, 1440, 1920, 2560],

    /*
     * Intermediate sizes for fill/responsive images that don't span
     * full viewport width (gallery images, covers).
     */
    imageSizes: [16, 32, 64, 96, 128, 256, 384, 640, 750, 1080],

    /*
     * Prefer AVIF for ~50% smaller files vs WebP with equal quality.
     * Falls back to WebP, then the original format.
     * Next.js serves the best format the browser supports automatically.
     */
    formats: ["image/avif", "image/webp"],

    /*
     * Minimum time (seconds) Next.js caches an optimized image.
     * 7 days is safe since CDN images don't change URL when content changes.
     */
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

module.exports = nextConfig;


