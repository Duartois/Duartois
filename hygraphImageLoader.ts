/**
 * hygraphImageLoader.ts
 *
 * Custom Next.js image loader that generates URLs pointing directly to the
 * Hygraph (GraphAssets) CDN transformation API, bypassing the /_next/image
 * proxy entirely.
 *
 * HOW IT WORKS:
 *  - Hygraph URL format:  https://[region].graphassets.com/[projectId]/[assetId]
 *  - Transform URL format: https://[region].graphassets.com/[projectId]/resize=width:[w]/output=format:webp,quality:[q]/[assetId]
 *
 * This means images are served directly from Hygraph's CDN edge — the same
 * domain (eu-central-1.graphassets.com / ap-south-1.graphassets.com) will
 * appear as a separate Source in DevTools, just like the reference site.
 *
 * For non-Hygraph URLs (local public/ assets like /about-01.avif), the
 * loader falls through to Next.js default behavior.
 */

import type { ImageLoaderProps } from "next/image";

const GRAPHASSETS_HOSTNAME_PATTERN = /\.graphassets\.com$/;

/**
 * Parses a Hygraph asset URL and extracts its parts.
 *
 * Input:  "https://ap-south-1.graphassets.com/cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6"
 * Output: { origin: "https://ap-south-1.graphassets.com", projectId: "cmgz13kwo148a07pgfyp3e2v0", assetId: "cmljxh8i16lhe07ph1o439el6" }
 *
 * Returns null for any URL that doesn't match the expected Hygraph format.
 */
function parseHygraphUrl(
  src: string,
): { origin: string; projectId: string; assetId: string } | null {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  if (!GRAPHASSETS_HOSTNAME_PATTERN.test(url.hostname)) {
    return null;
  }

  // pathname is like: /cmgz13kwo148a07pgfyp3e2v0/cmljxh8i16lhe07ph1o439el6
  const parts = url.pathname.split("/").filter(Boolean);

  // We expect exactly [projectId, assetId].
  // If there are already transforms in the path (e.g. a previously built URL),
  // skip this loader to avoid double-transforming.
  if (parts.length !== 2) {
    return null;
  }

  const [projectId, assetId] = parts;

  return { origin: url.origin, projectId, assetId };
}

/**
 * Next.js custom image loader.
 *
 * Called by next/image for every size in the srcset.
 * Must be the default export of this file.
 */
export default function hygraphImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const parsed = parseHygraphUrl(src);

  // ── Non-Hygraph asset (e.g. /about-01.avif, /noise.png) ──────────────────
  // Fall back to the default Next.js image optimization URL so local public/
  // assets still get served correctly.
  if (!parsed) {
    const params = new URLSearchParams({
      url: src,
      w: String(width),
      q: String(quality ?? 75),
    });
    return `/_next/image?${params.toString()}`;
  }

  // ── Hygraph asset ─────────────────────────────────────────────────────────
  // Build a direct CDN URL using Hygraph's image transformation chain.
  //
  // Transform chain syntax: /[transform1]/[transform2]/assetId
  //   resize  → controls output dimensions
  //   output  → controls format and compression quality
  //
  // Hygraph serves WebP natively via output=format:webp.
  // The browser receives the best format without Next.js re-encoding.
  const q = quality ?? 80;

  const transforms = [
    `resize=width:${width}`,
    `output=format:webp,quality:${q}`,
  ].join("/");

  return `${parsed.origin}/${parsed.projectId}/${transforms}/${parsed.assetId}`;
}