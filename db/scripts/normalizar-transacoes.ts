// Uso (a partir da raiz do projeto, com DATABASE_URL no .env):
//
//   npm run db:normalizar-transacoes              -> só mostra o que falta (não altera nada)
//   npm run db:normalizar-transacoes -- --aplicar -> preenche estabelecimento_normalizado
//                                                    e lista as duplicidades existentes
//
// Este script NUNCA apaga registros. Ele só preenche a coluna e
// mostra os grupos duplicados para você decidir o que fazer antes
// de executar a migration 0005 (que cria o índice único).

import "dotenv/config";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "../client/Client.js";
import { transacoes } from "../schema/schema.js";
import { normalizarEstabelecimento } from "../../src/transactions/transaction-deduplication.service.js";

const aplicar = process.argv.includes("--aplicar");

interface GrupoDuplicado {
  conta_id: string;
  data: string;
  estabelecimento_normalizado: string;
  valor: string;
  qtd: number;
  ids: string[];
}

async function preencherNormalizados() {
  const pendentes = await db
    .selectDistinct({
      estabelecimentoBruto: transacoes.estabelecimentoBruto,
    })
    .from(transacoes)
    .where(isNull(transacoes.estabelecimentoNormalizado));

  const [contagem] = await db
    .select({
      total: sql<number>`count(*)::int`,
    })
    .from(transacoes)
    .where(isNull(transacoes.estabelecimentoNormalizado));

  console.log(
    `Transações sem estabelecimento normalizado: ${contagem?.total ?? 0} ` +
      `(${pendentes.length} nomes distintos)`
  );

  if (!aplicar) {
    console.log(
      "Modo consulta: nada foi alterado. Use --aplicar para preencher."
    );
    return;
  }

  for (const { estabelecimentoBruto } of pendentes) {
    await db
      .update(transacoes)
      .set({
        estabelecimentoNormalizado: normalizarEstabelecimento(
          estabelecimentoBruto
        ),
      })
      .where(
        and(
          eq(transacoes.estabelecimentoBruto, estabelecimentoBruto),
          isNull(transacoes.estabelecimentoNormalizado)
        )
      );
  }

  console.log("Coluna estabelecimento_normalizado preenchida.");
}

async function listarDuplicidades() {
  const resultado = await db.execute(sql`
    SELECT
      conta_id,
      data,
      estabelecimento_normalizado,
      valor,
      count(*)::int AS qtd,
      array_agg(id ORDER BY created_at) AS ids
    FROM transacoes
    WHERE estabelecimento_normalizado IS NOT NULL
    GROUP BY conta_id, data, estabelecimento_normalizado, valor
    HAVING count(*) > 1
    ORDER BY qtd DESC, data DESC
  `);

  const grupos = resultado.rows as unknown as GrupoDuplicado[];

  if (grupos.length === 0) {
    console.log(
      "Nenhuma duplicidade encontrada. A migration 0005 pode ser executada."
    );
    return;
  }

  const excedentes = grupos.reduce(
    (total, grupo) => total + grupo.qtd - 1,
    0
  );

  console.log(
    `\n${grupos.length} grupo(s) duplicado(s), ${excedentes} registro(s) excedente(s).`
  );
  console.log(
    "A migration 0005 vai FALHAR enquanto estes grupos existirem."
  );

  for (const grupo of grupos) {
    console.log(
      `\n- ${grupo.data} | ${grupo.estabelecimento_normalizado} | ${grupo.valor} | conta ${grupo.conta_id}`
    );
    console.log(`  ${grupo.qtd} registros: ${grupo.ids.join(", ")}`);
  }
}

async function main() {
  await preencherNormalizados();

  if (aplicar) {
    await listarDuplicidades();
  }
}

main().catch((erro) => {
  console.error("Erro:", erro);
  process.exit(1);
});
