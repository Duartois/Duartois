/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /*
     * Custom loader that bypasses the /_next/image proxy for Hygraph assets.
     *
     * Instead of Next.js re-encoding and serving images through its own
     * server, this loader generates URLs that point DIRECTLY to Hygraph's
     * CDN transformation API. The result:
     *
     *   - Images are served from eu-central-1.graphassets.com (or ap-south-1)
     *     just like the reference site — that domain will appear as its own
     *     Source in DevTools.
     *   - No cold-start / server-side encoding penalty on Vercel.
     *   - Hygraph's global CDN edge delivers the image closer to the user.
     *   - WebP conversion happens on Hygraph's infrastructure, not yours.
     *
     * The loader still falls through to /_next/image for local public/ assets
     * (SVGs, PNGs, AVIF) that aren't on Hygraph — those are already optimal
     * or too small to matter.
     */
    loader: "custom",
    loaderFile: "./hygraphImageLoader.ts",

    /*
     * remotePatterns is only enforced when using the built-in loader.
     * With a custom loader the responsibility shifts to the loader function,
     * which only generates Hygraph transform URLs for graphassets.com hosts.
     *
     * Keep the entries here so that any next/image usage that does NOT go
     * through the custom loader (e.g. unoptimized={true}) still has the
     * security allowlist in place.
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
     * Srcset breakpoints.
     * Next.js still uses these to decide which widths to request via the
     * loader — we just changed WHERE those requests go.
     */
    deviceSizes: [640, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [16, 32, 64, 96, 128, 256, 384, 640, 750, 1080],

    /*
     * formats is ignored when using a custom loader (format is controlled
     * by the loader itself — we hardcode WebP via Hygraph's output= param).
     */
    formats: ["image/avif", "image/webp"],

    /*
     * Cache TTL for the built-in optimizer (still used for local assets).
     */
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

module.exports = nextConfig;