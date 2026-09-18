import { Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/auth'

function Cadastro() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      await register({
        nome,
        email,
        senha,
      })

      navigate('/login')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível criar sua conta.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-8 sm:px-6">
      <div className="w-full max-w-[430px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]">
            <span className="text-2xl font-bold text-[var(--color-surface-dark)]">
              G
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            gasto claro
          </h1>

          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Comece a cuidar melhor do seu dinheiro.
          </p>
        </div>

        <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Criar sua conta
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Preencha seus dados para começar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Nome
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                />

                <input
                  id="name"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Seu nome"
                  required
                  className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                E-mail
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Senha
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Crie uma senha"
                  required
                  className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] pl-11 pr-12 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] transition hover:text-[var(--color-text)]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Confirmar senha
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                />

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  placeholder="Repita sua senha"
                  required
                  className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] pl-11 pr-12 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] transition hover:text-[var(--color-text)]"
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmação de senha'
                      : 'Mostrar confirmação de senha'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-[var(--color-negative)]/10 px-4 py-3 text-sm text-[var(--color-negative)]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl bg-[var(--color-surface-dark)] text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Já possui uma conta?{' '}
            <Link
              to="/login"
              className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4 transition hover:opacity-70"
            >
              Entrar
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-[var(--color-text-secondary)]">
          Suas finanças, mais claras.
        </p>
      </div>
    </main>
  )
}

export default Cadastro