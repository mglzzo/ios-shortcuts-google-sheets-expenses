import express from "express";
import cors from "cors";

import authRoutes from "./auth/auth.routes.js";
import transactionRoutes from "./transactions/transaction.routes.js";
import categoryRoutes from "./categories/category.routes.js";
import accountRoutes from "./accounts/account.routes.js";
import pluggyRoutes from "./Pluggy/pluggy.routes.js";
import docsRoutes from "./docs/docs.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://SEU-FRONTEND.workers.dev",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "API funcionando",
  });
});
app.use("/docs", docsRoutes);
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/categories", categoryRoutes);
app.use("/accounts", accountRoutes);
app.use("/pluggy", pluggyRoutes);

export default app;