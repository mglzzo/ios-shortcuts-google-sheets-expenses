import {
  ChevronRight,
  FileSpreadsheet,
  Grid2X2,
  Link2,
  LogOut,
  Menu,
  MoreHorizontal,

  PlugZap,
  LockKeyhole,
  X,
  Construction,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../services/auth'

interface Usuario {
  id: string
  nome: string
  email: string
}

function Conexoes() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [pluggyModalOpen, setPluggyModalOpen] = useState(false)

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const dadosUsuario = await getMe()
        setUsuario(dadosUsuario)
      } catch {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }

    carregarUsuario()
  }, [])

  useEffect(() => {
    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPluggyModalOpen(false)
        setMobileSidebarOpen(false)
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', fecharComEscape)
    return () => window.removeEventListener('keydown', fecharComEscape)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileSidebarOpen])

  const nome = usuario?.nome?.split(' ')[0] || 'usuário'

  function irPara(caminho: string) {
    setMobileSidebarOpen(false)
    navigate(caminho)
  }

  function sair() {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#f7f7f0] text-[#10231c]">
      {/* Menu lateral fixo no desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col bg-[#10231c] text-white lg:flex">
        <div className="flex h-24 items-center px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff3e] text-[15px] font-semibold tracking-[-0.04em] text-[#10231c]">F</div>
            <span className="text-[15px] font-semibold">FinlyApp</span>
          </div>
        </div>

        <div className="px-5 pt-10">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94a69d]">Seu espaço</p>
          <nav className="space-y-2">
            <button type="button" onClick={() => irPara('/dashboard')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#d5ddd8] transition hover:bg-white/5">
              <Grid2X2 size={17} /> Visão geral
            </button>
            <button type="button" onClick={() => irPara('/conexoes')} className="flex w-full items-center gap-3 rounded-xl bg-[#d8ff3e] px-3 py-3 text-left text-sm font-semibold text-[#10231c]">
              <Link2 size={17} /> Conexões
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="relative">
            {menuOpen && (
              <div className="absolute bottom-[58px] -left-[8px] right-0 z-50 rounded-xl border border-white/10 bg-[#182c24] p-2 shadow-xl">
                <button type="button" onClick={sair} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#d5ddd8] transition hover:bg-white/5 hover:text-white">
                  <LogOut size={15} /> Sair
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0bd62] text-xs font-semibold text-[#10231c]">{nome.slice(0, 2).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{usuario?.nome}</p>
                <p className="mt-0.5 text-[10px] text-[#8fa098]">Plano essencial</p>
              </div>
              <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#8fa098] transition hover:bg-white/5 hover:text-white" aria-label="Abrir menu do usuário" aria-expanded={menuOpen}>
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Fundo e menu deslizante para celular e tablet */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/45 lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMobileSidebarOpen(false)
          }}
          aria-hidden="true"
        />
      )}

      <aside
        id="mobile-navigation"
        aria-label="Menu principal"
        className={`fixed inset-y-0 left-0 z-[70] flex w-[min(82vw,300px)] flex-col bg-[#10231c] text-white shadow-2xl transition-transform duration-200 ease-out lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!mobileSidebarOpen}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff3e] text-[15px] font-semibold text-[#10231c]">F</div>
            <span className="text-[15px] font-semibold">FinlyApp</span>
          </div>
          <button type="button" onClick={() => setMobileSidebarOpen(false)} aria-label="Fechar menu lateral" className="flex h-10 w-10 items-center justify-center rounded-xl text-[#cbd6cf] transition hover:bg-white/10 hover:text-white">
            <X size={21} />
          </button>
        </div>

        <div className="px-5 pt-7">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94a69d]">Seu espaço</p>
          <nav className="space-y-2">
            <button type="button" onClick={() => irPara('/dashboard')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#d5ddd8] transition hover:bg-white/5">
              <Grid2X2 size={17} /> Visão geral
            </button>
            <button type="button" onClick={() => irPara('/conexoes')} className="flex w-full items-center gap-3 rounded-xl bg-[#d8ff3e] px-3 py-3 text-left text-sm font-semibold text-[#10231c]">
              <Link2 size={17} /> Conexões
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="relative">
            {menuOpen && (
              <div className="absolute bottom-[58px] left-0 right-0 z-50 rounded-xl border border-white/10 bg-[#182c24] p-2 shadow-xl">
                <button type="button" onClick={sair} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#d5ddd8] transition hover:bg-white/5 hover:text-white">
                  <LogOut size={15} /> Sair
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0bd62] text-xs font-semibold text-[#10231c]">{nome.slice(0, 2).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{usuario?.nome}</p>
                <p className="mt-0.5 text-[10px] text-[#8fa098]">Plano essencial</p>
              </div>
              <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#8fa098] transition hover:bg-white/5 hover:text-white" aria-label="Abrir menu do usuário" aria-expanded={menuOpen}>
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[232px]">
        <header className="flex items-center gap-3 px-5 py-5 sm:px-8 lg:px-11 lg:py-8">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Abrir menu lateral"
            aria-controls="mobile-navigation"
            aria-expanded={mobileSidebarOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe3dc] bg-white text-[#10231c] shadow-sm transition hover:bg-[#f0f2eb] focus:outline-none focus:ring-4 focus:ring-[#10231c]/10 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff3e] text-[14px] font-semibold tracking-[-0.04em] text-[#10231c]">F</div>
            <span className="text-sm font-semibold">FinlyApp</span>
          </div>
        </header>

        <div className="mx-auto max-w-[1200px] px-5 pb-10 sm:px-8 lg:px-11">
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8983]">Integrações</p>
            <h1 className="mt-2 text-[34px] font-normal tracking-[-0.04em] text-[#10231c] sm:text-[42px]">Conexões</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#68736d]">Escolha como suas movimentações serão conectadas ao FinlyApp.</p>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <button type="button" onClick={() => setPluggyModalOpen(true)} className="relative rounded-[20px] border border-[#dfe3dc] bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#cbd1c9] hover:shadow-[0_16px_40px_rgba(16,35,28,0.06)] focus:outline-none focus:ring-4 focus:ring-[#10231c]/5">
              <div className="mb-7 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef0eb] text-[#68736d]"><PlugZap size={21} /></div>
                <span className="flex items-center gap-1.5 rounded-full bg-[#f1f2ee] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#7b857f]"><LockKeyhole size={11} /> Em desenvolvimento</span>
              </div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Pluggy</h2>
              <p className="mt-2 text-sm leading-6 text-[#68736d]">Conecte contas bancárias e cartões diretamente ao FinlyApp.</p>
              <div className="mt-6 flex items-center gap-1 text-xs font-medium text-[#526159]">Saiba mais <ChevronRight size={14} /></div>
            </button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('finly-tipo-importacao-planilha', 'saida')
                navigate('/conexoes/planilha')
              }}
              className="group rounded-[20px] border border-[#dfe3dc] bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#cbd1c9] hover:shadow-[0_16px_40px_rgba(16,35,28,0.06)]"
            >
              <div className="mb-7 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d8ff3e] text-[#10231c]"><FileSpreadsheet size={21} /></div>
                <ChevronRight size={19} className="text-[#8a958f] transition group-hover:translate-x-1 group-hover:text-[#10231c]" />
              </div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Planilha de saídas</h2>
              <p className="mt-2 text-sm leading-6 text-[#68736d]">Importe despesas e registre todos os valores como negativos.</p>
              <div className="mt-6 text-xs font-medium text-[#526159]">Configurar planilha de saídas</div>
            </button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('finly-tipo-importacao-planilha', 'entrada')
                navigate('/conexoes/planilha')
              }}
              className="group rounded-[20px] border border-[#dfe3dc] bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#cbd1c9] hover:shadow-[0_16px_40px_rgba(16,35,28,0.06)]"
            >
              <div className="mb-7 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef7d2] text-[#10231c]"><FileSpreadsheet size={21} /></div>
                <ChevronRight size={19} className="text-[#8a958f] transition group-hover:translate-x-1 group-hover:text-[#10231c]" />
              </div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Planilha de entradas</h2>
              <p className="mt-2 text-sm leading-6 text-[#68736d]">Importe recebimentos preservando o sinal original dos valores.</p>
              <div className="mt-6 text-xs font-medium text-[#526159]">Configurar planilha de entradas</div>
            </button>
          </section>
        </div>
      </main>

      {pluggyModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#10231c]/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setPluggyModalOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="pluggy-modal-title" className="w-full max-w-md rounded-[24px] border border-[#dfe3dc] bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef7d2] text-[#10231c]"><Construction size={22} /></div>
              <button type="button" onClick={() => setPluggyModalOpen(false)} aria-label="Fechar aviso" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f4ef] text-[#68736d] transition hover:bg-[#e8ebe4] hover:text-[#10231c]"><X size={17} /></button>
            </div>
            <span className="mt-5 inline-flex rounded-full bg-[#f1f2ee] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#68736d]">Em desenvolvimento</span>
            <h2 id="pluggy-modal-title" className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Conexão bancária via Pluggy</h2>
            <p className="mt-3 text-sm leading-6 text-[#68736d]">Estamos trabalhando para trazer a conexão bancária automática ao FinlyApp, permitindo que você integre suas contas e acompanhe suas movimentações com ainda mais praticidade.</p>
            <p className="mt-3 text-sm leading-6 text-[#68736d]">Esse recurso estará disponível futuramente em um dos nossos <strong className="font-semibold text-[#10231c]">planos pagos</strong>. Enquanto isso, você pode continuar importando suas transações por meio de planilhas.</p>
            <button type="button" onClick={() => setPluggyModalOpen(false)} className="mt-6 h-11 w-full rounded-xl bg-[#10231c] text-sm font-semibold text-white transition hover:bg-[#1b382b]">Entendi</button>
          </section>
        </div>
      )}
    </div>
  )
}

export default Conexoes
