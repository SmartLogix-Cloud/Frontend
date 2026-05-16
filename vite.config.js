import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// El BFF corre detras de Traefik en http://bff.smartlogix.localhost (puerto 80).
// En dev (npm run dev) el frontend en :5173 evita CORS usando este proxy:
//   GET /api/dashboard  -->  http://bff.smartlogix.localhost/dashboard
//
// En prod, el frontend se sirve por Nginx y el mismo prefijo /api/* puede
// proxearse al BFF en la red Docker. El cliente (apiClient.ts) usa /api
// por defecto via VITE_API_BASE, asi que ambos modos comparten el mismo path.
const BFF_TARGET = process.env.VITE_BFF_TARGET || "http://bff.smartlogix.localhost";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: BFF_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
