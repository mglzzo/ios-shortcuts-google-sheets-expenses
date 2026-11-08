import { and, eq, like, sql } from "drizzle-orm";
import { db } from "../../db/client/Client.js";
import {
  contas,
  conexoesBancarias,
  transacoes,
} from "../../db/schema/schema.js";
import { normalizarEstabelecimento } from "../transactions/transaction-deduplication.service.js";

export interface EstabelecimentoListado {
  nome: string;
  nomeNormalizado: string;
}

// A conta precisa pertencer ao usuário autenticado
export async function contaPertenceAoUsuario(
  usuarioId: string,
  contaId: string
): Promise<boolean> {
  const [conta] = await db
    .select({ id: contas.id })
    .from(contas)
    .innerJoin(
      conexoesBancarias,
      eq(contas.conexaoId, conexoesBancarias.id)
    )
    .where(
      and(
        eq(contas.id, contaId),
        eq(conexoesBancarias.usuarioId, usuarioId)
      )
    )
    .limit(1);

  return Boolean(conta);
}

function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (caractere) => `\\${caractere}`);
}

function limparEspacos(texto: string): string {
  return texto.trim().replace(/\s+/g, " ");
}

// Retorna um item por nome normalizado. Quando existem variações
// do mesmo estabelecimento, o nome exibido é a variação mais
// frequente; em empate, a mais recente; em novo empate, a primeira
// em ordem alfabética.
export async function listarEstabelecimentos(
  usuarioId: string,
  filtros: { contaId?: string; search?: string } = {}
): Promise<EstabelecimentoListado[]> {
  const condicoes = [eq(conexoesBancarias.usuarioId, usuarioId)];

  if (filtros.contaId) {
    condicoes.push(eq(transacoes.contaId, filtros.contaId));
  }

  if (filtros.search) {
    const termo = normalizarEstabelecimento(filtros.search);

    if (termo) {
      condicoes.push(
        like(
          transacoes.estabelecimentoNormalizado,
          `%${escaparLike(termo)}%`
        )
      );
    }
  }

  const linhas = await db
    .select({
      nomeNormalizado: transacoes.estabelecimentoNormalizado,
      nomeBruto: transacoes.estabelecimentoBruto,
      quantidade: sql<number>`count(*)::int`,
      ultimaData: sql<string>`max(${transacoes.data})`,
    })
    .from(transacoes)
    .innerJoin(contas, eq(transacoes.contaId, contas.id))
    .innerJoin(
      conexoesBancarias,
      eq(contas.conexaoId, conexoesBancarias.id)
    )
    .where(and(...condicoes))
    .groupBy(
      transacoes.estabelecimentoNormalizado,
      transacoes.estabelecimentoBruto
    );

  const porNormalizado = new Map<
    string,
    Map<string, { quantidade: number; ultimaData: string }>
  >();

  for (const linha of linhas) {
    const nome = limparEspacos(linha.nomeBruto);

    const variacoes =
      porNormalizado.get(linha.nomeNormalizado) ??
      new Map<string, { quantidade: number; ultimaData: string }>();

    const atual = variacoes.get(nome);

    variacoes.set(nome, {
      quantidade: (atual?.quantidade ?? 0) + linha.quantidade,
      ultimaData:
        atual && atual.ultimaData > linha.ultimaData
          ? atual.ultimaData
          : linha.ultimaData,
    });

    porNormalizado.set(linha.nomeNormalizado, variacoes);
  }

  const resultado: EstabelecimentoListado[] = [];

  for (const [nomeNormalizado, variacoes] of porNormalizado) {
    const [melhor] = [...variacoes.entries()].sort(
      ([nomeA, a], [nomeB, b]) =>
        b.quantidade - a.quantidade ||
        (a.ultimaData < b.ultimaData
          ? 1
          : a.ultimaData > b.ultimaData
            ? -1
            : 0) ||
        nomeA.localeCompare(nomeB)
    );

    if (melhor) {
      resultado.push({ nome: melhor[0], nomeNormalizado });
    }
  }

  return resultado.sort((a, b) =>
    a.nomeNormalizado.localeCompare(b.nomeNormalizado)
  );
}
