import {
  APELIDOS_ESTABELECIMENTO,
  MAPA_CATEGORIAS,PESSOAS_CONHECIDAS
} from "./config/Config.js";
import { db } from "./db/client/Client.js";
import { regrasCategorizacao } from "./db/schema/schema.js";
import { eq } from "drizzle-orm";

export function limparEstabelecimento(descricao: string): string {
  if (!descricao) return "";
  let nome = descricao.includes("|") ? descricao.split("|").pop()! : descricao;

  nome = nome
    .replace(/^IFD\*/i, "IFD ")
    .replace(/^MP \*/i, "")
    .replace(/^CRD\*\d+\s*/i, "")
    .replace(/^Uber UBER \*/i, "Uber ")
    .trim();

  const nomeUpper = nome.toUpperCase();
  for (const [chave, apelido] of Object.entries(APELIDOS_ESTABELECIMENTO)) {
    if (nomeUpper.includes(chave)) return apelido;
  }

  return nome
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function normalizarParaBusca(descricao: string): string {
  if (!descricao) return "";
  const nome = descricao.includes("|") ? descricao.split("|").pop()! : descricao;
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\bLTDA\b|\bME\b|\bEIRELI\b|\bS\.?A\.?\b|\bCIA\b|\b\d{4,}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function inferirMetodo(descricao: string): string | null {
  if (!descricao) return null;
  const upper = descricao.toUpperCase();
  if (upper.includes("TRANSFERÊNCIA ENVIADA") || upper.includes("TRANSFERENCIA ENVIADA")) return "PIX";
  if (upper.includes("COMPRA NO DÉBITO") || upper.includes("COMPRA NO DEBITO")) return "Débito";
  if (upper.includes("COMPRA NO CRÉDITO") || upper.includes("COMPRA NO CREDITO")) return "Crédito";
  return null;
}

function mapearCategoriaGenerica(categoriaPluggy: string): string {
  for (const chave of Object.keys(MAPA_CATEGORIAS)) {
    if (categoriaPluggy.includes(chave)) {
      return MAPA_CATEGORIAS[chave] ?? "Outros";
    }
  }
  return "Outros";
}

function similaridadeTokens(a: string, b: string): number {
  const tokensA = new Set(a.split(" ").filter(Boolean));
  const tokensB = new Set(b.split(" ").filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  const intersecao = [...tokensA].filter((t) => tokensB.has(t)).length;
  const uniao = new Set([...tokensA, ...tokensB]).size;
  return intersecao / uniao;
}

function melhorMatchFuzzy(
  nome: string,
  dicionario: Record<string, string>,
  limiar = 0.6
): string | null {
  let melhorChave: string | null = null;
  let melhorScore = 0;
  for (const chave in dicionario) {
    const score = similaridadeTokens(nome, chave);
    if (score > melhorScore) {
      melhorScore = score;
      melhorChave = chave;
    }
  }
  return melhorScore >= limiar ? melhorChave : null;
}

// Carrega o dicionário aprendido (equivalente à aba _Dicionario) direto do banco
export async function carregarDicionarioEstabelecimentos(): Promise<Record<string, string>> {
  const regras = await db.query.regrasCategorizacao.findMany();
  const dicionario: Record<string, string> = {};
  for (const r of regras) {
    if (r.estabelecimentoNormalizado && r.categoriaId) {
      dicionario[r.estabelecimentoNormalizado] = String(r.categoriaId);
    }
  }
  return dicionario;
}

interface TransacaoPluggy {
  description?: string;
  category?: string;
  paymentData?: { paymentMethod?: string };
}

export async function categorizarTransacao(
  tx: TransacaoPluggy,
  dicionarioEstabelecimentos: Record<string, string>
): Promise<string> {
  const isPix = tx.paymentData?.paymentMethod === "PIX";
  const nomeNormalizado = normalizarParaBusca(tx.description || "");

  if (isPix && PESSOAS_CONHECIDAS[nomeNormalizado]) {
    return PESSOAS_CONHECIDAS[nomeNormalizado].categoria;
  }

  if (dicionarioEstabelecimentos[nomeNormalizado]) {
    return dicionarioEstabelecimentos[nomeNormalizado];
  }

const match = melhorMatchFuzzy(
  nomeNormalizado,
  dicionarioEstabelecimentos
);
if (match) {
  return dicionarioEstabelecimentos[match] ?? nomeNormalizado;
}

  const nomeUpper = nomeNormalizado.toUpperCase();
  for (const [chave] of Object.entries(APELIDOS_ESTABELECIMENTO)) {
    if (nomeUpper.includes(chave)) return mapearCategoriaGenerica(chave);
  }

  return mapearCategoriaGenerica(tx.category || "");
}

// Salva/atualiza uma regra aprendida — equivalente ao salvarNoDicionario do Apps Script
export async function salvarNoDicionario(
  usuarioId: string,
  estabelecimentoNormalizado: string,
  categoriaId: number
) {
  const existente = await db.query.regrasCategorizacao.findFirst({
    where: (regra, { and, eq }) =>
      and(
        eq(regra.usuarioId, usuarioId),
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
      .where(eq(regrasCategorizacao.id, existente.id));
  } else {
    await db.insert(regrasCategorizacao).values({
      usuarioId,
      estabelecimentoNormalizado,
      categoriaId,
      origem: "manual",
    });
  }
}