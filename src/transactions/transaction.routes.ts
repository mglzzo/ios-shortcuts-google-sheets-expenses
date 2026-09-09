import {
  Router,
} from "express";

import {
  autenticar,
  type RequestAutenticada,
} from "../auth/auth.middleware.js";

import {
  listarTransacoes, criarTransacaoManual,
} from "./transaction.service.js";
import { corrigirCategoriaTransacao } from "../../categorizar.js";

import {
  converterExcelParaPreview,
  confirmarImportacao,
  type TransacaoImportada,
} from "./transaction-import.service.js";

import multer from "multer";
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

router.post("/manual", autenticar, async (req: RequestAutenticada, res) => {
  try {
    console.log("BODY RECEBIDO:", req.body);

    const usuarioId = req.user!.userId;

    const resultado = await criarTransacaoManual(
      usuarioId,
      req.body
    );

    console.log("RESULTADO SERVICE:", resultado);

    return res.status(201).json(resultado);
  } catch (error) {
    console.error("ERRO MANUAL:", error);

    return res.status(500).json({
      erro: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/import/preview",
  autenticar,
  upload.single("arquivo"),
  async (req: RequestAutenticada, res) => {
    try {
      const arquivo = req.file;

      if (!arquivo) {
        return res.status(400).json({
          erro: "Arquivo não enviado.",
        });
      }

      if (
        !arquivo.originalname
          .toLowerCase()
          .endsWith(".xlsx")
      ) {
        return res.status(400).json({
          erro: "Por enquanto apenas arquivos .xlsx são aceitos.",
        });
      }

      console.log(
        "Arquivo recebido:",
        arquivo.originalname
      );

      console.log(
        "Tamanho:",
        arquivo.size
      );

      const arrayBuffer =
        arquivo.buffer.buffer.slice(
          arquivo.buffer.byteOffset,
          arquivo.buffer.byteOffset +
            arquivo.buffer.byteLength
        ) as ArrayBuffer;

      const preview =
        await converterExcelParaPreview(
          arrayBuffer
        );

      return res.status(200).json(preview);
    } catch (error) {
      console.error(
        "ERRO IMPORT PREVIEW:",
        error
      );

      return res.status(500).json({
        erro:
          error instanceof Error
            ? error.message
            : "Erro ao processar planilha.",
      });
    }
  }
);

router.post(
  "/import/confirm",
  autenticar,
  async (req: RequestAutenticada, res) => {
    try {
      const usuarioId = req.user!.userId;

      const { transacoes } = req.body as {
        transacoes?: TransacaoImportada[];
      };

      if (!Array.isArray(transacoes)) {
        return res.status(400).json({
          erro: "transacoes deve ser uma lista.",
        });
      }

      const resultado =
        await confirmarImportacao(
          usuarioId,
          transacoes
        );

      return res.status(201).json(resultado);
    } catch (error) {
      console.error(
        "ERRO IMPORT CONFIRM:",
        error
      );

      return res.status(500).json({
        erro:
          error instanceof Error
            ? error.message
            : "Erro ao importar transações.",
      });
    }
  }
);

