import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// El BFF corre detras de Traefik en http://bff.smartlogix.localhost (puerto 80).
// En dev (npm run dev) el frontend en :5173 evita CORS usando este proxy:
//   GET /api/dashboard  -->  http://127.0.0.1:80/dashboard  (Host: bff.smartlogix.localhost)
//
// Importante: apuntamos a 127.0.0.1 en lugar del hostname *.localhost porque
// Node.js no siempre resuelve el TLD .localhost via hosts/getaddrinfo (a
// diferencia de los browsers). Le mandamos el Host header correcto para
// que Traefik enrute al BFF igual que en el flujo real.
//
// En prod el frontend se sirve por Nginx y este mismo prefijo /api/* se
// proxea al BFF en la red Docker. El cliente (apiClient.ts) usa /api por
// defecto via VITE_API_BASE, asi que ambos modos comparten el mismo path.
const PROXY_TARGET = process.env.VITE_BFF_TARGET || "http://127.0.0.1:80";
const PROXY_HOST = process.env.VITE_BFF_HOST || "bff.smartlogix.localhost";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: PROXY_TARGET,
        changeOrigin: false,
        headers: { Host: PROXY_HOST },
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
