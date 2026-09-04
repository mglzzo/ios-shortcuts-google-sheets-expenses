import express from "express";

import authRoutes from "./auth/auth.routes.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  return res.json({
    status: "API funcionando",
  });
});

app.use("/auth", authRoutes);

export default app;