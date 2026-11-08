import { db } from "../../db/client/Client.js";

import {
  transacoes,
  contas,
  conexoesBancarias,
  categorias,
} from "../../db/schema/schema.js";

import {
  normalizarParaBusca,
  salvarNoDicionario,
  recategorizarEstabelecimento  
} from "../../categorizar.js";

import {
  and,
  desc,
  eq,
} from "drizzle-orm";

import {
  inserirTransacoesSemDuplicidade,
  normalizarEstabelecimento,
} from "./transaction-deduplication.service.js";

export async function listarTransacoes(
  usuarioId: string,
  filtros: {
    contaId?: string;
    estabelecimento?: string;
  } = {}
) {
  return db
    .select({
      id: transacoes.id,
      data: transacoes.data,

      estabelecimento:
        transacoes.estabelecimentoBruto,

      valor: transacoes.valor,

      metodoPagamento:
        transacoes.metodoPagamento,

      categoriaId:
        transacoes.categoriaId,

      categoria:
        categorias.nome,

      categoriaPluggy:
        transacoes.categoriaPluggy,

      origem:
        transacoes.origem,
    })
    .from(transacoes)
    .innerJoin(
      contas,
      eq(
        transacoes.contaId,
        contas.id
      )
    )
    .innerJoin(
      conexoesBancarias,
      eq(
        contas.conexaoId,
        conexoesBancarias.id
      )
    )
    .leftJoin(
      categorias,
      eq(
        transacoes.categoriaId,
        categorias.id
      )
    )
    .where(
      and(
        eq(
          conexoesBancarias.usuarioId,
          usuarioId
        ),
        filtros.contaId
          ? eq(transacoes.contaId, filtros.contaId)
          : undefined,
        filtros.estabelecimento
          ? eq(
              transacoes.estabelecimentoNormalizado,
              normalizarEstabelecimento(
                filtros.estabelecimento
              )
            )
          : undefined
      )
    )
    .orderBy(
      desc(transacoes.data)
    );
}

export async function obterOuCriarContaManual(usuarioId: string) {
  const existente = await db
    .select({
      id: contas.id,
    })
    .from(contas)
    .innerJoin(
      conexoesBancarias,
      eq(contas.conexaoId, conexoesBancarias.id)
    )
    .where(
      and(
        eq(conexoesBancarias.usuarioId, usuarioId),
        eq(contas.nome, "Manual")
      )
    )
    .limit(1);

  const contaExistente = existente[0];

  if (contaExistente) {
    return contaExistente.id;
  }

  const conexoesCriadas = await db
    .insert(conexoesBancarias)
    .values({
      usuarioId,
      pluggyItemId: `manual-${usuarioId}`,
      instituicao: "Manual",
    })
    .returning({
      id: conexoesBancarias.id,
    });

  const conexaoManual = conexoesCriadas[0];

  if (!conexaoManual) {
    throw new Error("Erro ao criar conexão manual.");
  }

  const contasCriadas = await db
    .insert(contas)
    .values({
      conexaoId: conexaoManual.id,
      pluggyAccountId: `manual-${usuarioId}`,
      nome: "Manual",
      tipo: "manual",
    })
    .returning({
      id: contas.id,
    });

  const contaManual = contasCriadas[0];

  if (!contaManual) {
    throw new Error("Erro ao criar conta manual.");
  }

  return contaManual.id;
}


export async function criarTransacaoManual(
  usuarioId: string,
  dados: {
    data: string;
    estabelecimento: string;
    valor: number;
    metodoPagamento: string;
    categoriaId?: number;
    observacao?: string;
  }
) {
  const contaId = await obterOuCriarContaManual(usuarioId);

  const resultado = await inserirTransacoesSemDuplicidade([
    {
      contaId,
      data: dados.data,
      estabelecimentoBruto: dados.estabelecimento,
      valor: dados.valor.toString(),
      metodoPagamento: dados.metodoPagamento,
      categoriaId: dados.categoriaId,
      observacao: dados.observacao ?? null,
      origem: "manual",
    },
  ]);

  return {
    total: resultado.total,
    inseridas: resultado.inseridas,
    ignoradas: resultado.ignoradas,
    transacao: resultado.transacoesInseridas[0] ?? null,
  };
}