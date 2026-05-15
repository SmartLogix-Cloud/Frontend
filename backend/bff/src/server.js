import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 3000;

const MS_INVENTARIO = process.env.MS_INVENTARIO_URL || "http://ms-inventario:8080";
const MS_PEDIDO = process.env.MS_PEDIDO_URL || "http://ms-pedido:8080";
const MS_ENVIO = process.env.MS_ENVIO_URL || "http://ms-envio:8080";

app.use(morgan("combined"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "bff" });
});

app.get("/", (_req, res) => {
  res.json({
    service: "smartlogix-bff",
    version: "0.1.0",
    routes: ["/inventario/*", "/pedidos/*", "/envios/*"],
  });
});

app.use(
  "/inventario",
  createProxyMiddleware({
    target: MS_INVENTARIO,
    changeOrigin: true,
    pathRewrite: { "^/inventario": "" },
  })
);

app.use(
  "/pedidos",
  createProxyMiddleware({
    target: MS_PEDIDO,
    changeOrigin: true,
    pathRewrite: { "^/pedidos": "" },
  })
);

app.use(
  "/envios",
  createProxyMiddleware({
    target: MS_ENVIO,
    changeOrigin: true,
    pathRewrite: { "^/envios": "" },
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`BFF listening on :${PORT}`);
  console.log(`  -> inventario: ${MS_INVENTARIO}`);
  console.log(`  -> pedido:     ${MS_PEDIDO}`);
  console.log(`  -> envio:      ${MS_ENVIO}`);
});
