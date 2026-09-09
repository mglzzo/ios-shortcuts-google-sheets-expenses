import express from "express";

import authRoutes from "./auth/auth.routes.js";
import transactionRoutes from "./transactions/transaction.routes.js";
const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  return res.json({
    status: "API funcionando",
  });
});

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);

export default app;