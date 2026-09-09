import express from "express";

import authRoutes from "./auth/auth.routes.js";
import transactionRoutes from "./transactions/transaction.routes.js";
import docsRoutes from "./docs/docs.routes.js";
import categoryRoutes from "./categories/category.routes.js";
import accountRoutes from "./accounts/account.routes.js";
import pluggyRoutes from "./Pluggy/pluggy.routes.js";
const app = express();

app.use(express.json());

// ...
app.use("/docs", docsRoutes);

app.get("/", (_req, res) => {
  return res.json({
    status: "API funcionando",
  });
});

app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/accounts", accountRoutes);
app.use("/pluggy", pluggyRoutes);
app.use("/docs", docsRoutes); // <- novo

export default app;