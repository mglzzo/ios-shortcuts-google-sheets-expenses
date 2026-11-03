import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
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
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      await register({ nome, email, senha })
      setSuccess(true)

      setTimeout(() => {
        navigate('/login')
      }, 1800)
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

      <section className="flex min-h-[calc(100vh-112px)] items-center justify-center px-5 py-8 sm:px-8 lg:min-h-screen lg:px-10">
        <div className="w-full max-w-[448px] rounded-xl border border-[#edf0f4] bg-white px-7 py-7 shadow-[0_8px_30px_rgba(20,35,60,0.06)] sm:px-9 sm:py-8">
          <header className="mb-5 text-center">
            <h1 className="text-[25px] font-bold leading-tight tracking-[-0.035em] text-[#172b4d] sm:text-[27px]">
              Crie sua conta
            </h1>
            <p className="mt-2 text-[14px] text-[#8792a3]">
              Comece a cuidar melhor do seu dinheiro.
            </p>
          </header>

          {success ? (
            <div className="rounded-xl border border-[#e4defb] bg-[#faf8ff] p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#7957e8] text-white">
                <CheckCircle2 size={23} />
              </div>
              <h2 className="mt-4 text-base font-semibold text-[#172b4d]">
                Conta criada com sucesso!
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#8792a3]">
                Você será redirecionada para a tela de login.
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="nome" className="mb-2 block text-[12px] font-semibold text-[#263750]">
                    Nome
                  </label>
                  <div className="relative">
                    <UserRound size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96a8]" />
                    <input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      placeholder="Seu nome"
                      required
                      autoComplete="name"
                      className="h-[43px] w-full rounded-lg border border-[#dce1e8] bg-white pl-11 pr-4 text-[13px] text-[#263750] outline-none transition placeholder:text-[#9aa4b3] focus:border-[#8061ed] focus:ring-2 focus:ring-[#8061ed]/10"
                    />
                  </div>
                </div>

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
                      autoComplete="new-password"
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

                <div>
                  <label htmlFor="confirmarSenha" className="mb-2 block text-[12px] font-semibold text-[#263750]">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96a8]" />
                    <input
                      id="confirmarSenha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={(event) => setConfirmarSenha(event.target.value)}
                      placeholder="Digite sua senha novamente"
                      required
                      autoComplete="new-password"
                      className="h-[43px] w-full rounded-lg border border-[#dce1e8] bg-white pl-11 pr-12 text-[13px] text-[#263750] outline-none transition placeholder:text-[#9aa4b3] focus:border-[#8061ed] focus:ring-2 focus:ring-[#8061ed]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8792a3] transition hover:text-[#172b4d]"
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-[#f1cece] bg-[#fff5f5] px-4 py-3">
                    <p className="text-xs font-medium text-[#a23f3f]">Não foi possível criar sua conta</p>
                    <p className="mt-1 text-[11px] leading-4 text-[#a85b5b]">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-[43px] w-full items-center justify-center rounded-lg bg-[#7957e8] text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#6947d8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Criando conta...' : 'Criar minha conta'}
                </button>
              </form>

              <p className="mt-5 text-center text-[12px] text-[#8792a3]">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-semibold text-[#7655df] transition hover:text-[#5e3bc9]">
                  Entrar agora
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default Cadastro
