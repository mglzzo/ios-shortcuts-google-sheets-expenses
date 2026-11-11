
const API_URL =
  'https://ios-shortcuts-db-expenses.martinsmiguel90.workers.dev'

export interface Transaction {
  id: string
  data: string
  estabelecimento: string
  valor: string | number
  metodoPagamento: string
  categoriaId: number | null
  categoria: string | null
  categoriaPluggy: string | null
  observacao: string | null
  origem: string
  contaId: string | null
  conta: string | null
  parcelaAtual?: number | null
  parcelaTotal?: number | null
  subcategoria?: string | null
}

export interface TransactionsResponse {
  data: Transaction[]
  page: number
  limit: number
  hasMore: boolean
}

export interface TransacaoImportacao {
  data: string
  estabelecimento: string
  valor: number
  metodoPagamento: string
  categoria: string
  subcategoria?: string
  parcelaAtual?: number | null
  parcelaTotal?: number | null
  observacao: string
}

export interface ImportarTransacoesResponse {
  total: number
  inseridas: number
  ignoradas: number
  erros: Array<{
    linha: number
    erro: string
  }>
}

function primeiroValor<T>(...valores: unknown[]): T | undefined {
  return valores.find(
    (valor) => valor !== undefined && valor !== null && valor !== '',
  ) as T | undefined
}

function normalizarTransacao(
  item: Record<string, unknown>,
): Transaction {
  return {
    id: String(
      primeiroValor(item.id, item.transacaoId, item.transacao_id) ?? '',
    ),
    data: String(
      primeiroValor(item.data, item.date, item.data_transacao) ?? '',
    ),
    estabelecimento: String(
      primeiroValor(
        item.estabelecimento,
        item.estabelecimento_bruto,
        item.nomeEstabelecimento,
        item.nome_estabelecimento,
      ) ?? '',
    ),
    valor:
      primeiroValor<string | number>(
        item.valor,
        item.value,
        item.amount,
      ) ?? 0,
    metodoPagamento: String(
      primeiroValor(
        item.metodoPagamento,
        item.metodo_pagamento,
        item.formaPagamento,
        item.forma_pagamento,
      ) ?? '',
    ),
    categoriaId:
      primeiroValor<number | null>(
        item.categoriaId,
        item.categoria_id,
      ) ?? null,
    categoria:
      primeiroValor<string | null>(
        item.categoria,
        item.nomeCategoria,
        item.nome_categoria,
      ) ?? null,
    categoriaPluggy:
      primeiroValor<string | null>(
        item.categoriaPluggy,
        item.categoria_pluggy,
      ) ?? null,
    observacao:
      primeiroValor<string | null>(
        item.observacao,
        item.note,
        item.descricao,
      ) ?? null,
    origem: String(primeiroValor(item.origem, item.source) ?? ''),
    contaId:
      primeiroValor<string | null>(
        item.contaId,
        item.conta_id,
      ) ?? null,
    conta:
      primeiroValor<string | null>(
        item.conta,
        item.nomeConta,
        item.nome_conta,
      ) ?? null,
    parcelaAtual:
      primeiroValor<number | null>(
        item.parcelaAtual,
        item.parcela_atual,
      ) ?? null,
    parcelaTotal:
      primeiroValor<number | null>(
        item.parcelaTotal,
        item.parcela_total,
      ) ?? null,
    subcategoria:
      primeiroValor<string | null>(item.subcategoria) ?? null,
  }
}

function extrairResposta(
  result: unknown,
  pageFallback: number,
  limitFallback: number,
): TransactionsResponse {
  let atual: unknown = result

  for (let i = 0; i < 4; i += 1) {
    if (Array.isArray(atual)) {
      return {
        data: atual
          .filter(
            (item): item is Record<string, unknown> =>
              Boolean(item) && typeof item === 'object',
          )
          .map(normalizarTransacao),
        page: pageFallback,
        limit: limitFallback,
        hasMore: false,
      }
    }

    if (!atual || typeof atual !== 'object') {
      break
    }

    const objeto = atual as Record<string, unknown>

    const lista = [
      objeto.data,
      objeto.transacoes,
      objeto.transactions,
      objeto.items,
      objeto.results,
    ].find(Array.isArray)

    if (Array.isArray(lista)) {
      const data = lista
        .filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) && typeof item === 'object',
        )
        .map(normalizarTransacao)

      const page = Number(
        primeiroValor(objeto.page, objeto.pagina) ?? pageFallback,
      )

      const limit = Number(
        primeiroValor(
          objeto.limit,
          objeto.limite,
          objeto.pageSize,
        ) ?? limitFallback,
      )

      const hasMoreValue = primeiroValor<boolean>(
        objeto.hasMore,
        objeto.has_more,
        objeto.temMais,
      )

      return {
        data,
        page,
        limit,
        hasMore:
          hasMoreValue ?? (data.length === limit && limit > 0),
      }
    }

    atual =
      objeto.data ??
      objeto.resultado ??
      objeto.result ??
      objeto.payload
  }

  return {
    data: [],
    page: pageFallback,
    limit: limitFallback,
    hasMore: false,
  }
}

