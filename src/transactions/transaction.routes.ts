import {
  Router,
} from "express";

import {
  autenticar,
  type RequestAutenticada,
} from "../auth/auth.middleware.js";

import {
  listarTransacoes,
} from "./transaction.service.js";
import { corrigirCategoriaTransacao } from "../../categorizar.js";



const router = Router();

router.get(
  "/",
  autenticar,
  async (
    req: RequestAutenticada,
    res
  ) => {
    try {
      const usuarioId =
        req.user!.userId;

      const transacoes =
        await listarTransacoes(
          usuarioId
        );

      return res.json(
        transacoes
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        erro: "Erro ao buscar transações.",
      });
    }
  }
);

router.patch(
  "/:id/category",
  autenticar,
  async (
    req: RequestAutenticada,
    res
  ) => {
    try {
      const usuarioId =
        req.user!.userId;

      const transacaoId =
        req.params.id;

      if (typeof transacaoId !== "string") {
        return res.status(400).json({
          erro: "id da transação inválido.",
        });
      }

      const {
        categoriaId,
      } = req.body;

      if (
        !categoriaId ||
        typeof categoriaId !== "number"
      ) {
        return res.status(400).json({
          erro: "categoriaId inválido.",
        });
      }

      const resultado =
        await corrigirCategoriaTransacao(
          usuarioId,
          transacaoId,
          categoriaId
        );

      return res.json(
        resultado
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        erro:
          "Erro ao alterar categoria.",
      });
    }
  }
);

router.patch(
  "/:id/category",
  autenticar,
  async (
    req: RequestAutenticada,
    res
  ) => {
    try {
      const usuarioId =
        req.user!.userId;

      const transacaoId =
        req.params.id;

        if (typeof transacaoId !== "string") {
        return res.status(400).json({
          erro: "id da transação inválido.",
        });
      }
      
      const {
        categoriaId,
      } = req.body;

      if (
        !categoriaId ||
        typeof categoriaId !== "number"
      ) {
        return res.status(400).json({
          erro: "categoriaId inválido.",
        });
      }

      const resultado =
        await corrigirCategoriaTransacao(
          usuarioId,
          transacaoId,
          categoriaId
        );

      return res.json(
        resultado
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        erro:
          "Erro ao alterar categoria.",
      });
    }
  }
);