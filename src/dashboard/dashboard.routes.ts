import { Router } from "express";

import {
  autenticar,
  type RequestAutenticada,
} from "../auth/auth.middleware.js";

import {
  mesAtual,
  mesValido,
  obterResumoDashboard,
} from "./dashboard.service.js";

const router = Router();

// GET /dashboard?mes=YYYY-MM  (mes é opcional; padrão: mês atual)
router.get(
  "/",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const usuarioId = req.user!.userId;

      let mes = mesAtual();

      if (req.query.mes !== undefined) {
        if (!mesValido(req.query.mes)) {
          return res.status(400).json({
            erro: "mes inválido. Use o formato YYYY-MM.",
          });
        }

        mes = req.query.mes;
      }

      const resumo = await obterResumoDashboard(usuarioId, mes);

      return res.status(200).json(resumo);
    } catch (error) {
      console.error("ERRO AO CARREGAR DASHBOARD:", error);

      return res.status(500).json({
        erro: "Erro ao carregar dashboard.",
      });
    }
  }
);

export default router;