async function lerResposta(response: Response): Promise<unknown> {
  const texto = await response.text()

  if (!texto.trim()) {
    return {}
  }

  try {
    return JSON.parse(texto)
  } catch {
    return { mensagem: texto }
  }
}

export async function getTransactions(
  page = 1,
  limit = 50,
): Promise<TransactionsResponse> {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Usuário não autenticado.')
  }

  const response = await fetch(
    `${API_URL}/transactions?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )

  const result = await lerResposta(response)

  if (!response.ok) {
    const objeto = result as Record<string, unknown>

    throw new Error(
      String(
        objeto.erro ||
          objeto.error ||
          objeto.mensagem ||
          'Não foi possível carregar suas transações.',
      ),
    )
  }

  return extrairResposta(result, page, limit)
}

export async function getCategories(): Promise<string[]> {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Usuário não autenticado.')
  }

  const response = await fetch(`${API_URL}/categories`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const result = await lerResposta(response)

  if (!response.ok) {
    const objeto = result as Record<string, unknown>

    throw new Error(
      String(
        objeto.erro ||
          objeto.error ||
          objeto.mensagem ||
          'Não foi possível consultar as categorias.',
      ),
    )
  }

  const objeto = result as { data?: unknown }

  if (!Array.isArray(objeto.data)) {
    throw new Error('Resposta inválida ao consultar categorias.')
  }

  return objeto.data
    .map((categoria): string => {
      if (typeof categoria === 'string') {
        return categoria.trim().toLocaleUpperCase('pt-BR')
      }

      if (categoria && typeof categoria === 'object') {
        const item = categoria as Record<string, unknown>

        const nome = item.nome ?? item.name

        return typeof nome === 'string'
          ? nome.trim().toLocaleUpperCase('pt-BR')
          : ''
      }

      return ''
    })
    .filter(Boolean)
}

export async function importarTransacoes(
  transacoes: TransacaoImportacao[],
): Promise<ImportarTransacoesResponse> {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Usuário não autenticado.')
  }

  if (transacoes.length === 0) {
    throw new Error('Não existem transações para importar.')
  }

  const response = await fetch(
    `${API_URL}/transactions/import/confirm`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transacoes: transacoes.map((transacao) => ({
          ...transacao,
          categoria:
            typeof transacao.categoria === 'string'
              ? transacao.categoria.trim().toLocaleUpperCase('pt-BR')
              : transacao.categoria,
        })),
      }),
    },
  )

  const result = await lerResposta(response)

  console.log('Status da importação:', response.status)
  console.log('Resposta da importação:', result)

  if (!response.ok) {
    const objeto = result as Record<string, unknown>

    throw new Error(
      String(
        objeto.erro ||
          objeto.error ||
          objeto.mensagem ||
          'Não foi possível importar as transações.',
      ),
    )
  }

  const objeto = result as Record<string, unknown>

  if (
    objeto.inseridas === undefined ||
    objeto.total === undefined
  ) {
    throw new Error(
      `O servidor respondeu, mas não retornou os dados esperados. Resposta: ${JSON.stringify(result)}`,
    )
  }

  const erros = Array.isArray(objeto.erros)
    ? objeto.erros.map((item, index) => {
        const erro = item as Record<string, unknown>

        return {
          linha: Number(erro.linha ?? index + 1),
          erro: String(
            erro.erro ?? erro.mensagem ?? 'Erro não especificado.',
          ),
        }
      })
    : []

  return {
    total: Number(objeto.total),
    inseridas: Number(objeto.inseridas),
    ignoradas: Number(objeto.ignoradas ?? 0),
    erros,
  }
}
