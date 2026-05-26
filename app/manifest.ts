import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Verse — Words that move you",
    short_name: "Verse",
    description: "Create, share, and export beautiful quotes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0E0E0E",
    theme_color: "#0E0E0E",
    orientation: "portrait",
    categories: ["lifestyle", "social", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Create a quote",
        short_name: "Create",
        description: "Open the editor and craft a new quote",
        url: "/?create=1",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "Your saved quotes",
        short_name: "Saved",
        description: "Open your bookmarked quotes",
        url: "/saved",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
    ],
  };
}
