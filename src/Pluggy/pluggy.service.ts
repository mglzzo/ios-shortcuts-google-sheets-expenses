import { db } from "../../db/client/Client.js";
import "dotenv/config";
import {
  contas,
} from "../../db/schema/schema.js";
import {
  inserirTransacoesSemDuplicidade,
  type NovaTransacao,
} from "../transactions/transaction-deduplication.service.js";
import {
  categorizarTransacoesPendentes,
} from "../../categorizar.js";

const URL_PLUGGY =
  process.env.URL_PLUGGY ??
  "https://api.pluggy.ai";
const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID;
const PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET;



interface PluggyAccount {
  id: string;
  type: string;
  subtype: string;
  name?: string;
}

interface PluggyAccountsResponse {
  results: PluggyAccount[];
}

interface PluggyTransaction {
  id: string;
  description: string;
  descriptionRaw: string | null;
  currencyCode: string;
  amount: number;
  amountInAccountCurrency: number | null;
  date: string;
  category: string | null;
  categoryId: string | null;
  balance: number | null;
  accountId: string;
  providerCode: string | null;
  status: string;
  type: string;
  operationType: string | null;
  operationTypeAdditionalInfo: string | null;
  merchant: unknown;
  providerId: string | null;
  order: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PluggyTransactionsResponse {
  results: PluggyTransaction[];
  next?: string | null;
}


// AUTENTICAÇÃO PLUGGY


export async function authPluggy(): Promise<string> {
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


// CONEXÃO BANCÁRIA DO USUÁRIO


async function buscarConexaoUsuario(
  usuarioId: string
) {
  const conexao =
    await db.query.conexoesBancarias.findFirst({
      where: (conexao, { eq }) =>
        eq(conexao.usuarioId, usuarioId),
    });

  if (!conexao) {
    throw new Error(
      "Conexão bancária não encontrada"
    );
  }

  return conexao;
}


// SINCRONIZAR CONTA


async function sincronizarContaCorrente(
  usuarioId: string
) {
  const conexao =
    await buscarConexaoUsuario(usuarioId);

  const apiKey = await authPluggy();

  const url = new URL(
    `${URL_PLUGGY}/accounts`
  );

  url.searchParams.set(
    "itemId",
    conexao.pluggyItemId
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
      `Erro ao buscar contas: ${response.status}`
    );
  }

  const data =
    (await response.json()) as PluggyAccountsResponse;

  const contaCorrente = data.results.find(
    (account) =>
      account.type === "BANK" &&
      account.subtype === "CHECKING_ACCOUNT"
  );

  if (!contaCorrente) {
    throw new Error(
      "Conta corrente não encontrada na Pluggy"
    );
  }

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
      "Erro ao salvar conta"
    );
  }

  return contaSalva;
}


// OBTER CONTA


export async function getAccount(
  usuarioId: string
) {
  const conexao =
    await buscarConexaoUsuario(usuarioId);

  const contaSalva =
    await db.query.contas.findFirst({
      where: (conta, { and, eq }) =>
        and(
          eq(conta.conexaoId, conexao.id),
          eq(conta.tipo, "CHECKING_ACCOUNT")
        ),
    });

  if (contaSalva) {
    return contaSalva;
  }

  return sincronizarContaCorrente(usuarioId);
}


// SALVAR TRANSAÇÕES


async function salvarTransacoes(
  contaId: string,
  transacoesPluggy: PluggyTransaction[]
): Promise<{ inseridas: number; ignoradas: number }> {
  const valores: NovaTransacao[] = transacoesPluggy.map(
    (transacao) => ({
      contaId,

      data: transacao.date.slice(0, 10),

      estabelecimentoBruto:
        transacao.descriptionRaw ??
        transacao.description ??
        "Sem descrição",

      metodoPagamento:
        transacao.operationType ??
        transacao.type,

      categoriaId: null,

      categoriaPluggy:
        transacao.category,

      categoriaPluggyId:
        transacao.categoryId,

      valor: transacao.amount.toFixed(2),

      estabelecimentoId: null,

      bancoCartaoId: null,

      origem: "pluggy",

      idPluggy: transacao.id,
    })
  );

  const resultado =
    await inserirTransacoesSemDuplicidade(valores);

  return {
    inseridas: resultado.inseridas,
    ignoradas: resultado.ignoradas,
  };
}


// BUSCAR + SALVAR TRANSAÇÕES


export async function getTransactions(
  usuarioId: string
) {
  const conta = await getAccount(usuarioId);
  const apiKey = await authPluggy();

    let urlAtual =
    `${URL_PLUGGY}/v2/transactions?accountId=${conta.pluggyAccountId}`;

  let totalRecebidas = 0;
  let totalInseridas = 0;
  let totalIgnoradas = 0;
  while (urlAtual) {
    const response = await fetch(urlAtual, {
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

    const data =
      (await response.json()) as PluggyTransactionsResponse;

    totalRecebidas += data.results.length;

    const resultado = await salvarTransacoes(
      conta.id,
      data.results
    );

    totalInseridas += resultado.inseridas;
    totalIgnoradas += resultado.ignoradas;
if (data.next) {
      urlAtual =
        `${URL_PLUGGY}/v2/transactions${data.next}`;
    } else {
      urlAtual = "";
    }
  
  }

  console.log(
    `${totalRecebidas} recebidas / ${totalInseridas} novas inseridas / ${totalIgnoradas} ignoradas`
  );

  return {
    totalRecebidas,
    totalInseridas,
    totalIgnoradas,
  };
}

export async function sincronizarPluggy(
  usuarioId: string
) {
  //Busca e salva as transações da Pluggy
  const resultado = await getTransactions(usuarioId);

  //Categoriza as transações que ficaram pendentes
  await categorizarTransacoesPendentes(usuarioId);

  return {
    sucesso: true,
    ...resultado,
  };
}