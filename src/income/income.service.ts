import { eq } from "drizzle-orm";
import { db } from "../../db/client/Client.js";
import { rendasMensais } from "../../db/schema/schema.js";

export interface RendaMensal {
  valor: number | null;
  atualizadoEm: Date | null;
}

export async function obterRenda(
  usuarioId: string
): Promise<RendaMensal> {
  const [renda] = await db
    .select({
      valor: rendasMensais.valor,
      atualizadoEm: rendasMensais.atualizadoEm,
    })
    .from(rendasMensais)
    .where(eq(rendasMensais.usuarioId, usuarioId))
    .limit(1);

  if (!renda) {
    return { valor: null, atualizadoEm: null };
  }

  return {
    valor: Number(renda.valor),
    atualizadoEm: renda.atualizadoEm,
  };
}

// Cria ou atualiza: a coluna usuario_id é única, então nunca
// existe mais de um registro por usuário.
export async function salvarRenda(
  usuarioId: string,
  valor: number
): Promise<RendaMensal> {
  const valorTexto = valor.toFixed(2);

  const [renda] = await db
    .insert(rendasMensais)
    .values({
      usuarioId,
      valor: valorTexto,
    })
    .onConflictDoUpdate({
      target: rendasMensais.usuarioId,
      set: {
        valor: valorTexto,
        atualizadoEm: new Date(),
      },
    })
    .returning({
      valor: rendasMensais.valor,
      atualizadoEm: rendasMensais.atualizadoEm,
    });

  if (!renda) {
    throw new Error("Erro ao salvar renda mensal.");
  }

  return {
    valor: Number(renda.valor),
    atualizadoEm: renda.atualizadoEm,
  };
}
