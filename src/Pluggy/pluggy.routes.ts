import { Router } from "express";

import {
  autenticar,
  type RequestAutenticada,
} from "../auth/auth.middleware.js";

import {
  sincronizarPluggy,
} from "./pluggy.service.js";

const router = Router();

router.post(
  "/sync",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const usuarioId = req.user!.userId;

      const resultado =
        await sincronizarPluggy(usuarioId);

      return res.status(200).json(resultado);

    } catch (error) {
      console.error(
        "ERRO AO SINCRONIZAR PLUGGY:",
        error
      );

      return res.status(500).json({
        erro:
          error instanceof Error
            ? error.message
            : "Erro ao sincronizar Pluggy.",
      });
    }
  }
);

export default router;