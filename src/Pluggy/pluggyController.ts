import "dotenv/config";

import { db } from "../../db/client/Client.js";

import {
  contas,
} from "../../db/schema/schema.js";

// =============================================
// CONFIGURAÇÕES
// =============================================

const URL_PLUGGY = process.env.URL_PLUGGY;
const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID;
const PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET;



// =============================================
// TIPOS
// =============================================

interface PluggyAccount {
  id: string;
  type: string;
  subtype: string;
  name?: string;
}

interface PluggyAccountsResponse {
  results: PluggyAccount[];
}

interface ContaSistema {
  id: string;
  conexaoId: string;
  pluggyAccountId: string;
  nome: string | null;
  tipo: string | null;
}

// =============================================
// AUTENTICAÇÃO PLUGGY
// =============================================

async function authPluggy(): Promise<string> {
  const response = await fetch(`${URL_PLUGGY}/auth`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      clientId: PLUGGY_CLIENT_ID,
      clientSecret: PLUGGY_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao autenticar na Pluggy: ${response.status}`
    );
  }

  const data = (await response.json()) as {
    apiKey?: string;
  };

  if (!data.apiKey) {
    throw new Error(
      "Falha ao obter token de acesso da Pluggy"
    );
  }

  return data.apiKey;
}

// =============================================
// BUSCA CONEXÃO DO USUÁRIO
// =============================================

async function buscarConexaoUsuario(usuarioId: string) {
  const conexao =
    await db.query.conexoesBancarias.findFirst({
      where: (conexao, { eq }) =>
        eq(conexao.usuarioId, usuarioId),
    });

  if (!conexao) {
    throw new Error(
      "Conexão bancária não encontrada para o usuário"
    );
  }

  return conexao;
}

// =============================================
// BUSCAR CONTA JÁ SALVA NO NOSSO BANCO
// =============================================

async function buscarContaCorrenteSalva(
  conexaoId: string
): Promise<ContaSistema | undefined> {
  const conta = await db.query.contas.findFirst({
    where: (conta, { and, eq }) =>
      and(
        eq(conta.conexaoId, conexaoId),
        eq(conta.tipo, "CHECKING_ACCOUNT")
      ),
  });

  return conta;
}

// =============================================
// BUSCAR CONTA NA PLUGGY E SALVAR NO BANCO
// =============================================

async function sincronizarContaCorrente(
  usuarioId: string
): Promise<ContaSistema> {
  const conexao = await buscarConexaoUsuario(usuarioId);

  console.log(
    "Item UID encontrado:",
    conexao.pluggyItemId
  );

  const apiKey = await authPluggy();
  console.log("Token de acesso obtido:", apiKey);
  const url = new URL(
    `${URL_PLUGGY}/accounts`
  );
  console.log(
    "Consultando Pluggy para o itemId:",
    conexao.pluggyItemId
  );

  url.searchParams.set(
    "itemId",
    conexao.pluggyItemId
  );

  console.log(url.toString());

  const response = await fetch(url, {
    method: "GET",

    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar contas na Pluggy: ${response.status} - ${await response.text()}`
    );
  }

  const data =
    (await response.json()) as PluggyAccountsResponse;

  // Procuramos especificamente a conta corrente
  const contaCorrente = data.results.find(
    (account) =>
      account.type === "BANK" &&
      account.subtype === "CHECKING_ACCOUNT"
  );

  if (!contaCorrente) {
    throw new Error(
      "Conta BANK / CHECKING_ACCOUNT não encontrada na Pluggy"
    );
  }

  console.log(
    "Account ID encontrado:",
    contaCorrente.id
  );

  // Salva a conta no nosso banco.
  // Se ela já existir, atualiza os dados.
  const [contaSalva] = await db
    .insert(contas)
    .values({
      conexaoId: conexao.id,

      pluggyAccountId: contaCorrente.id,

      nome:
        contaCorrente.name ??
        "Conta Corrente",

      tipo: contaCorrente.subtype,
    })
    .onConflictDoUpdate({
      target: contas.pluggyAccountId,

      set: {
        nome:
          contaCorrente.name ??
          "Conta Corrente",

        tipo: contaCorrente.subtype,
      },
    })
    .returning();

  if (!contaSalva) {
    throw new Error(
      "Erro ao salvar conta no banco"
    );
  }

  console.log(
    "Conta salva no banco:",
    contaSalva
  );

  return contaSalva;
}

// =============================================
// OBTER CONTA CORRENTE
//
// Primeiro tenta nosso banco.
// Só consulta a Pluggy caso ainda não tenhamos
// salvo a conta.
// =============================================

export async function getAccount(
  usuarioId: string
): Promise<ContaSistema> {
  const conexao = await buscarConexaoUsuario(usuarioId);

  // 1 - procura no nosso banco
  const contaSalva =
    await buscarContaCorrenteSalva(
      conexao.id
    );

  if (contaSalva) {
    console.log(
      "Conta encontrada no banco:",
      contaSalva.pluggyAccountId
    );

    return contaSalva;
  }

  // 2 - se não existe, busca na Pluggy
  console.log(
    "Conta ainda não cadastrada. Consultando Pluggy..."
  );

  return sincronizarContaCorrente(usuarioId);
}

// =============================================
// BUSCAR TRANSAÇÕES
// =============================================

export async function getTransactions(
  usuarioId: string
) {
  // Aqui não precisamos mais receber accountID
  // nem accessToken manualmente.
  //
  // getAccount encontra tudo pra gente.
  const conta = await getAccount(usuarioId);

  const apiKey = await authPluggy();

  const url = new URL(
    `${URL_PLUGGY}/v2/transactions`
  );

  url.searchParams.set(
    "accountId",
    conta.pluggyAccountId
  );

  console.log(
    "Buscando transações da conta:",
    conta.pluggyAccountId
  );

  const response = await fetch(url, {
    method: "GET",

    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar transações: ${response.status}`
    );
  }

  const data = await response.json();

  console.log(
    "Transações obtidas com sucesso:",
    data
  );

  return data;
}