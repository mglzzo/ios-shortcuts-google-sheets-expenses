import { Router } from "express";

import { autenticar } from "../auth/auth.middleware.js";
import { listarCategorias } from "./category.service.js";

const router = Router();

// GET /categories
router.get(
  "/",
  autenticar,
  async (_req, res) => {
    try {
      const categorias = await listarCategorias();

      return res.status(200).json({
        data: categorias,
      });
    } catch (error) {
      console.error(
        "ERRO AO LISTAR CATEGORIAS:",
        error
      );

      return res.status(500).json({
        erro:
          error instanceof Error
            ? error.message
            : "Erro ao listar categorias.",
      });
    }
  }
);

export default router;