import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Press - Presupuestos Profesionales",
    short_name: "Press",
    description: "Crea presupuestos profesionales en PDF desde tu celular",
    start_url: "/app",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#1E3A8A",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
