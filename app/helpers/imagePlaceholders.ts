const shimmer = (width: number, height: number) => `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g">
        <stop stop-color="rgba(255,255,255,0.08)" offset="0%" />
        <stop stop-color="rgba(255,255,255,0.2)" offset="50%" />
        <stop stop-color="rgba(255,255,255,0.08)" offset="100%" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="rgba(255,255,255,0.04)" />
    <rect width="${width}" height="${height}" fill="url(#g)" />
  </svg>
`;

const toBase64 = (value: string) =>
  typeof window === "undefined"
    ? Buffer.from(value).toString("base64")
    : window.btoa(value);

export const getShimmerDataURL = (width: number, height: number) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;
