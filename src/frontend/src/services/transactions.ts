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
}

export interface TransactionsResponse {
  data: Transaction[]
  page: number
  limit: number
  hasMore: boolean
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

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result?.erro || 'Não foi possível carregar suas transações.',
    )
  }

  console.log('Resposta da API /transactions:', result)

  // Caso a API retorne { data: [...] }
  if (Array.isArray(result?.data)) {
    return {
      data: result.data,
      page: result.page ?? page,
      limit: result.limit ?? limit,
      hasMore: result.hasMore ?? false,
    }
  }

  // Caso a API retorne diretamente [...]
  if (Array.isArray(result)) {
    return {
      data: result,
      page,
      limit,
      hasMore: false,
    }
  }

  throw new Error(
    'A API retornou um formato de transações inesperado.',
  )
}