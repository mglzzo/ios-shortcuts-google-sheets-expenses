import { Router } from "express";

import {
  autenticar,
  type RequestAutenticada,
} from "../auth/auth.middleware.js";

import {
  ehUuid,
  lerValorMonetario,
} from "../shared/validacao.js";

import {
  atualizarMeta,
  criarMeta,
  excluirMeta,
  listarMetas,
} from "./goal.service.js";

const router = Router();

function lerNome(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }

  const nome = valor.trim();

  return nome ? nome : null;
}

function lerDataAlvo(valor: unknown): string | null {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return null;
  }

  const data = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor
    ? valor
    : null;
}

router.get(
  "/",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const metas = await listarMetas(req.user!.userId);

      return res.status(200).json(metas);
    } catch (error) {
      console.error("ERRO AO LISTAR METAS:", error);

      return res.status(500).json({
        erro: "Erro ao listar metas.",
      });
    }
  }
);

router.post(
  "/",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const corpo = req.body ?? {};

      const nome = lerNome(corpo.nome);

      if (!nome) {
        return res.status(400).json({
          erro: "nome é obrigatório.",
        });
      }

      const dataAlvo = lerDataAlvo(corpo.dataAlvo);
      if (!dataAlvo) {
        return res.status(400).json({ erro: "dataAlvo é obrigatória e deve estar no formato YYYY-MM-DD." });
      }

      const valorDesejado = lerValorMonetario(
        corpo.valorDesejado
      );

      if (valorDesejado === null) {
        return res.status(400).json({
          erro: "valorDesejado inválido. Informe um número maior ou igual a zero.",
        });
      }

      let valorAcumulado = 0;

      if (corpo.valorAcumulado !== undefined) {
        const lido = lerValorMonetario(corpo.valorAcumulado);

        if (lido === null) {
          return res.status(400).json({
            erro: "valorAcumulado inválido. Informe um número maior ou igual a zero.",
          });
        }

        valorAcumulado = lido;
      }

      const meta = await criarMeta(req.user!.userId, {
        nome,
        valorDesejado,
        valorAcumulado,
        dataAlvo,
      });

      return res.status(201).json(meta);
    } catch (error) {
      console.error("ERRO AO CRIAR META:", error);

      return res.status(500).json({
        erro: "Erro ao criar meta.",
      });
    }
  }
);

router.patch(
  "/:id",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const id = req.params.id;

      if (!ehUuid(id)) {
        return res.status(400).json({
          erro: "id da meta inválido.",
        });
      }

      const corpo = req.body ?? {};

      const dados: {
        nome?: string;
        valorDesejado?: number;
        valorAcumulado?: number;
        dataAlvo?: string;
      } = {};

      if (corpo.nome !== undefined) {
        const nome = lerNome(corpo.nome);

        if (!nome) {
          return res.status(400).json({
            erro: "nome não pode ser vazio.",
          });
        }

        dados.nome = nome;
      }

      if (corpo.dataAlvo !== undefined) {
        const dataAlvo = lerDataAlvo(corpo.dataAlvo);
        if (!dataAlvo) {
          return res.status(400).json({ erro: "dataAlvo inválida. Informe uma data no formato YYYY-MM-DD." });
        }
        dados.dataAlvo = dataAlvo;
      }

      if (corpo.valorDesejado !== undefined) {
        const valor = lerValorMonetario(corpo.valorDesejado);

        if (valor === null) {
          return res.status(400).json({
            erro: "valorDesejado inválido. Informe um número maior ou igual a zero.",
          });
        }

        dados.valorDesejado = valor;
      }

      if (corpo.valorAcumulado !== undefined) {
        const valor = lerValorMonetario(corpo.valorAcumulado);

        if (valor === null) {
          return res.status(400).json({
            erro: "valorAcumulado inválido. Informe um número maior ou igual a zero.",
          });
        }

        dados.valorAcumulado = valor;
      }

      if (Object.keys(dados).length === 0) {
        return res.status(400).json({
          erro: "Informe ao menos um campo: nome, valorDesejado, valorAcumulado ou dataAlvo.",
        });
      }

      const meta = await atualizarMeta(
        req.user!.userId,
        id,
        dados
      );

      if (!meta) {
        return res.status(404).json({
          erro: "Meta não encontrada.",
        });
      }

      return res.status(200).json(meta);
    } catch (error) {
      console.error("ERRO AO EDITAR META:", error);

      return res.status(500).json({
        erro: "Erro ao editar meta.",
      });
    }
  }
);

router.delete(
  "/:id",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const id = req.params.id;

      if (!ehUuid(id)) {
        return res.status(400).json({
          erro: "id da meta inválido.",
        });
      }

      const excluida = await excluirMeta(
        req.user!.userId,
        id
      );

      if (!excluida) {
        return res.status(404).json({
          erro: "Meta não encontrada.",
        });
      }

      return res.status(204).send();
    } catch (error) {
      console.error("ERRO AO EXCLUIR META:", error);

      return res.status(500).json({
        erro: "Erro ao excluir meta.",
      });
    }
  }
);

export default router;
