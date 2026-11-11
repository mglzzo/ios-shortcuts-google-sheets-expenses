import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../services/auth.js'
import { LockKeyhole, ArrowRight, Check, Circle, GraduationCap, Target, LifeBuoy, CreditCard } from 'lucide-react'
import MainLayout from '../../components/layout/MainLayout'

const objetivos = [
  { id: 'aprender', titulo: 'Aprender a organizar', complemento: 'meu dinheiro', Icone: GraduationCap, cor: 'violet' },
  { id: 'metas', titulo: 'Criar minhas', complemento: 'primeiras metas', Icone: Target, cor: 'green' },
  { id: 'aperto', titulo: 'Sair do aperto', complemento: 'no fim do mês', Icone: LifeBuoy, cor: 'coral' },
  { id: 'cartao', titulo: 'Entender melhor', complemento: 'meu cartão', Icone: CreditCard, cor: 'purple' },
]

const CHAVE_CONFIGURACAO_PERFIL = 'finly_configuracao_perfil'
const API_URL =
  'https://ios-shortcuts-db-expenses.martinsmiguel90.workers.dev'

function obterToken(): string {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Usuário não autenticado.')
  return token
}

async function lerResposta(response: Response): Promise<Record<string, unknown>> {
  const texto = await response.text()
  if (!texto.trim()) return {}
  try {
    const resultado: unknown = JSON.parse(texto)
    return resultado && typeof resultado === 'object'
      ? (resultado as Record<string, unknown>)
      : {}
  } catch {
    return { mensagem: texto }
  }
}

function verificarResposta(
  response: Response,
  resultado: Record<string, unknown>,
): void {
  if (response.ok) return
  throw new Error(
    String(
      resultado.erro ||
        resultado.error ||
        resultado.mensagem ||
        resultado.message ||
        `Erro na API (HTTP ${response.status}).`,
    ),
  )
}

const avatares = [
  { id: 'roxo', nome: 'Porquinho', src: '/porquinho.png' },
  { id: 'bone', nome: 'Personagem de boné', src: '/avatar-bone.png' },
  { id: 'chapeu', nome: 'Personagem de chapéu', src: '/avatar-chapeu.png' },
  { id: 'notebook', nome: 'Personagem com notebook', src: '/avatar-notebook.png' },
  { id: 'caneca', nome: 'Personagem com caneca', src: '/avatar-caneca.png' },
  { id: 'capivara', nome: 'Capivara', src: '/avatar-capivara.png' },
]

function carregarPreferencias() {
  try {
    const salvo = localStorage.getItem(CHAVE_CONFIGURACAO_PERFIL)
    if (!salvo) return { objetivo: 'aprender', avatar: 'roxo' }

    const dados = JSON.parse(salvo) as { objetivo?: string; avatar?: string }
    const objetivoValido = objetivos.some((item) => item.id === dados.objetivo)
    const avatarValido = avatares.some((item) => item.id === dados.avatar)

    return {
      objetivo: objetivoValido ? dados.objetivo! : 'aprender',
      avatar: avatarValido ? dados.avatar! : 'roxo',
    }
  } catch {
    return { objetivo: 'aprender', avatar: 'roxo' }
  }
}

