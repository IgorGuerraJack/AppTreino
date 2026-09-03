import type { NextConfig } from "next";

/*
 * O GitHub Pages serve o app em /<repo> e só aceita arquivos estáticos.
 * As duas coisas ficam atrás de env vars para que o build normal — e um
 * deploy na Vercel, que roda o Next nativo na raiz — continuem funcionando.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const staticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(staticExport ? { output: "export" as const, trailingSlash: true } : {}),
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
