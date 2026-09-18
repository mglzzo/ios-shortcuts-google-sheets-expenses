import { api } from './api'

interface RegisterData {
  nome: string
  email: string
  senha: string
}

interface AuthResponse {
  id: string
  nome: string
  email: string
  createdAt?: string
}

export function register(data: RegisterData) {
  return api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}