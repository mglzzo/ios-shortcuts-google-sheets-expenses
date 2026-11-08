import { db } from "../../db/client/Client.js";
import { transacoes } from "../../db/schema/schema.js";
import { normalizarParaBusca } from "../../categorizar.js";

// Dados de uma transação nova. O estabelecimento normalizado
// é calculado aqui, para todas as origens usarem a mesma regra.
export type NovaTransacao = Omit<
  typeof transacoes.$inferInsert,
  "estabelecimentoNormalizado"
>;

export interface ResultadoInsercao {
  total: number;
  inseridas: number;
  ignoradas: number;
  transacoesInseridas: (typeof transacoes.$inferSelect)[];
}

// Mesma normalização já usada na categorização (normalizarParaBusca).
// Se ela resultar em texto vazio, usa o texto original em maiúsculas
// para não tratar como iguais nomes diferentes.
export function normalizarEstabelecimento(
  estabelecimentoBruto: string
): string {
  return (
    normalizarParaBusca(estabelecimentoBruto) ||
    estabelecimentoBruto.trim().toUpperCase()
  );
}

const TAMANHO_LOTE = 200;

// Critério de duplicidade (índice único no banco):
// conta + data + estabelecimento normalizado + valor (com sinal).
// O ON CONFLICT DO NOTHING sem alvo ignora qualquer violação de
// unicidade, inclusive a de (conta, id_pluggy).
export async function inserirTransacoesSemDuplicidade(
  valores: NovaTransacao[]
): Promise<ResultadoInsercao> {
  const transacoesInseridas: (typeof transacoes.$inferSelect)[] =
    [];

  for (let i = 0; i < valores.length; i += TAMANHO_LOTE) {
    const lote = valores
      .slice(i, i + TAMANHO_LOTE)
      .map((valor) => ({
        ...valor,
        estabelecimentoNormalizado: normalizarEstabelecimento(
          valor.estabelecimentoBruto
        ),
      }));

    const inseridas = await db
      .insert(transacoes)
      .values(lote)
      .onConflictDoNothing()
      .returning();

    transacoesInseridas.push(...inseridas);
  }

  return {
    total: valores.length,
    inseridas: transacoesInseridas.length,
    ignoradas: valores.length - transacoesInseridas.length,
    transacoesInseridas,
  };
}
