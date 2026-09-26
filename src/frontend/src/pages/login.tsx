import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
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
      await login({
        email,
        senha,
      })

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
    <main className="min-h-screen bg-[#f7f7f0] lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#10231c] text-white lg:block">
        <div className="pointer-events-none absolute -bottom-[360px] -right-[180px] h-[760px] w-[760px] rounded-full border border-[#283d31]" />

        <div className="pointer-events-none absolute -bottom-[300px] -right-[120px] h-[610px] w-[610px] rounded-full border border-[#354a29]" />

        <div className="pointer-events-none absolute -bottom-[230px] -right-[60px] h-[470px] w-[470px] rounded-full border border-[#71852e]/60" />

        <div className="absolute left-10 top-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff3e] text-sm font-bold text-[#10231c]">
              F
            </div>

            <span className="text-[15px] font-semibold tracking-tight">
              FinlyApp
            </span>
          </div>
        </div>

        <div className="absolute left-10 right-10 top-[19%] max-w-[500px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b9c7bf]">
            Clareza para o seu dinheiro
          </p>

          <h1 className="mt-5 text-[64px] font-light leading-[0.96] tracking-[-0.055em] text-[#f5f7ef]">
            Gaste
            <br />
            melhor.
            <br />
            <span className="italic">Viva leve.</span>
          </h1>

          <p className="mt-7 max-w-[350px] text-[15px] leading-6 text-[#b8c8c0]">
            Um jeito mais humano de entender para onde o
            seu dinheiro está indo — sem planilhas e sem
            culpa.
          </p>
        </div>

        <div className="absolute bottom-10 left-10 right-10">
          <div className="h-px bg-white/10" />

          <div className="relative mt-7 w-[310px] overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-3">
            <div className="pointer-events-none absolute -bottom-[170px] -right-[90px] h-[300px] w-[300px] rounded-full border border-[#283d31]" />

            <div className="pointer-events-none absolute -bottom-[140px] -right-[65px] h-[250px] w-[250px] rounded-full border border-[#354a29]" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d8ff3e] text-[#10231c]">
                <Sparkles size={15} />
              </div>

              <div>
                <p className="text-xs font-semibold text-white">
                  Seu dinheiro, mais claro.
                </p>

                <p className="mt-0.5 text-[10px] text-[#9fb0a7]">
                  Uma visão simples para decisões melhores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f0] px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#d8ff3e]/10 blur-3xl" />

        <div className="relative w-full max-w-[390px]">
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#637069]">
              Bem-vindo de volta
            </p>

            <h2 className="mt-4 text-[32px] font-normal tracking-[-0.04em] text-[#10231c]">
              Que bom te ver.
            </h2>

            <p className="mt-3 max-w-[360px] text-[13px] leading-5 text-[#748078]">
              Acompanhe sua vida financeira com mais clareza e
              menos esforço.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-semibold text-[#34433b]"
              >
                E-mail
              </label>

              <div className="relative">
                <Mail
                  size={15}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98a39d]"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@email.com"
                  required
                  autoComplete="email"
                  className="h-[47px] w-full rounded-xl border border-[#d9ded7] bg-white/70 pl-11 pr-4 text-[13px] text-[#10231c] outline-none transition placeholder:text-[#a5aea8] focus:border-[#a8c72c] focus:bg-white focus:ring-2 focus:ring-[#d8ff3e]/20"
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="password"
                className="mb-2 block text-[11px] font-semibold text-[#34433b]"
              >
                Senha
              </label>

              <div className="relative">
                <LockKeyhole
                  size={15}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98a39d]"
                />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-[47px] w-full rounded-xl border border-[#d9ded7] bg-white/70 pl-11 pr-12 text-[13px] text-[#10231c] outline-none transition placeholder:text-[#a5aea8] focus:border-[#a8c72c] focus:bg-white focus:ring-2 focus:ring-[#d8ff3e]/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#89958e] transition hover:text-[#10231c]"
                  aria-label={
                    showPassword
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>



            {error && (
              <div className="mt-4 rounded-xl border border-[#e5c9c5] bg-[#fff4f2] px-4 py-3">
                <p className="text-xs font-medium text-[#9b4d43]">
                  Não foi possível entrar
                </p>

                <p className="mt-1 text-[11px] leading-4 text-[#a9675f]">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex h-[47px] w-full items-center justify-center gap-3 rounded-xl bg-[#d8ff3e] text-[12px] font-semibold text-[#10231c] shadow-[0_8px_24px_rgba(160,190,40,0.18)] transition hover:bg-[#cffa25] hover:shadow-[0_10px_28px_rgba(160,190,40,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar no Gasto Claro'}

              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#dfe3dc]" />

            <span className="text-[10px] text-[#a1aaa5]">
              Crie agora
            </span>

            <div className="h-px flex-1 bg-[#dfe3dc]" />
          </div>



          <p className="mt-7 text-center text-[11px] text-[#7d8983]">
            Ainda não tem uma conta?{' '}
            <Link
              to="/cadastro"
              className="font-semibold text-[#52741e] transition hover:text-[#10231c]"
            >
              Criar agora
            </Link>
          </p>

          <div className="mt-7 flex gap-3 rounded-2xl bg-[#eef1e8] px-4 py-3">
            <ShieldCheck
              size={15}
              className="mt-0.5 shrink-0 text-[#6c9825]"
            />

            <p className="text-[10px] leading-4 text-[#718078]">
              Seus dados estão seguros com a gente.
              Cuidamos das suas informações com segurança e privacidade.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login