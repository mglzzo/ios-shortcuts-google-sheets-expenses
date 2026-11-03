import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/auth'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, senha })
      navigate('/dashboard')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível entrar na sua conta.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] lg:grid lg:grid-cols-[18%_82%]">
      <aside className="relative min-h-[112px] overflow-hidden bg-[#172b4d] px-7 py-7 text-white lg:min-h-screen lg:px-8 lg:py-9">
        <div className="pointer-events-none absolute -bottom-36 -left-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full border border-white/10" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9274f5] text-lg font-bold text-[#172b4d]">
            F
          </div>
          <span className="text-[18px] font-semibold tracking-tight">FinlyApp</span>
        </div>

      </aside>

      <section className="flex min-h-[calc(100vh-112px)] items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:px-10">
        <div className="w-full max-w-[448px] rounded-xl border border-[#edf0f4] bg-white px-7 py-8 shadow-[0_8px_30px_rgba(20,35,60,0.06)] sm:px-9 sm:py-9">
          <header className="mb-6 text-center">
            <h1 className="text-[25px] font-bold leading-tight tracking-[-0.035em] text-[#172b4d] sm:text-[27px]">
              Que bom ter você de volta
            </h1>
            <p className="mt-2 text-[14px] text-[#8792a3]">
              Entre para continuar cuidando do seu dinheiro.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-[12px] font-semibold text-[#263750]">
                E-mail
              </label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96a8]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Digite seu e-mail"
                  required
                  autoComplete="email"
                  className="h-[43px] w-full rounded-lg border border-[#dce1e8] bg-white pl-11 pr-4 text-[13px] text-[#263750] outline-none transition placeholder:text-[#9aa4b3] focus:border-[#8061ed] focus:ring-2 focus:ring-[#8061ed]/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-[12px] font-semibold text-[#263750]">
                Senha
              </label>
              <div className="relative">
                <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96a8]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Digite sua senha"
                  required
                  autoComplete="current-password"
                  className="h-[43px] w-full rounded-lg border border-[#dce1e8] bg-white pl-11 pr-12 text-[13px] text-[#263750] outline-none transition placeholder:text-[#9aa4b3] focus:border-[#8061ed] focus:ring-2 focus:ring-[#8061ed]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8792a3] transition hover:text-[#172b4d]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-[#f1cece] bg-[#fff5f5] px-4 py-3">
                <p className="text-xs font-medium text-[#a23f3f]">Não foi possível entrar</p>
                <p className="mt-1 text-[11px] leading-4 text-[#a85b5b]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-[43px] w-full items-center justify-center rounded-lg bg-[#7957e8] text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#6947d8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-[#8792a3]">
            Ainda não tem uma conta?{' '}
            <Link to="/cadastro" className="font-semibold text-[#7655df] transition hover:text-[#5e3bc9]">
              Criar cadastro
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
