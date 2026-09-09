import { Router } from "express";
import openapiSpec from "../../openapi.json" with { type: "json" };

const router = Router();

// Este router é montado em app.use("/docs", docsRoutes) no app.ts,
// então as rotas abaixo respondem em GET /docs e GET /docs/openapi.json.

// Serve a especificação em JSON puro
router.get("/openapi.json", (_req, res) => {
  res.json(openapiSpec);
});

// Serve a UI do Swagger, carregando o swagger-ui-dist via CDN.
// Evitamos o pacote swagger-ui-express de propósito: ele depende de
// servir arquivos estáticos do disco (fs), o que não funciona bem
// em runtime de Cloudflare Workers.
router.get("/", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>AppScriptsFinance - API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/docs/openapi.json",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis],
        });
      };
    </script>
  </body>
</html>`);
});

export default router;
