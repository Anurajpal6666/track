import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SAP LABS — MISSION 2027",
    short_name: "SAP Mission 2027",
    description: "Anuraj × Soumyajit Placement Preparation & Performance Management Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0D12",
    theme_color: "#161B26",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
