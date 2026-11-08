import { eq, asc } from "drizzle-orm";
import { db } from "../../db/client/Client.js";
import {
  contas,
  conexoesBancarias,
} from "../../db/schema/schema.js";

export async function listarContas(usuarioId: string) {
  return await db
    .select({
      id: contas.id,
      nome: contas.nome,
      tipo: contas.tipo,
      pluggyAccountId: contas.pluggyAccountId,

      conexaoId: conexoesBancarias.id,
      instituicao: conexoesBancarias.instituicao,
    })
    .from(contas)
    .innerJoin(
      conexoesBancarias,
      eq(contas.conexaoId, conexoesBancarias.id)
    )
    .where(
      eq(conexoesBancarias.usuarioId, usuarioId)
    )
    .orderBy(asc(contas.nome));
}