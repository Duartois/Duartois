/**
 * Applies GraphCMS/Hygraph CDN image transformations via URL params.
 *
 * GraphAssets supports the following transform handles appended to the base URL:
 *   /resize=width:W                 → resize to width W (maintains AR)
 *   /output=format:webp,quality:Q  → convert format + set quality
 *   /compress                       → lossless compress
 *
 * Example:
 *   Input:  https://ap-south-1.graphassets.com/.../cmh50r86s...
 *   Output: https://ap-south-1.graphassets.com/.../resize=width:1200/output=format:webp,quality:85/cmh50r86s...
 *
 * IMPORTANT: Only apply transforms if the URL is a graphassets.com URL.
 * External URLs from other CDNs are returned as-is.
 */
export const getOptimizedGraphAssetsUrl = (
  url: string,
  options: {
    width?: number;
    quality?: number;
    format?: "webp" | "auto";
  } = {},
): string => {
  if (!url.includes("graphassets.com")) {
    return url;
  }

  const { width, quality = 85, format = "webp" } = options;

  // GraphAssets CDN uses a path-based transform API.
  // The pattern is: <base>/<transforms>/<handle>
  // We extract the handle (last path segment) and inject transforms before it.
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/").filter(Boolean);

  if (pathParts.length < 2) {
    return url;
  }

  const handle = pathParts[pathParts.length - 1];
  const basePath = pathParts.slice(0, -1).join("/");

  const transforms: string[] = [];

  if (width) {
    transforms.push(`resize=width:${width}`);
  }

  if (format === "webp") {
    transforms.push(`output=format:webp,quality:${quality}`);
  }

  const transformPath = transforms.join("/");
  urlObj.pathname = `/${basePath}/${transformPath}/${handle}`;

  return urlObj.toString();
};

/**
 * Calculates the `sizes` attribute for Next.js Image based on where
 * the image is displayed in the layout. This ensures the browser
 * downloads the smallest image that still looks sharp.
 *
 * All breakpoints mirror the CSS custom properties in globals.css:
 *   --left-right-margin: 240px (>= 75em)
 *   --left-right-margin: 96px  (62em–75em)
 *   --left-right-margin: 48px  (36em–62em)
 *   --left-right-margin: 24px  (< 36em)
 */
export const IMAGE_SIZES = {
  /**
   * Full-width image (hero) — spans 100vw minus horizontal margins.
   * At desktop: 100vw - 2*240px = calc(100vw - 480px)
   */
  hero: [
    "(max-width: 35.99em) 100vw",
    "(max-width: 61.99em) 100vw",
    "(max-width: 74.99em) calc(100vw - 192px)",
    "calc(100vw - 480px)",
  ].join(", "),

  /**
   * Project cover on the /work list page — left column is ~50% wide
   * minus the internal margin (24px).
   */
  workCover: [
    "(max-width: 61.99em) 0px",
    "(max-width: 74.99em) calc(50vw - 120px)",
    "calc(50vw - 264px)",
  ].join(", "),

  /**
   * Gallery image inside a project page — full content width
   * minus the left-right-margin on both sides.
   */
  gallery: [
    "(max-width: 35.99em) 100vw",
    "(max-width: 61.99em) 100vw",
    "(max-width: 74.99em) calc(100vw - 192px)",
    "calc(100vw - 480px)",
  ].join(", "),
} as const;
