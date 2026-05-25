import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Verse",
    short_name: "Verse",
    description: "A digital mood and quote experience.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0E0E",
    theme_color: "#0E0E0E",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
