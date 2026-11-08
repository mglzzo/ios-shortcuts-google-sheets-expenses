import { Router } from "express";

import {
  autenticar,
  type RequestAutenticada,
} from "../auth/auth.middleware.js";

import { ehUuid } from "../shared/validacao.js";

import {
  contaPertenceAoUsuario,
  listarEstabelecimentos,
} from "./establishment.service.js";

const router = Router();

// GET /establishments?contaId=...&search=...
router.get(
  "/",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const usuarioId = req.user!.userId;

      const filtros: { contaId?: string; search?: string } = {};

      if (req.query.contaId !== undefined) {
        const contaId = req.query.contaId;

        if (!ehUuid(contaId)) {
          return res.status(400).json({
            erro: "contaId inválido.",
          });
        }

        const pertence = await contaPertenceAoUsuario(
          usuarioId,
          contaId
        );

        if (!pertence) {
          return res.status(404).json({
            erro: "Conta não encontrada.",
          });
        }

        filtros.contaId = contaId;
      }

      if (typeof req.query.search === "string") {
        const search = req.query.search.trim();

        if (search) {
          filtros.search = search;
        }
      }

      const estabelecimentos = await listarEstabelecimentos(
        usuarioId,
        filtros
      );

      return res.status(200).json(estabelecimentos);
    } catch (error) {
      console.error("ERRO AO LISTAR ESTABELECIMENTOS:", error);

      return res.status(500).json({
        erro: "Erro ao listar estabelecimentos.",
      });
    }
  }
);

export default router;
