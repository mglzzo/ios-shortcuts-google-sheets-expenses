import { Router } from "express";

import {
  autenticar,
  type RequestAutenticada,
} from "../auth/auth.middleware.js";

import { lerValorMonetario } from "../shared/validacao.js";
import { obterRenda, salvarRenda } from "./income.service.js";

const router = Router();

// O usuarioId vem sempre do token JWT. Qualquer usuarioId
// enviado no corpo da requisição é ignorado.

router.get(
  "/",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const usuarioId = req.user!.userId;

      const renda = await obterRenda(usuarioId);

      return res.status(200).json(renda);
    } catch (error) {
      console.error("ERRO AO CONSULTAR RENDA:", error);

      return res.status(500).json({
        erro: "Erro ao consultar renda mensal.",
      });
    }
  }
);

router.put(
  "/",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const usuarioId = req.user!.userId;

      const valor = lerValorMonetario(req.body?.valor);

      if (valor === null) {
        return res.status(400).json({
          erro: "valor inválido. Informe um número maior ou igual a zero.",
        });
      }

      const renda = await salvarRenda(usuarioId, valor);

      return res.status(200).json(renda);
    } catch (error) {
      console.error("ERRO AO SALVAR RENDA:", error);

      return res.status(500).json({
        erro: "Erro ao salvar renda mensal.",
      });
    }
  }
);

export default router;
