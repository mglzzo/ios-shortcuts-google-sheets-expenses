import { Router } from "express";
import { autenticar, RequestAutenticada } from "../auth/auth.middleware.js";
import { listarContas } from "./account.service.js";



const router = Router();

router.get(
  "/",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const usuarioId = req.user!.userId;

      const contas = await listarContas(usuarioId);

      return res.status(200).json({
        data: contas,
      });
    } catch (error) {
      console.error("ERRO AO LISTAR CONTAS:", error);

      return res.status(400).json({
        erro:
          error instanceof Error
            ? error.message
            : "Erro ao listar contas.",
      });
    }
  }
);

export default router;