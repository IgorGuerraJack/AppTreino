import type { MetadataRoute } from "next";

/* Exigido pelo output: "export" — o manifesto é gerado no build, não por request. */
export const dynamic = "force-static";

/* O Next prefixa href de <Link> e assets, mas não o conteúdo do manifesto. */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Treino",
    short_name: "Treino",
    description: "Plano de treino e registro de séries, offline.",
    lang: "pt-BR",
    dir: "ltr",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#050505",
    theme_color: "#050505",
    categories: ["health", "fitness"],
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: `${base}/icons/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Iniciar treino", short_name: "Treino", url: `${base}/treino` },
    ],
  };
}
