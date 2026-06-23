import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Carmen Gómez · Clínica de Fisioterapia",
    short_name: "Carmen Gómez",
    description: "Fisioterapia manual y Pilates terapéutico en Campillos, Málaga",
    start_url: "/",
    display: "standalone",
    background_color: "#F5EFE9",
    theme_color: "#9B7B68",
    icons: [
      {
        src: "/logo-vertical.jpeg",
        sizes: "any",
        type: "image/jpeg",
      },
    ],
  };
}
