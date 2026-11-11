import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/client/Client.js";
import { metasFinanceiras } from "../../db/schema/schema.js";

type MetaBanco = typeof metasFinanceiras.$inferSelect;

export interface MetaFinanceira {
  id: string;
  nome: string;
  valorDesejado: number;
  valorAcumulado: number;
  dataAlvo: string | null;
  percentualConcluido: number;
  createdAt: Date;
  atualizadoEm: Date;
}

function paraResposta(meta: MetaBanco): MetaFinanceira {
  const valorDesejado = Number(meta.valorDesejado);
  const valorAcumulado = Number(meta.valorAcumulado);

  const percentualConcluido =
    valorDesejado > 0
      ? Math.round((valorAcumulado / valorDesejado) * 10000) /
        100
      : 0;

  return {
    id: meta.id,
    nome: meta.nome,
    valorDesejado,
    valorAcumulado,
    dataAlvo: meta.dataAlvo,
    percentualConcluido,
    createdAt: meta.createdAt,
    atualizadoEm: meta.atualizadoEm,
  };
}

export async function listarMetas(
  usuarioId: string
): Promise<MetaFinanceira[]> {
  const metas = await db
    .select()
    .from(metasFinanceiras)
    .where(eq(metasFinanceiras.usuarioId, usuarioId))
    .orderBy(asc(metasFinanceiras.createdAt));

  return metas.map(paraResposta);
}

export async function criarMeta(
  usuarioId: string,
  dados: {
    nome: string;
    valorDesejado: number;
    valorAcumulado: number;
    dataAlvo: string;
  }
): Promise<MetaFinanceira> {
  const [meta] = await db
    .insert(metasFinanceiras)
    .values({
      usuarioId,
      nome: dados.nome,
      valorDesejado: dados.valorDesejado.toFixed(2),
      valorAcumulado: dados.valorAcumulado.toFixed(2),
      dataAlvo: dados.dataAlvo,
    })
    .returning();

  if (!meta) {
    throw new Error("Erro ao criar meta.");
  }

  return paraResposta(meta);
}

// Só altera a meta se ela pertencer ao usuário (id + usuarioId).
// Retorna null quando a meta não existe ou é de outro usuário.
export async function atualizarMeta(
  usuarioId: string,
  id: string,
  dados: {
    nome?: string;
    valorDesejado?: number;
    valorAcumulado?: number;
    dataAlvo?: string;
  }
): Promise<MetaFinanceira | null> {
  const alteracoes: Partial<typeof metasFinanceiras.$inferInsert> =
    {
      atualizadoEm: new Date(),
    };

  if (dados.nome !== undefined) {
    alteracoes.nome = dados.nome;
  }

  if (dados.valorDesejado !== undefined) {
    alteracoes.valorDesejado = dados.valorDesejado.toFixed(2);
  }

  if (dados.valorAcumulado !== undefined) {
    alteracoes.valorAcumulado = dados.valorAcumulado.toFixed(2);
  }

  if (dados.dataAlvo !== undefined) {
    alteracoes.dataAlvo = dados.dataAlvo;
  }

  const [meta] = await db
    .update(metasFinanceiras)
    .set(alteracoes)
    .where(
      and(
        eq(metasFinanceiras.id, id),
        eq(metasFinanceiras.usuarioId, usuarioId)
      )
    )
    .returning();

  return meta ? paraResposta(meta) : null;
}

export async function excluirMeta(
  usuarioId: string,
  id: string
): Promise<boolean> {
  const excluidas = await db
    .delete(metasFinanceiras)
    .where(
      and(
        eq(metasFinanceiras.id, id),
        eq(metasFinanceiras.usuarioId, usuarioId)
      )
    )
    .returning({ id: metasFinanceiras.id });

  return excluidas.length > 0;
}
