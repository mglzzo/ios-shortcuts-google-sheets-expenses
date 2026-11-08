import { asc } from "drizzle-orm";
import { db } from "../../db/client/Client.js";
import { categorias } from "../../db/schema/schema.js";

export async function listarCategorias() {
  return await db
    .select({
      id: categorias.id,
      nome: categorias.nome,
    })
    .from(categorias)
    .orderBy(asc(categorias.nome));
}