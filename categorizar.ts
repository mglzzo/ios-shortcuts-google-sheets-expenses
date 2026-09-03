import {
  APELIDOS_ESTABELECIMENTO,
  MAPA_CATEGORIAS,
} from "./config/Config.js";

import { db } from "./db/client/Client.js";
import {
  categorias,
  regrasCategorizacao,
  transacoes,
  contas,
  conexoesBancarias,
} from "./db/schema/schema.js";

import {
  and,
  eq,
  isNull,
} from "drizzle-orm";



// ======================================================
// TIPOS
// ======================================================

interface TransacaoParaCategorizar {
  description?: string | null;
  category?: string | null;
}


// ======================================================
// NORMALIZAÇÃO
// ======================================================

export function limparEstabelecimento(
  descricao: string
): string {
  if (!descricao) return "";

  let nome = descricao.includes("|")
    ? descricao.split("|").pop()!
    : descricao;

  nome = nome
    .replace(/^IFD\*/i, "IFD ")
    .replace(/^MP \*/i, "")
    .replace(/^CRD\*\d+\s*/i, "")
    .replace(/^Uber UBER \*/i, "Uber ")
    .trim();

  const nomeUpper = nome.toUpperCase();

  for (
    const [chave, apelido] of Object.entries(
      APELIDOS_ESTABELECIMENTO
    )
  ) {
    if (nomeUpper.includes(chave.toUpperCase())) {
      return apelido;
    }
  }

  return nome
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}


