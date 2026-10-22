import express from "express";

import authRoutes from "./auth/auth.routes.js";
import transactionRoutes from "./transactions/transaction.routes.js";
import docsRoutes from "./docs/docs.routes.js";
import categoryRoutes from "./categories/category.routes.js";
import accountRoutes from "./accounts/account.routes.js";
import pluggyRoutes from "./Pluggy/pluggy.routes.js";

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowedOrigins = [
    "http://localhost:5173",
    "https://ios-shortcuts.pages.dev",
    "https://ios-shortcuts-google-sheets-expense.vercel.app",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  );

  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.get("/", (_req, res) => {
  return res.json({
    status: "API funcionando",
  });
});

app.use("/docs", docsRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/accounts", accountRoutes);
app.use("/pluggy", pluggyRoutes);

export default app;