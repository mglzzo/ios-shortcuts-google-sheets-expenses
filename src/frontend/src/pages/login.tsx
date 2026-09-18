import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function Login() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-8 sm:px-6">
      <div className="w-full max-w-[430px]">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]">
            <span className="text-2xl font-bold text-[var(--color-surface-dark)]">
              G
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            gasto claro
          </h1>

          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Seu dinheiro, mais claro.
          </p>
        </div>

        <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Bem-vindo de volta
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Entre na sua conta para continuar.
            </p>
          </div>

          <form className="space-y-5">
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
                  placeholder="seu@email.com"
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
                  placeholder="Digite sua senha"
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

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-[var(--color-surface-dark)] text-sm font-semibold text-white transition hover:opacity-90"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Ainda não tem uma conta?{' '}
            <Link
              to="/cadastro"
              className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4 transition hover:opacity-70"
            >
              Criar conta
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-[var(--color-text-secondary)]">
          Controle suas finanças com clareza.
        </p>
      </div>
    </main>
  )
}

export default Login