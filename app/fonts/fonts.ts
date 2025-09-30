import localFont from "next/font/local";

export const neueMontreal = localFont({
  src: [
    {
      path: "../app/fonts/PPNeueMontreal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../app/fonts/PPNeueMontreal-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../app/fonts/PPNeueMontreal-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
  preload: true,
});