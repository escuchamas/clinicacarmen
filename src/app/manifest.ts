import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Carmen Gómez · Clínica de Fisioterapia",
    short_name: "Carmen Gómez",
    description: "Fisioterapia manual y Pilates terapéutico en Campillos, Málaga",
    start_url: "/",
    display: "standalone",
    background_color: "#F2ECE6",
    theme_color: "#8E7D6B",
    icons: [
      {
        src: "/logo-isotipo.jpeg",
        sizes: "any",
        type: "image/jpeg",
      },
    ],
  };
}
