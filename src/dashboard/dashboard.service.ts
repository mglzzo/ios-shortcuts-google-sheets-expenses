import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../../db/client/Client.js";
import {
  contas,
  conexoesBancarias,
  transacoes,
} from "../../db/schema/schema.js";
import { obterRenda } from "../income/income.service.js";
import {
  listarMetas,
  type MetaFinanceira,
} from "../goals/goal.service.js";

export interface ResumoDashboard {
  mes: string;
  rendaMensal: number | null;
  despesasDoMes: number;
  disponivel: number | null;
  metas: MetaFinanceira[];
}

// Mês atual no formato YYYY-MM (usa UTC, o fuso do servidor)
export function mesAtual(): string {
  return new Date().toISOString().slice(0, 7);
}

export function mesValido(mes: unknown): mes is string {
  return (
    typeof mes === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(mes)
  );
}

function limitesDoMes(mes: string): {
  inicio: string;
  proximoMes: string;
} {
  const [ano, numeroMes] = mes.split("-").map(Number) as [
    number,
    number,
  ];

  const proximoAno = numeroMes === 12 ? ano + 1 : ano;
  const proximoNumero = numeroMes === 12 ? 1 : numeroMes + 1;

  return {
    inicio: `${mes}-01`,
    proximoMes: `${proximoAno}-${String(proximoNumero).padStart(2, "0")}-01`,
  };
}

// Despesas do mês = soma do valor absoluto das transações negativas
// do usuário no período (mesma regra de sinal que o dashboard já usa).
// Primeira fórmula do roadmap: disponível = renda mensal - despesas.
async function somarDespesasDoMes(
  usuarioId: string,
  mes: string
): Promise<number> {
  const { inicio, proximoMes } = limitesDoMes(mes);

  const [linha] = await db
    .select({
      total: sql<string>`coalesce(sum(abs(${transacoes.valor})), 0)`,
    })
    .from(transacoes)
    .innerJoin(contas, eq(transacoes.contaId, contas.id))
    .innerJoin(
      conexoesBancarias,
      eq(contas.conexaoId, conexoesBancarias.id)
    )
    .where(
      and(
        eq(conexoesBancarias.usuarioId, usuarioId),
        lt(transacoes.valor, "0"),
        gte(transacoes.data, inicio),
        lt(transacoes.data, proximoMes)
      )
    );

  return Number(linha?.total ?? 0);
}

export async function obterResumoDashboard(
  usuarioId: string,
  mes: string
): Promise<ResumoDashboard> {
  const [renda, despesasDoMes, metas] = await Promise.all([
    obterRenda(usuarioId),
    somarDespesasDoMes(usuarioId, mes),
    listarMetas(usuarioId),
  ]);

  const despesasArredondadas =
    Math.round(despesasDoMes * 100) / 100;

  return {
    mes,
    rendaMensal: renda.valor,
    despesasDoMes: despesasArredondadas,
    disponivel:
      renda.valor === null
        ? null
        : Math.round((renda.valor - despesasArredondadas) * 100) /
          100,
    metas,
  };
}
