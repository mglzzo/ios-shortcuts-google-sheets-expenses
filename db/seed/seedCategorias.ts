import "dotenv/config";

import { db } from "../client/Client.js";
import { categorias } from "../schema/schema.js";

const CATEGORIAS_BASE = [
  "Mercado",
  "Lazer",
  "Transporte",
  "Saúde",
  "Educação",
  "Vestuário",
  "Eletrônicos",
  "Contas/Utilidades",
  "Moradia",
  "Assinaturas",
  "Outros",
  "Transferências",
  "Empréstimos",
  "Investimentos",
];

async function seedCategorias() {
  console.log("Iniciando seed de categorias...");

  for (const nome of CATEGORIAS_BASE) {
    await db
      .insert(categorias)
      .values({ nome })
      .onConflictDoNothing();
  }

  console.log(
    `${CATEGORIAS_BASE.length} categorias verificadas/inseridas.`
  );
}

seedCategorias()
  .then(() => {
    console.log("Seed concluído.");
    process.exit(0);
  })
  .catch((erro) => {
    console.error("Erro ao executar seed:", erro);
    process.exit(1);
  });