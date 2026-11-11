const API_URL =
  'https://ios-shortcuts-db-expenses.martinsmiguel90.workers.dev'

interface RegisterData {
  nome: string
  email: string
  senha: string
}

interface RegisterResponse {
  id: string
  nome: string
  email: string
  createdAt: string
}

interface LoginData {
  email: string
  senha: string
}

interface LoginResponse {
  token: string
  usuario: {
    id: string
    nome: string
    email: string
  }
}

export async function register(
  data: RegisterData,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result?.erro || 'Não foi possível criar sua conta.',
    )
  }

  return result
}

export async function login(
  data: LoginData,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identificador: data.email,
      senha: data.senha,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result?.erro || 'E-mail ou senha incorretos.',
    )
  }

  localStorage.setItem('token', result.token)

  return result
}

export interface Usuario {
  id: string
  nome: string
  email: string
}

export async function getMe(): Promise<Usuario> {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Usuário não autenticado.')
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const result = await response.json()

  if (!response.ok) {
    localStorage.removeItem('token')

    throw new Error(
      result?.erro || 'Sua sessão expirou.',
    )
  }
  return result
}