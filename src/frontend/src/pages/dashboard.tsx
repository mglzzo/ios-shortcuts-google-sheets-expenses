import {
  ChevronDown,
  CreditCard,
  Grid2X2,
  Link2,
  LogOut,
  Menu,
  MoreHorizontal,
  PieChart,
  Receipt,

  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getMe } from '../services/auth'
import {
  getTransactions,
  type Transaction,
} from '../services/transicoes'

interface Usuario {
  id: string
  nome: string
  email: string
}

let dashboardCache: {
  token: string
  usuario: Usuario
  transacoes: Transaction[]
} | null = null

let dashboardRequest: Promise<{
  token: string
  usuario: Usuario
  transacoes: Transaction[]
}> | null = null

// Limpa os dados em memória para que o dashboard consulte novamente a API.
export function invalidarDashboardCache() {
  dashboardCache = null
  dashboardRequest = null
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function getMonthKey(date: string) {
  return date.slice(0, 7)
}

function getMonthLabel(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)

  return new Date(year, monthNumber - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

function getValue(value: string | number) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

type ImportNotification = { tipo: 'success' | 'warning' | 'error'; mensagem: string }

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const tokenAtual = localStorage.getItem('token') || ''
  const precisaAtualizar = sessionStorage.getItem('finly-refresh-dashboard') === 'true'
  const cacheInicial =
    !precisaAtualizar && dashboardCache?.token === tokenAtual ? dashboardCache : null

  const [usuario, setUsuario] = useState<Usuario | null>(
    cacheInicial?.usuario ?? null,
  )
  const [transacoes, setTransacoes] = useState<Transaction[]>(
    cacheInicial?.transacoes ?? [],
  )
  const [loading, setLoading] = useState(!cacheInicial)
  const [error, setError] = useState('')
  const [importNotification, setImportNotification] = useState<ImportNotification | null>(() => {
    const valor = sessionStorage.getItem('finly-import-notification')
    if (!valor) return null
    try { return JSON.parse(valor) as ImportNotification } catch { return null }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [monthMenuOpen, setMonthMenuOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(
    getMonthKey(new Date().toISOString()),
  )

  useEffect(() => {
    let ativo = true
    const token = localStorage.getItem('token') || ''
    const precisaAtualizar = sessionStorage.getItem('finly-refresh-dashboard') === 'true'
    sessionStorage.removeItem('finly-refresh-dashboard')
    sessionStorage.removeItem('finly-import-notification')
    if (precisaAtualizar) {
      invalidarDashboardCache()
      setLoading(true)
    }

    if (!token) {
      setLoading(false)
      setError('Usuário não autenticado.')
      return () => {
        ativo = false
      }
    }

    if (dashboardCache?.token === token) {
      setUsuario(dashboardCache.usuario)
      setTransacoes(dashboardCache.transacoes)
      setLoading(false)
      return () => {
        ativo = false
      }
    }

    async function carregarDashboard() {
      try {
        setError('')

        if (precisaAtualizar) {
          // Não reutilize uma requisição iniciada antes da importação.
          dashboardRequest = null
        }

        if (!dashboardRequest) {
          dashboardRequest = (async () => {
            const dadosUsuario = await getMe()
            const primeiraPagina = await getTransactions(1, 50)
            const dados = [...(primeiraPagina.data ?? [])]
            let pagina = primeiraPagina.page
            let temMais = primeiraPagina.hasMore

            while (temMais) {
              pagina += 1
              const proximaPagina = await getTransactions(pagina, 50)
              dados.push(...(proximaPagina.data ?? []))
              temMais = proximaPagina.hasMore
            }

            return {
              token,
              usuario: dadosUsuario,
              transacoes: dados,
            }
          })()
        }

        const resultado = await dashboardRequest

        if (resultado.token === token) {
          dashboardCache = resultado
        }

        if (ativo) {
          setUsuario(resultado.usuario)
          setTransacoes(resultado.transacoes)

          // Depois de uma importação, selecione o mês mais recente com
          // transações para que os indicadores mostrem os dados recém-importados,
          // inclusive quando a planilha contém datas anteriores ao mês atual.
          if (resultado.transacoes.length > 0) {
            const existeNoMesSelecionado = resultado.transacoes.some(
              (transacao) => getMonthKey(transacao.data) === selectedMonth,
            )

            if (precisaAtualizar || !existeNoMesSelecionado) {
              const datasValidas = resultado.transacoes
                .map((transacao) => transacao.data)
                .filter((data) => /^\d{4}-\d{2}-\d{2}/.test(data))
                .sort((a, b) => b.localeCompare(a))

              if (datasValidas.length > 0) {
                setSelectedMonth(getMonthKey(datasValidas[0]))
              }
            }
          }
        }
      } catch (err) {
        if (ativo) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar seus dados.',
          )
        }
      } finally {
        dashboardRequest = null

        if (ativo) {
          setLoading(false)
        }
      }
    }

    carregarDashboard()

    return () => {
      ativo = false
    }
  }, [location.key])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const fecharComEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', fecharComEsc)
    return () => window.removeEventListener('keydown', fecharComEsc)
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!importNotification) return
    const timer = window.setTimeout(() => setImportNotification(null), 6000)
    return () => window.clearTimeout(timer)
  }, [importNotification])

  const nome = usuario?.nome?.split(' ')[0] || 'usuário'

  const meses = useMemo(() => {
    const hoje = new Date()

    return Array.from({ length: 4 }, (_, index) => {
      const data = new Date(
        hoje.getFullYear(),
        hoje.getMonth() - index,
        1,
      )

      return `${data.getFullYear()}-${String(
        data.getMonth() + 1,
      ).padStart(2, '0')}`
    })
  }, [])

  const transacoesDoMes = useMemo(
    () =>
      transacoes.filter(
        (transacao) => getMonthKey(transacao.data) === selectedMonth,
      ),
    [transacoes, selectedMonth],
  )

  const entradas = useMemo(
    () =>
      transacoesDoMes.reduce((total, transacao) => {
        const valor = getValue(transacao.valor)
        return total + (valor > 0 ? valor : 0)
      }, 0),
    [transacoesDoMes],
  )

  const saidas = useMemo(
    () =>
      transacoesDoMes.reduce((total, transacao) => {
        const valor = getValue(transacao.valor)
        return total + (valor < 0 ? Math.abs(valor) : 0)
      }, 0),
    [transacoesDoMes],
  )

  const gastosCartao = useMemo(
    () =>
      transacoesDoMes.reduce((total, transacao) => {
        const metodo = String(transacao.metodoPagamento || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase()
        const valor = getValue(transacao.valor)

        return metodo === 'CARTAO' && valor < 0
          ? total + Math.abs(valor)
          : total
      }, 0),
    [transacoesDoMes],
  )

  const economia = entradas - saidas


  const categorias = useMemo(() => {
    const mapa = new Map<string, number>()

    transacoesDoMes.forEach((transacao) => {
      const valor = getValue(transacao.valor)

      if (valor >= 0) {
        return
      }

      const categoria = transacao.categoria || 'Outros'
      mapa.set(
        categoria,
        (mapa.get(categoria) || 0) + Math.abs(valor),
      )
    })

    return Array.from(mapa.entries())
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
  }, [transacoesDoMes])

  const totalCategorias = categorias.reduce(
    (total, categoria) => total + categoria.valor,
    0,
  )

  const despesasDoMes = useMemo(
    () =>
      [...transacoesDoMes]
        .filter((transacao) => getValue(transacao.valor) < 0)
        .sort((a, b) => Math.abs(getValue(b.valor)) - Math.abs(getValue(a.valor))),
    [transacoesDoMes],
  )

  const transacoesDetalhe = useMemo(() => {
    switch (selectedCard) {
      case 'cartao':
        return transacoesDoMes.filter(
          (transacao) =>
            getValue(transacao.valor) < 0 &&
            transacao.metodoPagamento?.trim().toUpperCase() === 'CARTAO',
        )
      case 'entradas':
        return transacoesDoMes.filter((transacao) => getValue(transacao.valor) > 0)
      case 'saidas':
      case 'categorias':
        return despesasDoMes
      case 'economia':
      case 'atividades':
        return [...transacoesDoMes].sort((a, b) => b.data.localeCompare(a.data))
      case 'maior':
        return despesasDoMes
      default:
        return []
    }
  }, [selectedCard, transacoesDoMes, despesasDoMes])

  const maiorGasto = useMemo(
    () =>
      [...transacoesDoMes]
        .filter((transacao) => getValue(transacao.valor) < 0)
        .sort(
          (a, b) =>
            Math.abs(getValue(b.valor)) -
            Math.abs(getValue(a.valor)),
        )[0] || null,
    [transacoesDoMes],
  )

  const parcelasProximas = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    return [...transacoes]
      .map((transacao) => {
        const item = transacao as Transaction & {
          parcelaAtual?: number | string | null
          parcelaTotal?: number | string | null
        }

        return {
          ...transacao,
          parcelaAtual: Number(item.parcelaAtual),
          parcelaTotal: Number(item.parcelaTotal),
        }
      })
      .filter((transacao) => {
        const data = new Date(`${transacao.data.slice(0, 10)}T00:00:00`)

        return (
          !Number.isNaN(data.getTime()) &&
          data > hoje &&
          transacao.parcelaTotal > 1 &&
          transacao.parcelaAtual > 0 &&
          transacao.parcelaAtual <= transacao.parcelaTotal
        )
      })
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 3)
  }, [transacoes])

  const atividadesRecentes = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(23, 59, 59, 999)

    return [...transacoesDoMes]
      .filter((transacao) => {
        const data = new Date(`${transacao.data.slice(0, 10)}T00:00:00`)
        return !Number.isNaN(data.getTime()) && data <= hoje
      })
      .sort((a, b) => {
        const dataA = new Date(`${a.data.slice(0, 10)}T00:00:00`).getTime()
        const dataB = new Date(`${b.data.slice(0, 10)}T00:00:00`).getTime()

        return dataB - dataA
      })
      .slice(0, 3)
  }, [transacoesDoMes])

  const fluxo = useMemo(() => {
    const [ano, mes] = selectedMonth.split('-').map(Number)
    const resultado = []

    for (let i = 3; i >= 0; i -= 1) {
      const data = new Date(ano, mes - 1 - i, 1)
      const chave = `${data.getFullYear()}-${String(
        data.getMonth() + 1,
      ).padStart(2, '0')}`

      const doMes = transacoes.filter(
        (transacao) => getMonthKey(transacao.data) === chave,
      )

      const entrada = doMes.reduce((total, transacao) => {
        const valor = getValue(transacao.valor)
        return total + (valor > 0 ? valor : 0)
      }, 0)

      const saida = doMes.reduce((total, transacao) => {
        const valor = getValue(transacao.valor)
        return total + (valor < 0 ? Math.abs(valor) : 0)
      }, 0)

      resultado.push({
        chave,
        nome: data.toLocaleDateString('pt-BR', { month: 'short' }),
        entrada,
        saida,
      })
    }

    return resultado
  }, [transacoes, selectedMonth])


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f0]">
        <span className="text-sm text-[#68736d]">
          Carregando seu financeiro...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f0] px-4">
        <div className="max-w-md rounded-2xl border border-[#dfe3dc] bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-[#10231c]">
            Não foi possível carregar sua conta
          </h1>
          <p className="mt-2 text-sm text-[#68736d]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f7f0] text-[#10231c]">
      {importNotification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-5 top-5 z-[100] flex max-w-[min(92vw,420px)] items-start gap-3 rounded-2xl border p-4 shadow-xl ${
            importNotification.tipo === 'success'
              ? 'border-green-200 bg-white text-[#10231c]'
              : importNotification.tipo === 'warning'
                ? 'border-amber-200 bg-white text-[#10231c]'
                : 'border-red-200 bg-white text-[#10231c]'
          }`}
        >
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
            importNotification.tipo === 'success' ? 'bg-green-500' : importNotification.tipo === 'warning' ? 'bg-amber-500' : 'bg-red-500'
          }`} />
          <p className="flex-1 text-sm leading-5">{importNotification.mensagem}</p>
          <button type="button" aria-label="Fechar notificação" onClick={() => setImportNotification(null)} className="ml-1 text-lg leading-4 text-[#68736d] hover:text-[#10231c]">×</button>
        </div>
      )}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col bg-[#10231c] text-white xl:flex">
        <div className="flex h-24 items-center px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff3e] text-[15px] font-semibold text-[#10231c]">
              F
            </div>
            <span className="text-[15px] font-semibold">FinlyApp</span>
          </div>
        </div>

        <div className="px-5 pt-10">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94a69d]">
            Seu espaço
          </p>

          <nav className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl bg-[#d8ff3e] px-3 py-3 text-left text-sm font-semibold text-[#10231c]"
            >
              <Grid2X2 size={17} />
              Visão geral
            </button>

            <button
              type="button"
              onClick={() => navigate('/conexoes')}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#8fa098] transition hover:bg-white/5 hover:text-white"
            >
              <Link2 size={17} />
              Conexões
            </button>

           
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="relative">
            {menuOpen && (
              <div className="absolute bottom-[58px] -left-[8px] right-0 z-50 rounded-xl border border-white/10 bg-[#182c24] p-2 shadow-xl">

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('token')
                    window.location.href = '/login'
                  }}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#d5ddd8]"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0bd62] text-xs font-semibold text-[#10231c]">
                {nome.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">
                  {usuario?.nome}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#8fa098]"
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden" role="presentation">
          <button type="button" aria-label="Fechar menu" className="absolute inset-0 h-full w-full bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <aside id="mobile-navigation" className="absolute inset-y-0 left-0 flex w-[min(82vw,280px)] flex-col bg-[#10231c] text-white shadow-2xl" aria-label="Menu principal">
            <div className="flex h-20 items-center justify-between px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff3e] text-[15px] font-semibold text-[#10231c]">F</div>
                <span className="text-[15px] font-semibold">FinlyApp</span>
              </div>
              <button type="button" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl text-[#d5ddd8] hover:bg-white/10"><X size={19} /></button>
            </div>
            <div className="px-4 pt-6">
              <p className="mb-4 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94a69d]">Seu espaço</p>
              <nav className="space-y-2">
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="flex w-full items-center gap-3 rounded-xl bg-[#d8ff3e] px-3 py-3 text-left text-sm font-semibold text-[#10231c]"><Grid2X2 size={17} />Visão geral</button>
                <button type="button" onClick={() => { setMobileMenuOpen(false); navigate('/conexoes') }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#d5ddd8] transition hover:bg-white/5"><Link2 size={17} />Conexões</button>
              </nav>
            </div>
            <div className="mt-auto border-t border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0bd62] text-xs font-semibold text-[#10231c]">{nome.slice(0, 2).toUpperCase()}</div>
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{usuario?.nome}</p><p className="truncate text-xs text-[#94a69d]">{usuario?.email}</p></div>
              </div>
              <button type="button" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#d5ddd8] hover:bg-white/5"><LogOut size={16} />Sair</button>
            </div>
          </aside>
        </div>
      )}

      <main className="min-h-screen min-w-0 overflow-y-auto xl:ml-[232px]">
        <header className="px-4 py-4 sm:px-8 lg:px-11 lg:py-8">
          <div className="flex items-center justify-start gap-3 xl:hidden">
            <button type="button" aria-label="Abrir menu lateral" aria-controls="mobile-navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe3dc] bg-white text-[#10231c] shadow-sm transition hover:bg-[#f1f4ed] focus:outline-none focus:ring-4 focus:ring-[#10231c]/10">
              <Menu size={21} />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff3e] text-[14px] font-semibold text-[#10231c]">
                F
              </div>
              <span className="text-sm font-semibold">FinlyApp</span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-4 pb-8 sm:px-8 lg:px-11">
          <section className="mb-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8983]">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>

              <h1 className="mt-2 break-words text-[30px] font-normal tracking-[-0.04em] sm:text-[42px]">
                Bom dia, {nome}.
              </h1>
            </div>

            <div className="relative z-30">
              <button
                type="button"
                aria-label="Selecionar mês"
                aria-expanded={monthMenuOpen}
                onClick={() => setMonthMenuOpen((open) => !open)}
                className="flex w-full min-w-0 items-center justify-between gap-4 rounded-2xl sm:w-auto sm:min-w-[190px] border border-[#dfe3dc] bg-white px-4 py-3.5 text-sm font-semibold capitalize text-[#10231c] shadow-sm transition hover:border-[#b8c4bb] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#10231c]/5"
              >
                {getMonthLabel(selectedMonth)}
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-[#68736d] transition-transform ${
                    monthMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {monthMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-full min-w-[210px] overflow-hidden rounded-2xl border border-[#dfe3dc] bg-white p-1.5 shadow-xl">
                  {meses.map((mes) => (
                    <button
                      key={mes}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(mes)
                        setMonthMenuOpen(false)
                      }}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm capitalize transition ${
                        selectedMonth === mes
                          ? 'bg-[#10231c] font-semibold text-white'
                          : 'text-[#526159] hover:bg-[#f1f4ed]'
                      }`}
                    >
                      {getMonthLabel(mes)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              title="Gastos com cartão"
              value={formatCurrency(gastosCartao)}
              icon={<CreditCard size={17} />}
              dark
              onClick={() => setSelectedCard('cartao')}
            />

            <DashboardCard
              title="Entradas"
              value={formatCurrency(entradas)}
              icon={<TrendingUp size={17} />}
              onClick={() => setSelectedCard('entradas')}
            />

            <DashboardCard
              title="Saídas"
              value={formatCurrency(saidas)}
              icon={<CreditCard size={17} />}
              onClick={() => setSelectedCard('saidas')}
            />

            <DashboardCard
              title="Economia no mês"
              value={formatCurrency(economia)}
              icon={<Wallet size={17} />}
              onClick={() => setSelectedCard('economia')}
            />
          </section>

          <section className="mt-3 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="min-w-0 rounded-[20px] border border-[#dfe3dc] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Fluxo financeiro</h2>
                <span className="text-xs text-[#89938e]">
                  {getMonthLabel(selectedMonth)}
                </span>
              </div>

              {transacoes.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp size={22} />}
                  title="Nenhum dado"
                  description="Adicione transações para visualizar o fluxo financeiro."
                />
              ) : (
                <div className="mt-5">
                  {(() => {
                    const chartWidth = 640
                    const chartHeight = 220
                    const left = 48
                    const right = 16
                    const top = 12
                    const bottom = 32
                    const plotWidth = chartWidth - left - right
                    const plotHeight = chartHeight - top - bottom
                    const maxValor = Math.max(
                      ...fluxo.map((item) =>
                        Math.max(item.entrada, item.saida),
                      ),
                      1,
                    )
                    const gridMax =
                      Math.ceil(maxValor / 500) * 500 || 500
                    const points = fluxo.map((item, index) => {
                      const x =
                        left +
                        (index * plotWidth) /
                          Math.max(fluxo.length - 1, 1)

                      const entradaY =
                        top +
                        plotHeight -
                        (item.entrada / gridMax) * plotHeight

                      const saidaY =
                        top +
                        plotHeight -
                        (item.saida / gridMax) * plotHeight

                      return {
                        ...item,
                        x,
                        entradaY,
                        saidaY,
                      }
                    })

                    const entradaPath = points
                      .map(
                        (point, index) =>
                          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.entradaY}`,
                      )
                      .join(' ')

                    const saidaPath = points
                      .map(
                        (point, index) =>
                          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.saidaY}`,
                      )
                      .join(' ')

                    const ticks = [0, 1, 2, 3, 4].map(
                      (index) => ({
                        value: gridMax - (gridMax / 4) * index,
                        y: top + (plotHeight / 4) * index,
                      }),
                    )

                    return (
                      <div className="w-full overflow-hidden">
                        <svg
                          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                          className="h-[210px] w-full sm:h-[245px]"
                          preserveAspectRatio="none"
                        >
                          {ticks.map((tick) => (
                            <g key={tick.y}>
                              <line
                                x1={left}
                                y1={tick.y}
                                x2={chartWidth - right}
                                y2={tick.y}
                                stroke="#e8ebe6"
                                strokeDasharray="2 4"
                              />
                              <text
                                x={2}
                                y={tick.y + 4}
                                fontSize="10"
                                fill="#9aa39e"
                              >
                                {formatCurrency(tick.value)
                                  .replace(',00', '')
                                  .replace('R$', 'R$ ')}
                              </text>
                            </g>
                          ))}

                          {points.map((point) => (
                            <line
                              key={`vertical-${point.chave}`}
                              x1={point.x}
                              y1={top}
                              x2={point.x}
                              y2={top + plotHeight}
                              stroke="#edf0eb"
                              strokeDasharray="2 4"
                            />
                          ))}

                          <path
                            d={entradaPath}
                            fill="none"
                            stroke="#5aa947"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <path
                            d={saidaPath}
                            fill="none"
                            stroke="#ff6f5c"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {points.map((point) => (
                            <g key={point.chave}>
                              <circle
                                cx={point.x}
                                cy={point.entradaY}
                                r="4"
                                fill="#5aa947"
                              />
                              <circle
                                cx={point.x}
                                cy={point.saidaY}
                                r="4"
                                fill="#ff6f5c"
                              />
                              <text
                                x={point.x}
                                y={chartHeight - 8}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#9aa39e"
                              >
                                {point.nome}
                              </text>
                            </g>
                          ))}

                          {(() => {
                            const ultimo = points[points.length - 1]

                            if (!ultimo) {
                              return null
                            }

                            return (
                              <>
                                {ultimo.entrada > 0 && (
                                  <g>
                                    <rect
                                      x={Math.min(
                                        ultimo.x - 28,
                                        chartWidth - 76,
                                      )}
                                      y={ultimo.entradaY - 25}
                                      width="66"
                                      height="20"
                                      rx="6"
                                      fill="#5aa947"
                                    />
                                    <text
                                      x={Math.min(
                                        ultimo.x + 5,
                                        chartWidth - 43,
                                      )}
                                      y={ultimo.entradaY - 11}
                                      textAnchor="middle"
                                      fontSize="9"
                                      fontWeight="600"
                                      fill="#ffffff"
                                    >
                                      {formatCurrency(ultimo.entrada)}
                                    </text>
                                  </g>
                                )}

                                {ultimo.saida > 0 && (
                                  <g>
                                    <rect
                                      x={Math.min(
                                        ultimo.x - 28,
                                        chartWidth - 76,
                                      )}
                                      y={ultimo.saidaY + 8}
                                      width="66"
                                      height="20"
                                      rx="6"
                                      fill="#ff6f5c"
                                    />
                                    <text
                                      x={Math.min(
                                        ultimo.x + 5,
                                        chartWidth - 43,
                                      )}
                                      y={ultimo.saidaY + 22}
                                      textAnchor="middle"
                                      fontSize="9"
                                      fontWeight="600"
                                      fill="#ffffff"
                                    >
                                      {formatCurrency(ultimo.saida)}
                                    </text>
                                  </g>
                                )}
                              </>
                            )
                          })()}
                        </svg>
                      </div>
                    )
                  })()}
                </div>
              )}

              <div className="mt-4 flex gap-5 text-[11px] text-[#68736d]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#b9e92f]" />
                  Entradas
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ff8b72]" />
                  Saídas
                </span>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedCard('categorias')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedCard('categorias')
                }
              }}
              className="min-w-0 cursor-pointer rounded-[20px] border border-[#dfe3dc] bg-white p-5 transition hover:border-[#b8c4bb] hover:shadow-md sm:p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Onde você gasta</h2>
                <span className="text-xs text-[#89938e]">Este mês</span>
              </div>

              {categorias.length === 0 ? (
                <EmptyState
                  icon={<Receipt size={22} />}
                  title="Nenhum dado"
                  description="Seus gastos por categoria aparecerão aqui."
                />
              ) : (
                <>
                  <div
                    className="mx-auto mt-5 h-[150px] w-[150px] rounded-full"
                    style={{
                      background: `conic-gradient(${categorias
                        .map((categoria, index) => {
                          const cores = [
                            '#68b95a',
                            '#f3c44f',
                            '#ff9278',
                            '#8874d8',
                            '#86a9df',
                          ]

                          const inicio =
                            categorias
                              .slice(0, index)
                              .reduce(
                                (total, item) =>
                                  total +
                                  (item.valor / totalCategorias) * 100,
                                0,
                              )

                          const fim =
                            inicio +
                            (categoria.valor / totalCategorias) * 100

                          return `${cores[index % cores.length]} ${inicio}% ${fim}%`
                        })
                        .join(', ')})`,
                    }}
                  >
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-[90px] w-[90px] flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-[10px] text-[#89938e]">
                          em gastos
                        </span>
                        <span className="mt-1 text-sm font-semibold">
                          {formatCurrency(totalCategorias)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {categorias.slice(0, 5).map((categoria, index) => {
                      const cores = [
                        '#68b95a',
                        '#f3c44f',
                        '#ff9278',
                        '#8874d8',
                        '#86a9df',
                      ]

                      const percentual = Math.round(
                        (categoria.valor / totalCategorias) * 100,
                      )

                      return (
                        <div
                          key={categoria.nome}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                cores[index % cores.length],
                            }}
                          />
                          <span className="min-w-0 flex-1 truncate text-[#68736d]">
                            {categoria.nome}
                          </span>
                          <span className="font-medium">
                            {percentual}%
                          </span>
                          <span className="w-[82px] text-right text-[#89938e]">
                            {formatCurrency(categoria.valor)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="mt-3 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(210px,0.85fr)_minmax(300px,1.6fr)_minmax(360px,1.7fr)]">
            <InfoCard title="Contas próximas" onClick={() => setSelectedCard('contas')}>
              {parcelasProximas.length === 0 ? (
                <EmptyState
                  icon={<Receipt size={22} />}
                  title="Nenhuma parcela próxima"
                  description="As parcelas futuras aparecerão aqui quando estiverem disponíveis nas transações."
                />
              ) : (
                <div className="space-y-4">
                  {parcelasProximas.map((parcela) => (
                    <div
                      key={parcela.id}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef7d2] text-[#10231c]">
                        <CreditCard size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {parcela.estabelecimento}
                        </p>
                        <p className="mt-1 text-xs text-[#89938e]">
                          Parcela {parcela.parcelaAtual} de {parcela.parcelaTotal} ·{' '}
                          {formatDate(parcela.data)}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-[#10231c]">
                        {formatCurrency(Math.abs(getValue(parcela.valor)))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>

            <InfoCard title="Maior gasto do mês" onClick={() => setSelectedCard('maior')}>
              {maiorGasto ? (
                <div className="flex min-h-[170px] flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0ec] text-[#e56e55]">
                      <ShoppingBag size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {maiorGasto.estabelecimento}
                      </p>
                      <p className="mt-1 text-xs text-[#89938e]">
                        {maiorGasto.categoria || 'Sem categoria'} ·{' '}
                        {formatDate(maiorGasto.data)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 text-[30px] font-semibold tracking-[-0.04em]">
                    {formatCurrency(
                      Math.abs(getValue(maiorGasto.valor)),
                    )}
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={<ShoppingBag size={22} />}
                  title="Nenhum gasto"
                  description="Seu maior gasto aparecerá aqui."
                />
              )}
            </InfoCard>

            <InfoCard title="Atividades recentes" onClick={() => setSelectedCard('atividades')}>
              {atividadesRecentes.length === 0 ? (
                <EmptyState
                  icon={<Receipt size={22} />}
                  title="Nenhuma atividade"
                  description="Suas atividades recentes aparecerão aqui."
                />
              ) : (
                <div className="divide-y divide-[#edf0eb]">
                  {atividadesRecentes.map((transacao) => {
                    const valor = getValue(transacao.valor)
                    const entrada = valor >= 0

                    return (
                      <div
                        key={transacao.id}
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              entrada
                                ? 'bg-[#e9f6df] text-[#5d9b4b]'
                                : 'bg-[#fff0ec] text-[#e56e55]'
                            }`}
                          >
                            {entrada ? (
                              <TrendingUp size={16} />
                            ) : (
                              <TrendingDown size={16} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {transacao.estabelecimento}
                            </p>
                            <p className="mt-1 text-xs text-[#89938e]">
                              {transacao.categoria || 'Sem categoria'} ·{' '}
                              {formatDate(transacao.data)}
                            </p>
                          </div>
                        </div>

                        <p
                          className={`shrink-0 text-sm font-semibold ${
                            entrada
                              ? 'text-[#5d9b4b]'
                              : 'text-[#e56e55]'
                          }`}
                        >
                          {entrada ? '+' : '-'}
                          {formatCurrency(Math.abs(valor))}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </InfoCard>
          </section>
        </div>
      </main>

      {selectedCard && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-3 backdrop-blur-[2px] sm:p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-[24px] bg-white p-4 shadow-2xl sm:max-h-[85vh] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedCard === 'cartao' && 'Gastos com cartão'}
                  {selectedCard === 'entradas' && 'Entradas'}
                  {selectedCard === 'saidas' && 'Saídas'}
                  {selectedCard === 'economia' && 'Economia no mês'}
                  {selectedCard === 'categorias' && 'Onde você gasta'}
                  {selectedCard === 'contas' && 'Contas próximas'}
                  {selectedCard === 'maior' && 'Gastos do mês'}
                  {selectedCard === 'atividades' && 'Atividades recentes'}
                </h2>
                <p className="mt-1 text-xs capitalize text-[#89938e]">
                  {getMonthLabel(selectedMonth)} · dados da sua conta
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar detalhes"
                onClick={() => setSelectedCard(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f4ef] text-[#68736d]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 flex-1 overflow-y-auto">
              {selectedCard === 'contas' ? (
                parcelasProximas.length === 0 ? (
                  <EmptyState icon={<Receipt size={22} />} title="Nenhuma conta próxima" description="Não há parcelas futuras disponíveis nos dados retornados pela API." />
                ) : (
                  <div className="divide-y divide-[#edf0eb]">
                    {parcelasProximas.map((parcela) => (
                      <div key={parcela.id} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{parcela.estabelecimento}</p>
                          <p className="mt-1 text-xs text-[#89938e]">Parcela {parcela.parcelaAtual} de {parcela.parcelaTotal} · {formatDate(parcela.data)}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold">{formatCurrency(Math.abs(getValue(parcela.valor)))}</p>
                      </div>
                    ))}
                  </div>
                )
              ) : transacoesDetalhe.length === 0 ? (
                <EmptyState icon={<Receipt size={22} />} title="Nenhuma transação encontrada" description="Não há itens para exibir neste período." />
              ) : (
                <div className="divide-y divide-[#edf0eb]">
                  {transacoesDetalhe.map((transacao) => {
                    const valor = getValue(transacao.valor)
                    const entrada = valor > 0
                    return (
                      <div key={transacao.id} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{transacao.estabelecimento}</p>
                          <p className="mt-1 text-xs text-[#89938e]">
                            {[transacao.categoria || 'Sem categoria', transacao.metodoPagamento || 'Método não informado', formatDate(transacao.data)].join(' · ')}
                          </p>
                          {transacao.observacao && <p className="mt-1 truncate text-xs text-[#89938e]">{transacao.observacao}</p>}
                        </div>
                        <p className={`shrink-0 text-sm font-semibold ${entrada ? 'text-[#5d9b4b]' : 'text-[#e56e55]'}`}>
                          {entrada ? '+' : valor < 0 ? '-' : ''}{formatCurrency(Math.abs(valor))}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="mt-5 h-11 w-full shrink-0 rounded-xl bg-[#10231c] text-sm font-semibold text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: string
  icon: ReactNode
  dark?: boolean
  onClick: () => void
}

function DashboardCard({
  title,
  value,
  icon,
  dark = false,
  onClick,
}: DashboardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[128px] min-w-0 rounded-[20px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[145px] sm:p-5 ${
        dark
          ? 'border-[#10231c] bg-[#10231c] text-white'
          : 'border-[#dfe3dc] bg-white text-[#10231c]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium ${
            dark ? 'text-[#cbd6cf]' : 'text-[#68736d]'
          }`}
        >
          {title}
        </span>

        <span className={dark ? 'text-[#aebdb4]' : 'text-[#8b958f]'}>
          {icon}
        </span>
      </div>

      <p
        className={`mt-6 break-words text-[21px] font-semibold tracking-[-0.04em] sm:mt-8 sm:text-[27px] ${
          dark ? 'text-[#d8ff3e]' : 'text-[#10231c]'
        }`}
      >
        {value}
      </p>
    </button>
  )
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
}

function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[180px] min-w-0 flex-col items-center justify-center text-center">
      <div className="text-[#b8c0ba]">{icon}</div>
      <p className="mt-3 text-sm font-medium text-[#68736d]">{title}</p>
      <p className="mt-1 max-w-[230px] text-xs leading-5 text-[#9aa39e]">
        {description}
      </p>
    </div>
  )
}

interface InfoCardProps {
  title: string
  children: ReactNode
  onClick: () => void
}

function InfoCard({ title, children, onClick }: InfoCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      className="min-w-0 cursor-pointer rounded-[20px] border border-[#dfe3dc] bg-white p-5 transition hover:border-[#b8c4bb] hover:shadow-md sm:p-6"
    >
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default Dashboard
