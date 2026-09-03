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
  desc,
  eq,
} from "drizzle-orm";

export async function listarTransacoes(
  usuarioId: string
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
      eq(
        conexoesBancarias.usuarioId,
        usuarioId
      )
    )
    .orderBy(
      desc(transacoes.data)
    );
}