import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Duartois",
    short_name: "Duartois",
    description: "Portfólio Duartois com suporte completo a Progressive Web App.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    lang: "pt-BR",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/Logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