export function normalizarParaBusca(
  descricao: string
): string {
  if (!descricao) return "";

  const nome = descricao.includes("|")
    ? descricao.split("|").pop()!
    : descricao;

  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(
      /\bLTDA\b|\bME\b|\bEIRELI\b|\bS\.?A\.?\b|\bCIA\b/g,
      ""
    )
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\b\d{4,}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ======================================================
// MÉTODO DE PAGAMENTO
// ======================================================

export function inferirMetodo(
  descricao: string
): string | null {
  if (!descricao) return null;

  const upper = descricao.toUpperCase();

  if (
    upper.includes("TRANSFERÊNCIA ENVIADA") ||
    upper.includes("TRANSFERENCIA ENVIADA")
  ) {
    return "PIX";
  }

  if (
    upper.includes("COMPRA NO DÉBITO") ||
    upper.includes("COMPRA NO DEBITO")
  ) {
    return "Débito";
  }

  if (
    upper.includes("COMPRA NO CRÉDITO") ||
    upper.includes("COMPRA NO CREDITO")
  ) {
    return "Crédito";
  }

  return null;
}


// ======================================================
// CATEGORIAS
// ======================================================

function mapearCategoriaGenerica(
  categoriaPluggy: string
): string {
  const categoriaNormalizada =
    categoriaPluggy.toUpperCase();

  for (
    const [chave, categoria] of Object.entries(
      MAPA_CATEGORIAS
    )
  ) {
    if (
      categoriaNormalizada.includes(
        chave.toUpperCase()
      )
    ) {
      return categoria;
    }
  }

  return "Outros";
}


async function buscarCategoriaIdPorNome(
  nomeCategoria: string
): Promise<number | null> {
  const categoria =
    await db.query.categorias.findFirst({
      where: (categoria, { eq }) =>
        eq(
          categoria.nome,
          nomeCategoria
        ),
    });

  return categoria?.id ?? null;
}


// ======================================================
// FUZZY MATCH
// ======================================================

function similaridadeTokens(
  a: string,
  b: string
): number {
  const tokensA = new Set(
    a.split(" ").filter(Boolean)
  );

  const tokensB = new Set(
    b.split(" ").filter(Boolean)
  );

  if (
    tokensA.size === 0 ||
    tokensB.size === 0
  ) {
    return 0;
  }

  const intersecao = [
    ...tokensA,
  ].filter((token) =>
    tokensB.has(token)
  ).length;

  const uniao = new Set([
    ...tokensA,
    ...tokensB,
  ]).size;

  return intersecao / uniao;
}


function melhorMatchFuzzy(
  nome: string,
  dicionario: Record<string, number>,
  limiar = 0.6
): string | null {
  let melhorChave: string | null = null;
  let melhorScore = 0;

  for (const chave in dicionario) {
    const score =
      similaridadeTokens(
        nome,
        chave
      );

    if (score > melhorScore) {
      melhorScore = score;
      melhorChave = chave;
    }
  }

  return melhorScore >= limiar
    ? melhorChave
    : null;
}


// ======================================================
// DICIONÁRIO DO USUÁRIO
// ======================================================

export async function carregarDicionarioEstabelecimentos(
  usuarioId: string
): Promise<Record<string, number>> {
  const regras =
    await db.query.regrasCategorizacao.findMany({
      where: (regra, { eq }) =>
        eq(
          regra.usuarioId,
          usuarioId
        ),
    });

  const dicionario: Record<string, number> = {};

  for (const regra of regras) {
    dicionario[
      regra.estabelecimentoNormalizado
    ] = regra.categoriaId;
  }

  return dicionario;
}


// ======================================================
// CATEGORIZAÇÃO
// ======================================================

export async function categorizarTransacao(
  tx: TransacaoParaCategorizar,
  dicionario: Record<string, number>
): Promise<number | null> {
  const nomeNormalizado =
    normalizarParaBusca(
      tx.description ?? ""
    );

  // 1. Regra pessoal exata
  const categoriaExata =
    dicionario[nomeNormalizado];

  if (categoriaExata) {
    return categoriaExata;
  }

  // 2. Fuzzy
  const match =
    melhorMatchFuzzy(
      nomeNormalizado,
      dicionario
    );

  if (match) {
    return dicionario[match] ?? null;
  }

  // 3. Pluggy
  const categoriaGenerica =
    mapearCategoriaGenerica(
      tx.category ?? ""
    );

  return buscarCategoriaIdPorNome(
    categoriaGenerica
  );
}

// ======================================================
// APRENDIZADO MANUAL
// ======================================================

export async function salvarNoDicionario(
  usuarioId: string,
  estabelecimentoNormalizado: string,
  categoriaId: number
) {
  const existente =
    await db.query.regrasCategorizacao.findFirst({
      where: (regra, { and, eq }) =>
        and(
          eq(
            regra.usuarioId,
            usuarioId
          ),
          eq(
            regra.estabelecimentoNormalizado,
            estabelecimentoNormalizado
          )
        ),
    });

  if (existente) {
    await db
      .update(regrasCategorizacao)
      .set({
        categoriaId,
        origem: "manual",
        atualizadoEm: new Date(),
      })
      .where(
        eq(
          regrasCategorizacao.id,
          existente.id
        )
      );

    return;
  }

  await db
    .insert(regrasCategorizacao)
    .values({
      usuarioId,
      estabelecimentoNormalizado,
      categoriaId,
      origem: "manual",
    });
}

// ======================================================
// CATEGORIZAÇÃO DE TRANSAÇÕES PENDENTES
// ======================================================

export async function categorizarTransacoesPendentes(
  usuarioId: string
) {
  const pendentes = await db
    .select({
      transacaoId: transacoes.id,
      estabelecimentoBruto:
        transacoes.estabelecimentoBruto,
      categoriaPluggy:
        transacoes.categoriaPluggy,
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
    .where(
      and(
        eq(
          conexoesBancarias.usuarioId,
          usuarioId
        ),
        isNull(
          transacoes.categoriaId
        )
      )
    );

  let categorizadas = 0;
  let semCategoria = 0;
const dicionario =
  await carregarDicionarioEstabelecimentos(
    usuarioId
  );

  for (const transacao of pendentes) {
    const categoriaId =
      await categorizarTransacao(
        {
          description:
            transacao.estabelecimentoBruto,

          category:
            transacao.categoriaPluggy,
        },
        dicionario
      );

    if (!categoriaId) {
      semCategoria++;
      continue;
    }

    await db
      .update(transacoes)
      .set({
        categoriaId,
      })
      .where(
        eq(
          transacoes.id,
          transacao.transacaoId
        )
      );

    categorizadas++;
  }

  return {
    totalPendentes: pendentes.length,
    categorizadas,
    semCategoria,
  };
}
export async function recategorizarEstabelecimento(
  usuarioId: string,
  estabelecimentoNormalizado: string,
  categoriaId: number
) {
  const transacoesUsuario = await db
    .select({
      id: transacoes.id,
      estabelecimentoBruto:
        transacoes.estabelecimentoBruto,
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
    .where(
      eq(
        conexoesBancarias.usuarioId,
        usuarioId
      )
    );

  let atualizadas = 0;

  for (const transacao of transacoesUsuario) {
    const normalizado =
      normalizarParaBusca(
        transacao.estabelecimentoBruto
      );

    if (
      normalizado !==
      estabelecimentoNormalizado
    ) {
      continue;
    }

    await db
      .update(transacoes)
      .set({
        categoriaId,
      })
      .where(
        eq(
          transacoes.id,
          transacao.id
        )
      );

    atualizadas++;
  }

  return atualizadas;
}

export async function corrigirCategoriaTransacao(
  usuarioId: string,
  transacaoId: string,
  novaCategoriaId: number
) {
  const resultado = await db
    .select({
      id: transacoes.id,
      estabelecimentoBruto:
        transacoes.estabelecimentoBruto,
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
    .where(
      and(
        eq(
          transacoes.id,
          transacaoId
        ),
        eq(
          conexoesBancarias.usuarioId,
          usuarioId
        )
      )
    )
    .limit(1);

  const transacao = resultado[0];

  if (!transacao) {
    throw new Error(
      "Transação não encontrada."
    );
  }

  const estabelecimentoNormalizado =
    normalizarParaBusca(
      transacao.estabelecimentoBruto
    );

  if (!estabelecimentoNormalizado) {
    throw new Error(
      "Não foi possível identificar o estabelecimento."
    );
  }

  // Ensina a preferência para aquele usuário
  await salvarNoDicionario(
    usuarioId,
    estabelecimentoNormalizado,
    novaCategoriaId
  );

  // Corrige todas as transações daquele
  // estabelecimento para aquele usuário
  const transacoesAtualizadas =
    await recategorizarEstabelecimento(
      usuarioId,
      estabelecimentoNormalizado,
      novaCategoriaId
    );

  return {
    transacaoId,
    estabelecimentoNormalizado,
    categoriaId: novaCategoriaId,
    transacoesAtualizadas,
  };
}

