const API_URL =
  'https://ios-shortcuts-db-expenses.martinsmiguel90.workers.dev'

export interface MetaAPI {
  id: string
  nome: string
  valorDesejado: number
  valorAcumulado: number
  dataAlvo: string | null
  percentualConcluido: number
  createdAt: string
  atualizadoEm: string
}

export interface CriarMetaAPI {
  nome: string
  valorDesejado: number
  valorAcumulado: number
  dataAlvo: string | null
}

async function lerResposta(response: Response): Promise<unknown> {
  const texto = await response.text()

  if (!texto.trim()) return {}

  try {
    return JSON.parse(texto)
  } catch {
    return { mensagem: texto }
  }
}

function obterToken(): string {
  const token = localStorage.getItem('token')

  if (!token) throw new Error('Usuário não autenticado.')

  return token
}

function verificarErro(response: Response, result: unknown): void {
  if (response.ok) return

  const objeto =
    result && typeof result === 'object'
      ? (result as Record<string, unknown>)
      : {}

  throw new Error(
    String(
      objeto.erro ||
        objeto.error ||
        objeto.mensagem ||
        objeto.message ||
        `Erro na API (HTTP ${response.status}).`,
    ),
  )
}

export async function getGoals(): Promise<MetaAPI[]> {
  const response = await fetch(`${API_URL}/goals`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${obterToken()}`,
      Accept: 'application/json',
    },
  })

  const result = await lerResposta(response)
  verificarErro(response, result)

  if (!Array.isArray(result)) {
    throw new Error('A API não retornou uma lista de metas.')
  }

  return result as MetaAPI[]
}

export async function createGoal(dados: CriarMetaAPI): Promise<MetaAPI> {
  const response = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${obterToken()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(dados),
  })

  const result = await lerResposta(response)
  verificarErro(response, result)

  if (!result || typeof result !== 'object') {
    throw new Error('A API não retornou a meta criada.')
  }

  const meta = result as MetaAPI

  if (!meta.id) {
    throw new Error('A API criou a meta, mas não retornou o ID.')
  }

  return meta
}

export async function updateGoal(
  id: string,
  dados: CriarMetaAPI,
): Promise<MetaAPI> {
  const response = await fetch(`${API_URL}/goals/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${obterToken()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(dados),
  })

  const result = await lerResposta(response)
  verificarErro(response, result)

  if (!result || typeof result !== 'object') {
    throw new Error('A API não retornou a meta atualizada.')
  }

  return result as MetaAPI
}

export async function deleteGoal(id: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/goals/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${obterToken()}`,
        Accept: 'application/json',
      },
    },
  )

  const result = await lerResposta(response)
  verificarErro(response, result)
}