function formatarRenda(valor: string | number): string {
  const digitos = String(valor).replace(/\D/g, '')
  if (!digitos) return ''

  const centavos = Number(digitos) / 100
  return centavos.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function converterRendaParaNumero(valor: string): number {
  const normalizado = valor.replace(/\./g, '').replace(',', '.')
  return Number(normalizado)
}

function ConfiguracaoPerfil() {
  const navigate = useNavigate()
  const preferenciasIniciais = carregarPreferencias()

  const [renda, setRenda] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [objetivo, setObjetivo] = useState(preferenciasIniciais.objetivo)
  const [avatar, setAvatar] = useState(preferenciasIniciais.avatar)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    getMe().catch(() => undefined)

    async function carregarRenda() {
      try {
        const response = await fetch(`${API_URL}/income`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${obterToken()}`,
            Accept: 'application/json',
          },
        })
        const resultado = await lerResposta(response)
        verificarResposta(response, resultado)

        setRenda(
          resultado.valor === null || resultado.valor === undefined
            ? ''
            : Number(resultado.valor).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
        )
      } catch (erro) {
        setAviso(
          erro instanceof Error
            ? `Não foi possível carregar sua renda: ${erro.message}`
            : 'Não foi possível carregar sua renda.',
        )
      }
    }

    carregarRenda()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAviso('')

    const valorRenda = converterRendaParaNumero(renda)
    if (renda.trim() === '' || !Number.isFinite(valorRenda) || valorRenda < 0) {
      setAviso('Informe uma renda mensal válida.')
      return
    }

    try {
      setSalvando(true)

      const response = await fetch(`${API_URL}/income`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${obterToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ valor: valorRenda }),
      })

      const resultado = await lerResposta(response)
      verificarResposta(response, resultado)

      localStorage.setItem(
        CHAVE_CONFIGURACAO_PERFIL,
        JSON.stringify({ objetivo, avatar }),
      )

      window.dispatchEvent(new Event('finly-perfil-atualizado'))
      navigate('/dashboard')
    } catch (erro) {
      setAviso(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível salvar sua renda mensal.',
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <MainLayout>
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 pt-7 sm:px-6 lg:px-8 xl:px-10">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-[27px] font-extrabold leading-tight tracking-[-.7px] text-[#17213b] sm:text-[34px] lg:text-[38px]">
                Vamos deixar o Finly com a sua cara
              </h1>
              <p className="mt-2 text-sm text-[#7c89a4] sm:text-base">
                Personalize sua experiência financeira.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-3">
                <section className="min-w-0 rounded-[22px] border border-[#e9ebf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)] sm:p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-base font-bold text-[#101b3b]">
                      1
                    </span>
                    <h2 className="text-[15px] font-bold tracking-[-.3px] sm:text-base">
                      Quanto entra por mês?
                    </h2>
                  </div>

                  <p className="mb-5 text-xs leading-5 text-[#7c89a4] sm:text-[13px]">
                    Considere sua renda líquida, já com os descontos.
                  </p>

                  <div className="flex h-14 min-w-0 items-center rounded-[10px] border border-[#dce1eb] transition focus-within:border-[#8a73ff]">
                    <span className="shrink-0 border-r border-[#dce1eb] px-3 text-lg font-semibold text-[#8793ad]">
                      R$
                    </span>
                    <input
                      aria-label="Renda mensal líquida"
                      type="text"
                      inputMode="numeric"
                      value={renda}
                      onChange={(e) => setRenda(formatarRenda(e.target.value))}
                      placeholder="0,00"
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-base font-semibold text-[#263654] outline-none placeholder:text-[#9ba6bd] sm:text-lg"
                    />
                  </div>

                  <div className="mt-6 flex items-start gap-3 text-[11px] leading-4 text-[#8b97b0] sm:text-xs">
                    <LockKeyhole size={17} className="shrink-0 text-[#7c8ba9]" />
                    <span>Seus dados são pessoais e não serão compartilhados.</span>
                  </div>
                </section>

                <section className="min-w-0 rounded-[22px] border border-[#e9ebf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)] sm:p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-base font-bold text-[#101b3b]">
                      2
                    </span>
                    <h2 className="text-[15px] font-bold tracking-[-.3px] sm:text-base">
                      O que você quer conquistar?
                    </h2>
                  </div>

                  <p className="mb-4 text-xs leading-5 text-[#7c89a4] sm:text-[13px]">
                    Escolha o que mais faz sentido para você agora.
                  </p>

                  <div className="flex flex-col gap-2">
                    {objetivos.map(({ id, titulo, complemento, Icone, cor }) => {
                      const selecionado = objetivo === id

                      const cores: Record<string, string> = {
                        violet: 'bg-[#eee8ff] text-[#7654ed]',
                        green: 'bg-[#e4f7ef] text-[#21b783]',
                        coral: 'bg-[#fff0ed] text-[#ff786e]',
                        purple: 'bg-[#eeeaff] text-[#7654ed]',
                      }

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setObjetivo(id)}
                          aria-pressed={selecionado}
                          className={`flex min-h-[58px] w-full min-w-0 items-center gap-3 rounded-[10px] border px-3 py-2 text-left transition sm:min-h-[62px] ${selecionado
                              ? 'border-[#a18bff] bg-[#f8f6ff]'
                              : 'border-[#e6e9f0] bg-white hover:border-[#c9bfff]'
                            }`}
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cores[cor]}`}>
                            <Icone size={23} strokeWidth={2.5} />
                          </span>

                          <span className="min-w-0 flex-1 text-xs leading-4 text-[#172344] sm:text-[13px]">
                            {titulo}
                            <br />
                            {complemento}
                          </span>

                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selecionado
                              ? 'border-[#7654ed] bg-[#7654ed] text-white'
                              : 'border-[#d9deea] text-transparent'
                            }`}>
                            {selecionado ? <Check size={12} strokeWidth={3} /> : <Circle size={13} />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="min-w-0 rounded-[22px] border border-[#e9ebf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)] sm:col-span-2 sm:p-6 2xl:col-span-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-base font-bold text-[#101b3b]">
                      3
                    </span>
                    <h2 className="text-[15px] font-bold tracking-[-.3px] sm:text-base">
                      Escolha seu avatar
                    </h2>
                  </div>

                  <p className="mb-5 text-xs leading-5 text-[#7c89a4] sm:text-[13px]">
                    Você pode trocar depois.
                  </p>

                  <div className="mx-auto grid w-full max-w-[310px] grid-cols-3 justify-items-center gap-x-3 gap-y-4 sm:max-w-[390px] 2xl:max-w-[270px]">
                    {avatares.map((item) => {
                      const selecionado = avatar === item.id

                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-label={item.nome}
                          aria-pressed={selecionado}
                          onClick={() => setAvatar(item.id)}
                          className={`relative h-[76px] w-[76px] rounded-full p-[2px] transition sm:h-[84px] sm:w-[84px] ${selecionado
                              ? 'ring-2 ring-[#7452ff]'
                              : 'hover:ring-2 hover:ring-[#d9d0ff]'
                            }`}
                        >
                          <img
                            src={item.src}
                            alt={item.nome}
                            className="h-full w-full rounded-full object-cover"
                          />
                          {selecionado && (
                            <span className="absolute -bottom-[1px] -right-[1px] flex h-[23px] w-[23px] items-center justify-center rounded-full border-2 border-white bg-[#704df5] text-white">
                              <Check size={13} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <p className="mt-5 text-center text-[11px] text-[#8995ad]">
                    Escolha seu personagem
                  </p>
                </section>
              </div>

              {aviso && (
                <p role="alert" className="mt-4 text-right text-sm font-medium text-red-600">
                  {aviso}
                </p>
              )}

              <div className="mt-6 flex justify-center sm:justify-end">
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex h-12 w-full max-w-[320px] items-center justify-center gap-2 rounded-[11px] bg-[#6746ef] px-6 text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(103,70,239,.18)] transition hover:bg-[#5838db] sm:w-auto sm:min-w-[200px]"
                >
                  {salvando ? 'Salvando...' : 'Continuar'}
                  {!salvando && <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          </div>
    </MainLayout>
  )
}

export default ConfiguracaoPerfil
