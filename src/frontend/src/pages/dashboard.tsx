import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  Grid2X2,
  Link2,
  LogOut,
  MoreHorizontal,
  PieChart,
  Plus,
  Receipt,
  Settings,
  ShoppingBag,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getMe } from '../services/auth'
import {
  getTransactions,
  type Transaction,
} from '../services/transactions'

interface Usuario {
  id: string
  nome: string
  email: string
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)

  return parsedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [transacoes, setTransacoes] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const [dadosUsuario, dadosTransacoes] = await Promise.all([
          getMe(),
          getTransactions(1, 50),
        ])

        setUsuario(dadosUsuario)
        setTransacoes(dadosTransacoes.data ?? [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar seus dados.',
        )
      } finally {
        setLoading(false)
      }
    }

    carregarDashboard()
  }, [])

  const nome = usuario?.nome?.split(' ')[0] || 'usuário'

  const mesAtual = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  const mesFormatado =
    mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)

  const saldo = 0
  const entradas = 0
  const saidas = 0

  const transacoesRecentes = useMemo(
    () => transacoes.slice(0, 5),
    [transacoes],
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f0]">
        <div className="text-sm text-[#68736d]">
          Carregando seu financeiro...
        </div>
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

          <p className="mt-2 text-sm text-[#68736d]">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f0] text-[#10231c]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col bg-[#10231c] text-white lg:flex">
        <div className="flex h-24 items-center px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff3e] text-[15px] font-semibold tracking-[-0.04em] text-[#10231c]">
              F
            </div>

            <span className="text-[15px] font-semibold">
              FinlyApp
            </span>
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
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#d5ddd8] transition hover:bg-white/5"
            >
              <Link2 size={17} />
              Conectar ferramenta
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#d5ddd8] transition hover:bg-white/5"
            >
              <PieChart size={17} />
              Análises

              <span className="ml-auto text-[8px] uppercase text-[#81928a]">
                em breve
              </span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="relative">
            {menuOpen && (
              <div className="absolute bottom-[58px] -left-[8px] right-0 z-50 rounded-xl border border-white/10 bg-[#182c24] p-2 shadow-xl">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#d5ddd8] transition hover:bg-white/5 hover:text-white"
                >
                  <Settings size={15} />
                  Configurações
                </button>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('token')
                    window.location.href = '/login'
                  }}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#d5ddd8] transition hover:bg-white/5 hover:text-white"
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

                <p className="mt-0.5 text-[10px] text-[#8fa098]">
                  Plano essencial
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#8fa098] transition hover:bg-white/5 hover:text-white"
                aria-label="Abrir menu do usuário"
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[232px]">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-11 lg:py-8">
          <div className="lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff3e] text-[14px] font-semibold tracking-[-0.04em] text-[#10231c]">
                F
              </div>

              <span className="text-sm font-semibold">
                FinlyApp
              </span>
            </div>
          </div>

          
        </header>

        <div className="mx-auto max-w-[1200px] px-5 pb-10 sm:px-8 lg:px-11">
          <section className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8983]">
                {new Date()
                  .toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                  .toUpperCase()}
              </p>

              <h1 className="mt-2 text-[34px] font-normal tracking-[-0.04em] text-[#10231c] sm:text-[42px]">
                Bom dia, {nome}.
              </h1>

              <p className="mt-1 text-sm text-[#68736d]">
                Aqui está um retrato gentil do seu dinheiro este mês.
              </p>
            </div>

            <button
              type="button"
              className="flex w-fit items-center gap-3 rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 text-sm font-medium"
            >
              {mesFormatado}

              <ChevronDown
                size={16}
                className="text-[#68736d]"
              />
            </button>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              title="Saldo disponível"
              value={formatCurrency(saldo)}
              icon={<Wallet size={17} />}
              dark
              onClick={() => setSelectedCard('saldo')}
            />

            <DashboardCard
              title="Entradas"
              value={formatCurrency(entradas)}
              icon={<Plus size={18} />}
              subtitle="Sem dados ainda"
              onClick={() => setSelectedCard('entradas')}
            />

            <DashboardCard
              title="Saídas"
              value={formatCurrency(saidas)}
              icon={<CreditCard size={17} />}
              subtitle="Sem dados ainda"
              onClick={() => setSelectedCard('saidas')}
            />

            <DashboardCard
              title="Meta mensal"
              value="—"
              icon={<Zap size={17} />}
              subtitle="Configure sua meta"
              onClick={() => setSelectedCard('meta')}
            />
          </section>

          <section className="mt-3 grid gap-3 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-[20px] border border-[#dfe3dc] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">
                  Ritmo financeiro
                </h2>

                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-medium text-[#64716a]"
                >
                  Ver detalhes
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="relative mt-7 h-[220px] overflow-hidden">
                <div className="absolute inset-x-0 top-0 border-t border-dashed border-[#e1e4dc]" />
                <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-[#e1e4dc]" />
                <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-[#e1e4dc]" />
                <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-[#e1e4dc]" />

                {transacoes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp
                        size={22}
                        className="mx-auto text-[#b8c0ba]"
                      />

                      <p className="mt-2 text-sm font-medium text-[#68736d]">
                        Seu gráfico aparecerá aqui
                      </p>

                      <p className="mt-1 text-xs text-[#9aa39e]">
                        Adicione suas primeiras transações.
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[#9aa39e]">
                  {[
                    'jan',
                    'fev',
                    'mar',
                    'abr',
                    'mai',
                    'jun',
                    'jul',
                  ].map((mes) => (
                    <span key={mes}>{mes}</span>
                  ))}
                </div>
              </div>

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

            <div className="rounded-[20px] border border-[#dfe3dc] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">
                  Onde você gasta
                </h2>

                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-medium text-[#64716a]"
                >
                  Tudo
                  <ChevronRight size={14} />
                </button>
              </div>

              {transacoes.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <Receipt
                    size={22}
                    className="text-[#b8c0ba]"
                  />

                  <p className="mt-3 text-sm font-medium text-[#68736d]">
                    Nenhuma categoria ainda
                  </p>

                  <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#9aa39e]">
                    Quando você começar a registrar seus gastos,
                    eles aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-5" />
              )}
            </div>
          </section>

          <section className="mt-3 rounded-[20px] border border-[#dfe3dc] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                Atividade recente
              </h2>

              <button
                type="button"
                className="flex items-center gap-1 text-xs font-medium text-[#64716a]"
              >
                Ver todas
                <ChevronRight size={14} />
              </button>
            </div>

            {transacoesRecentes.length === 0 ? (
              <div className="flex min-h-[130px] items-center justify-center">
                <div className="text-center">
                  <Receipt
                    size={22}
                    className="mx-auto text-[#b8c0ba]"
                  />

                  <p className="mt-2 text-sm text-[#68736d]">
                    Nenhuma atividade recente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-[#edf0eb]">
                {transacoesRecentes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2e9]">
                        <ShoppingBag size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {transacao.estabelecimento}
                        </p>

                        <p className="mt-1 text-xs text-[#89938e]">
                          {transacao.categoria ||
                            'Sem categoria'}{' '}
                          · {formatDate(transacao.data)}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold">
                      {formatCurrency(Number(transacao.valor))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[24px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selectedCard === 'saldo' &&
                  'Saldo disponível'}
                {selectedCard === 'entradas' && 'Entradas'}
                {selectedCard === 'saidas' && 'Saídas'}
                {selectedCard === 'meta' && 'Meta mensal'}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f4ef] text-[#68736d]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-3xl font-semibold tracking-tight">
                {selectedCard === 'meta'
                  ? '—'
                  : formatCurrency(0)}
              </p>

              <p className="mt-2 text-sm text-[#68736d]">
                Ainda não existem transações suficientes para
                apresentar os detalhes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="mt-8 h-11 w-full rounded-xl bg-[#10231c] text-sm font-semibold text-white"
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
  subtitle?: string
  dark?: boolean
  onClick: () => void
}

function DashboardCard({
  title,
  value,
  icon,
  subtitle,
  dark = false,
  onClick,
}: DashboardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-[158px] rounded-[20px] border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
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

        <span
          className={
            dark ? 'text-[#aebdb4]' : 'text-[#8b958f]'
          }
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-8 text-[29px] font-semibold tracking-[-0.04em] ${
          dark ? 'text-[#d8ff3e]' : 'text-[#10231c]'
        }`}
      >
        {value}
      </p>

      <div className="mt-2 flex items-center gap-1 text-[11px]">
        {title === 'Saldo disponível' && (
          <TrendingUp
            size={12}
            className={
              dark ? 'text-[#d8ff3e]' : 'text-[#6b9d27]'
            }
          />
        )}

        <span
          className={
            dark ? 'text-[#aebdb4]' : 'text-[#7c8781]'
          }
        >
          {subtitle || 'Clique para ver detalhes'}
        </span>
      </div>
    </button>
  )
}

export default Dashboard