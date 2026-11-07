
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../services/auth.js'
import {
  Home,
  Receipt,
  Target,
  Calculator,
  BookOpen,
  LockKeyhole,
  GraduationCap,
  LifeBuoy,
  CreditCard,
  ArrowRight,
  Check,
  Circle,
  Menu,
  X,
  MoreHorizontal,
  UserRound,
  LogOut,
} from 'lucide-react'

const objetivos = [
  { id: 'aprender', titulo: 'Aprender a organizar', complemento: 'meu dinheiro', Icone: GraduationCap, cor: 'violet' },
  { id: 'metas', titulo: 'Criar minhas', complemento: 'primeiras metas', Icone: Target, cor: 'green' },
  { id: 'aperto', titulo: 'Sair do aperto', complemento: 'no fim do mês', Icone: LifeBuoy, cor: 'coral' },
  { id: 'cartao', titulo: 'Entender melhor', complemento: 'meu cartão', Icone: CreditCard, cor: 'purple' },
]

const CHAVE_CONFIGURACAO_PERFIL = 'finly_configuracao_perfil'

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

function ConfiguracaoPerfil() {
  const navigate = useNavigate()
  const preferenciasIniciais = carregarPreferencias()

  const [menuMobileAberto, setMenuMobileAberto] = useState(false)
  const [renda, setRenda] = useState('')
  const [objetivo, setObjetivo] = useState(preferenciasIniciais.objetivo)
  const [avatar, setAvatar] = useState(preferenciasIniciais.avatar)
  const [aviso, setAviso] = useState('')
  const [nomeUsuario, setNomeUsuario] = useState('Usuário')
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false)

  useEffect(() => {
    getMe()
      .then((usuario) => setNomeUsuario(usuario.nome || 'Usuário'))
      .catch(() => setNomeUsuario('Usuário'))
  }, [])


  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAviso('')

    try {
      localStorage.setItem(
        CHAVE_CONFIGURACAO_PERFIL,
        JSON.stringify({ objetivo, avatar }),
      )
      // Atualiza a Sidebar imediatamente, mesmo quando ela permanece montada
      // durante a navegação dentro do aplicativo.
      window.dispatchEvent(new Event('finly-perfil-atualizado'))

      navigate('/dashboard')
    } catch {
      setAviso('Não foi possível salvar as preferências neste navegador.')
    }
  }

  function sair() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const linksMenu = [
    { nome: 'Hoje', rota: '/dashboard', Icone: Home },
    { nome: 'Lançamentos', rota: '/lancamentos', Icone: Receipt },
    { nome: 'Metas', rota: '/metas', Icone: Target },
    { nome: 'Simulador', rota: '/simulador', Icone: Calculator },
    { nome: 'Aprender', rota: '/aprender', Icone: BookOpen },
  ]

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f6fb] text-[#17213b]">
      <div className="flex min-h-screen w-full">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[238px] flex-col bg-[#172b4d] text-white lg:flex">
          <div className="flex h-[92px] shrink-0 items-center justify-center gap-2 px-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#a58aff] text-[23px] font-extrabold text-[#172b4d]">
              F
            </div>
            <span className="text-[20px] font-bold tracking-tight">FinlyApp</span>
          </div>

          <nav className="mt-5 flex flex-col gap-3 px-4">
            {linksMenu.map(({ nome, rota, Icone }) => (
              <button
                key={rota}
                type="button"
                onClick={() => navigate(rota)}
                className={`flex items-center gap-3 rounded-xl px-4 py-4 text-left text-[16px] transition hover:bg-white/10 hover:text-white ${rota === '/dashboard'
                    ? 'text-[#b9c5dc]'
                    : 'text-[#b9c5dc]'
                  }`}
              >
                <Icone size={22} />
                {nome}
              </button>
            ))}
          </nav>

          {/* Perfil do usuário no rodapé da navegação */}
          <div className="relative mt-auto border-t border-white/10 p-5">
            {menuUsuarioAberto && (
              <div className="absolute bottom-[76px] left-5 z-50 w-[205px] rounded-xl border border-white/10 bg-[#20375d] p-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => setMenuUsuarioAberto(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] text-white hover:bg-white/10"
                >
                  <UserRound size={18} />
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={sair}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] text-white hover:bg-white/10"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            )}

            <div className="flex min-w-0 items-center gap-3">
              <img
                src={avatares.find((item) => item.id === avatar)?.src || '/porquinho.png'}
                alt="Avatar do perfil"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
                className="h-11 w-11 shrink-0 rounded-full bg-white object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-white">
                {nomeUsuario}
              </span>
              <button
                type="button"
                aria-label="Opções da conta"
                onClick={() => setMenuUsuarioAberto((aberto) => !aberto)}
                className="shrink-0 text-[#c4cee0] hover:text-white"
              >
                <MoreHorizontal size={22} />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-h-screen w-full min-w-0 bg-[#f5f6fb] lg:ml-[238px] lg:w-[calc(100%-238px)]">
          <header className="sticky top-0 z-40 flex h-[68px] w-full items-center border-b border-[#e8eaf0] bg-white px-5 sm:px-7 lg:hidden">
            <button
              type="button"
              aria-label={menuMobileAberto ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setMenuMobileAberto((v) => !v)}
              className="mr-5 flex h-10 w-8 items-center justify-center text-[#172b4d]"
            >
              {menuMobileAberto ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center">
              <span className="text-[17px] font-bold text-[#172b4d]">
                FinlyApp
              </span>
            </div>
          </header>

          {menuMobileAberto && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMenuMobileAberto(false)}
                className="absolute inset-0 bg-black/40"
              />

              <aside className="absolute inset-y-0 left-0 flex w-[270px] flex-col bg-[#172b4d] text-white shadow-xl">
                <div className="flex h-[68px] items-center justify-between border-b border-white/10 px-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a58aff] font-bold text-[#172b4d]">
                      F
                    </div>
                    <span className="font-bold">FinlyApp</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuMobileAberto(false)}
                    aria-label="Fechar menu"
                  >
                    <X size={22} />
                  </button>
                </div>

                <nav className="mt-5 flex flex-col gap-2 px-4">
                  {linksMenu.map(({ nome, rota, Icone }) => (
                    <button
                      key={rota}
                      type="button"
                      onClick={() => {
                        setMenuMobileAberto(false)
                        navigate(rota)
                      }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[#c4cee0] transition hover:bg-white/10 hover:text-white"
                    >
                      <Icone size={21} />
                      {nome}
                    </button>
                  ))}
                </nav>

                <div className="mt-auto border-t border-white/10 p-5">
                  <button
                    type="button"
                    onClick={sair}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-white hover:bg-white/10"
                  >
                    <LogOut size={19} />
                    Sair
                  </button>
                </div>
              </aside>
            </div>
          )}

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
                      type="number"
                      min="0"
                      step="0.01"
                      value={renda}
                      onChange={(e) => setRenda(e.target.value)}
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
                  className="flex h-12 w-full max-w-[320px] items-center justify-center gap-2 rounded-[11px] bg-[#6746ef] px-6 text-[13px] font-semibold text-white shadow-[0_5px_12px_rgba(103,70,239,.18)] transition hover:bg-[#5838db] sm:w-auto sm:min-w-[200px]"
                >
                  Continuar
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ConfiguracaoPerfil
