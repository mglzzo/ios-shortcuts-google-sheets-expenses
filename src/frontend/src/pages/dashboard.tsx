import { useEffect, useMemo, useState } from 'react'
import {
  Calculator,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Wallet,
  CreditCard,
  Lightbulb,
  CalendarDays,
  PiggyBank,
  BarChart3,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import { getMe } from '../services/auth'
import { getTransactions } from '../services/transicoes'
import { getGoals, type MetaAPI } from '../services/metas'
const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
type TransacaoDashboard = {
  id: string
  data: string
  valor: string | number
  estabelecimento?: string | null
  parcelaAtual?: number | null
  parcelaTotal?: number | null
  parcela_atual?: number | null
  parcela_total?: number | null
  categoria?: string | { id?: string | number; nome?: string | null } | null
  categoriaId?: string | number | null
  categoria_id?: string | number | null
  categoriaNome?: string | null
  categoria_nome?: string | null
  category?: string | { id?: string | number; name?: string | null } | null
}
async function buscarTodasTransacoes(): Promise<TransacaoDashboard[]> {
  const todas: TransacaoDashboard[] = []
  let pagina = 1
  const limite = 100
  while (true) {
    const resposta = await getTransactions(pagina, limite)
    const registros: TransacaoDashboard[] = Array.isArray(resposta)
      ? resposta as TransacaoDashboard[]
      : ((resposta as { data?: TransacaoDashboard[] })?.data ?? [])
    todas.push(...registros)
    const temMais = Array.isArray(resposta)
      ? registros.length === limite
      : Boolean(resposta?.hasMore)
    if (!temMais || registros.length === 0) break
    pagina += 1
  }
  return todas
}
function converterValor(valor: string | number): number {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }
  let texto = String(valor)
    .trim()
    .replace(/R\$|\s/gi, "")
    .replace(/\s/g, "");
  if (!texto) return 0;
  const negativo = texto.startsWith("-");
  texto = texto.replace(/^[+-]/, "");
  texto = texto.replace(/[^\d.,]/g, "");
  if (!texto || !/\d/.test(texto)) return 0;
  const ultimaVirgula = texto.lastIndexOf(",");
  const ultimoPonto = texto.lastIndexOf(".");
  if (ultimaVirgula > ultimoPonto) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  } else if (ultimoPonto > ultimaVirgula) {
    texto = texto.replace(/,/g, "");
  }
  const numero = Number(texto);
  if (!Number.isFinite(numero)) return 0;
  return negativo ? -Math.abs(numero) : Math.abs(numero);
}

type RendaMensalAPI = {
  valor: number | string | null
  atualizadoEm?: string
}

async function buscarRendaMensal(): Promise<number | null> {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Usuário não autenticado.')

  const resposta = await fetch(
    'https://ios-shortcuts-db-expenses.martinsmiguel90.workers.dev/income',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  )

  if (!resposta.ok) {
    throw new Error(`Não foi possível consultar a renda (HTTP ${resposta.status}).`)
  }

  const dados = (await resposta.json()) as RendaMensalAPI
  if (dados.valor === null || dados.valor === undefined || dados.valor === '') {
    return null
  }

  const valor = Number(dados.valor)
  if (!Number.isFinite(valor) || valor < 0) {
    throw new Error('A API retornou uma renda mensal inválida.')
  }

  return valor
}

function limitar(valor: number, minimo = 0, maximo = 1): number {
  return Math.min(maximo, Math.max(minimo, valor))
}

function percentualMeta(meta: MetaAPI): number {
  const informado = Number(meta.percentualConcluido)
  if (meta.percentualConcluido !== null && meta.percentualConcluido !== undefined && Number.isFinite(informado)) {
    return limitar(informado / 100, 0, 1)
  }

  const objetivo = Number(meta.valorDesejado)
  const acumulado = Number(meta.valorAcumulado)
  if (!Number.isFinite(objetivo) || objetivo <= 0 || !Number.isFinite(acumulado)) return 0
  return limitar(acumulado / objetivo, 0, 1)
}

type CategoriaDashboard = {
  id: string
  nome: string
}

async function buscarCategorias(): Promise<CategoriaDashboard[]> {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Usuário não autenticado.')

  const resposta = await fetch(
    'https://ios-shortcuts-db-expenses.martinsmiguel90.workers.dev/categories',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  )

  if (!resposta.ok) {
    throw new Error(`Não foi possível consultar as categorias (HTTP ${resposta.status}).`)
  }

  const resultado: unknown = await resposta.json()
  const lista = Array.isArray(resultado)
    ? resultado
    : resultado && typeof resultado === 'object' && Array.isArray((resultado as { data?: unknown }).data)
      ? (resultado as { data: unknown[] }).data
      : resultado && typeof resultado === 'object' && Array.isArray((resultado as { categorias?: unknown }).categorias)
        ? (resultado as { categorias: unknown[] }).categorias
        : null

  if (!lista) throw new Error('A API não retornou uma lista válida de categorias.')

  return lista.flatMap((item): CategoriaDashboard[] => {
    if (!item || typeof item !== 'object') return []
    const categoria = item as Record<string, unknown>
    const id = categoria.id ?? categoria.categoriaId
    const nome = categoria.nome ?? categoria.name ?? categoria.descricao
    if (id === undefined || id === null || typeof nome !== 'string' || !nome.trim()) return []
    return [{ id: String(id), nome: nome.trim() }]
  })
}

function nomeCategoriaTransacao(transacao: TransacaoDashboard, mapaCategorias: Map<string, string>): string {
  const categoria = transacao.categoria
  if (typeof categoria === 'string' && categoria.trim()) {
    const texto = categoria.trim()
    return mapaCategorias.get(texto) ?? texto
  }
  if (categoria && typeof categoria === 'object' && typeof categoria.nome === 'string' && categoria.nome.trim()) {
    return categoria.nome.trim()
  }
  if (typeof transacao.categoriaNome === 'string' && transacao.categoriaNome.trim()) return transacao.categoriaNome.trim()
  if (typeof transacao.categoria_nome === 'string' && transacao.categoria_nome.trim()) return transacao.categoria_nome.trim()
  const category = transacao.category
  if (typeof category === 'string' && category.trim()) return category.trim()
  if (category && typeof category === 'object' && typeof category.name === 'string' && category.name.trim()) {
    return category.name.trim()
  }
  const categoriaId = categoria && typeof categoria === 'object'
    ? categoria.id
    : transacao.categoriaId ?? transacao.categoria_id
  if (categoriaId !== undefined && categoriaId !== null) {
    return mapaCategorias.get(String(categoriaId)) ?? 'Sem categoria'
  }
  return 'Sem categoria'
}

function Dashboard() {
  const navigate = useNavigate()
  const [mesSelecionado, setMesSelecionado] = useState(
    new Date().getMonth()
  )
  const [anoSelecionado] = useState(new Date().getFullYear())
  const [menuMesAberto, setMenuMesAberto] = useState(false)
  const [detalhesSaudeAberto, setDetalhesSaudeAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [transacoes, setTransacoes] = useState<TransacaoDashboard[]>([])
  const [carregandoTransacoes, setCarregandoTransacoes] = useState(true)
  const [erroTransacoes, setErroTransacoes] = useState(false)
  const [categorias, setCategorias] = useState<CategoriaDashboard[]>([])
  const [carregandoCategorias, setCarregandoCategorias] = useState(true)
  const [erroCategorias, setErroCategorias] = useState(false)
  const [salarioMensal, setSalarioMensal] = useState<number | null>(null)
  const [erroRenda, setErroRenda] = useState(false)
  const [carregandoRenda, setCarregandoRenda] = useState(true)
  const [metas, setMetas] = useState<MetaAPI[]>([])
  const [erroMetas, setErroMetas] = useState(false)
  const [carregandoMetas, setCarregandoMetas] = useState(true)
  const [valorCompra, setValorCompra] = useState('')
  const [saldoSimulado, setSaldoSimulado] = useState<number | null>(null)
  function simularCompra() {
    const valor = Number(valorCompra)
    if (!Number.isFinite(valor) || valor <= 0) {
      setSaldoSimulado(null)
      return
    }
    setSaldoSimulado(disponivel - valor)
  }
  useEffect(() => {
    let ativo = true
    getMe()
      .then((usuario) => {
        if (ativo) setNome(usuario.nome)
      })
      .catch(() => {
        if (ativo) setNome('usuário')
      })
    return () => {
      ativo = false
    }
  }, [])
  useEffect(() => {
    let ativo = true
    async function carregarTransacoes() {
      try {
        setCarregandoTransacoes(true)
        setErroTransacoes(false)
        const registros = await buscarTodasTransacoes()
        if (ativo) setTransacoes(registros)
      } catch {
        if (ativo) setErroTransacoes(true)
      } finally {
        if (ativo) setCarregandoTransacoes(false)
      }
    }
    carregarTransacoes()
    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    let ativo = true

    async function carregarCategorias() {
      try {
        setCarregandoCategorias(true)
        setErroCategorias(false)
        const resultado = await buscarCategorias()
        if (ativo) setCategorias(resultado)
      } catch {
        if (ativo) setErroCategorias(true)
      } finally {
        if (ativo) setCarregandoCategorias(false)
      }
    }

    carregarCategorias()
    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    let ativo = true

    async function carregarRenda() {
      try {
        setCarregandoRenda(true)
        setErroRenda(false)
        const valor = await buscarRendaMensal()
        if (ativo) setSalarioMensal(valor)
      } catch {
        if (ativo) setErroRenda(true)
      } finally {
        if (ativo) setCarregandoRenda(false)
      }
    }

    async function carregarMetas() {
      try {
        setCarregandoMetas(true)
        setErroMetas(false)
        const resultado = await getGoals()
        if (ativo) setMetas(resultado)
      } catch {
        if (ativo) setErroMetas(true)
      } finally {
        if (ativo) setCarregandoMetas(false)
      }
    }

    carregarRenda()
    carregarMetas()

    return () => {
      ativo = false
    }
  }, [])

  const transacoesDoMes = useMemo(() => {
    return transacoes.filter((transacao) => {
      if (!transacao.data) return false
      const [ano, mes] = transacao.data.slice(0, 10).split('-').map(Number)
      return ano === anoSelecionado && mes === mesSelecionado + 1
    })
  }, [transacoes, mesSelecionado, anoSelecionado])
  const maioresCategorias = useMemo(() => {
    const mapaCategorias = new Map(categorias.map((categoria) => [categoria.id, categoria.nome]))
    const totais = new Map<string, number>()

    for (const transacao of transacoesDoMes) {
      const valor = converterValor(transacao.valor)
      if (valor >= 0) continue

      const nome = nomeCategoriaTransacao(transacao, mapaCategorias)
      totais.set(nome, (totais.get(nome) ?? 0) + Math.abs(valor))
    }

    return Array.from(totais.entries())
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 4)
  }, [transacoesDoMes, categorias])

  const totalDespesasMes = useMemo(
    () => transacoesDoMes.reduce((total, transacao) => {
      const valor = converterValor(transacao.valor)
      return valor < 0 ? total + Math.abs(valor) : total
    }, 0),
    [transacoesDoMes],
  )

  const renda = transacoesDoMes.reduce((total, transacao) => {
    const valor = converterValor(transacao.valor)
    return valor > 0 ? total + valor : total
  }, 0)
  const totalSaidas = transacoesDoMes.reduce((total, transacao) => {
    const valor = converterValor(transacao.valor)
    return valor < 0 ? total + Math.abs(valor) : total
  }, 0)
  const disponivel = renda - totalSaidas

  const saudeFinanceira = useMemo(() => {
    const temMovimentacoes = transacoesDoMes.length > 0
    const receitaBase = renda > 0 ? renda : (salarioMensal ?? 0)
    const temBaseFinanceira = temMovimentacoes && receitaBase > 0

    let pontosObtidos = 0
    let pontosDisponiveis = 0
    const criterios: { nome: string; pontos: number; maximo: number; disponivel: boolean }[] = []

    if (temBaseFinanceira) {
      const saldo = receitaBase - totalSaidas
      const proporcaoSaldo = saldo / receitaBase
      const pontos = 30 * limitar(0.5 + proporcaoSaldo * 0.5)
      criterios.push({ nome: 'Equilíbrio financeiro', pontos, maximo: 30, disponivel: true })
      pontosObtidos += pontos
      pontosDisponiveis += 30

      const taxaEconomia = saldo / receitaBase
      const pontosEconomia = 25 * limitar(taxaEconomia / 0.2)
      criterios.push({ nome: 'Capacidade de economia', pontos: pontosEconomia, maximo: 25, disponivel: true })
      pontosObtidos += pontosEconomia
      pontosDisponiveis += 25
    } else {
      criterios.push({ nome: 'Equilíbrio financeiro', pontos: 0, maximo: 30, disponivel: false })
      criterios.push({ nome: 'Capacidade de economia', pontos: 0, maximo: 25, disponivel: false })
    }

    const despesas = transacoesDoMes.filter((transacao) => converterValor(transacao.valor) < 0)
    if (despesas.length > 0) {
      const categorizadas = despesas.filter((transacao) =>
        Boolean(
          (typeof transacao.categoria === 'string' && transacao.categoria.trim()) ||
          (transacao.categoria && typeof transacao.categoria === 'object' && transacao.categoria.nome?.trim()) ||
          transacao.categoriaNome?.trim() || transacao.categoria_nome?.trim() ||
          transacao.categoriaId || transacao.categoria_id
        ),
      ).length
      const pontosControle = 25 * (categorizadas / despesas.length)
      criterios.push({ nome: 'Controle de despesas', pontos: pontosControle, maximo: 25, disponivel: true })
      pontosObtidos += pontosControle
      pontosDisponiveis += 25
    } else {
      criterios.push({ nome: 'Controle de despesas', pontos: 0, maximo: 25, disponivel: false })
    }

    if (!erroMetas && metas.length > 0) {
      const mediaProgresso = metas.reduce((total, meta) => total + percentualMeta(meta), 0) / metas.length
      const pontosPlanejamento = 20 * mediaProgresso
      criterios.push({ nome: 'Planejamento financeiro', pontos: pontosPlanejamento, maximo: 20, disponivel: true })
      pontosObtidos += pontosPlanejamento
      pontosDisponiveis += 20
    } else {
      criterios.push({ nome: 'Planejamento financeiro', pontos: 0, maximo: 20, disponivel: false })
    }

    const nota = temMovimentacoes && pontosDisponiveis > 0
      ? Math.round((pontosObtidos / pontosDisponiveis) * 100)
      : null

    return {
      nota,
      criterios,
      quantidadeDisponivel: criterios.filter((criterio) => criterio.disponivel).length,
    }
  }, [transacoesDoMes, renda, totalSaidas, salarioMensal, metas, erroMetas])

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">
        <header className="mx-auto flex w-full flex-wrap items-center justify-between gap-4 px-5 pb-5 pt-7 sm:px-10 lg:px-12">
          <div>
            <h1 className="text-[36px] font-extrabold leading-tight tracking-[-.7px] sm:text-[44px]">
              Oi, {nome || 'usuário'}!
            </h1>
            <p className="mt-1 text-[16px] text-[#77839e] sm:text-[20px]">
              Vamos cuidar do seu dinheiro sem complicação.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuMesAberto((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-[#e6e8f0] bg-white px-4 py-3 text-[14px] text-[#34415e] shadow-sm sm:px-5 sm:text-[15px]"
              >
                <CalendarDays size={19} />
                {meses[mesSelecionado]} {anoSelecionado}
                <ChevronDown size={13} className="ml-1 text-[#8b96ac]" />
              </button>
              {menuMesAberto && (
                <div className="absolute right-0 top-12 z-40 max-h-64 w-40 overflow-y-auto rounded-xl border border-[#e6e8f0] bg-white p-1.5 shadow-xl">
                  {meses.map((mes, index) => (
                    <button
                      type="button"
                      key={mes}
                      onClick={() => {
                        setMesSelecionado(index)
                        setMenuMesAberto(false)
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                        mesSelecionado === index
                          ? 'bg-violet-50 font-semibold text-violet-700'
                          : 'text-[#52607b] hover:bg-slate-50'
                      }`}
                    >
                      {mes} {anoSelecionado}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="mx-auto w-full space-y-5 px-5 pb-8 sm:px-10 lg:px-12">
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <article className="min-h-[270px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0eaff] text-[#805cf5]">
                  <PiggyBank size={22} />
                </span>
                <h2 className="text-[16px] font-bold">
                  Sua vida financeira
                </h2>
              </div>
              <div className="flex flex-col items-center pt-2">
                {carregandoTransacoes || carregandoRenda || carregandoMetas ? (
                  <div className="flex h-[150px] w-[150px] items-center justify-center rounded-full border-[12px] border-[#e5e7eb]">
                    <span className="text-sm font-medium text-[#8994a9]">Calculando...</span>
                  </div>
                ) : (
                  <div
                    className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full"
                    style={{
                      background: saudeFinanceira.nota === null
                        ? 'conic-gradient(#dfe5e2 0deg 360deg)'
                        : `conic-gradient(#805cf5 ${saudeFinanceira.nota * 3.6}deg, #dfe5e2 ${saudeFinanceira.nota * 3.6}deg 360deg)`,
                    }}
                  >
                    <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-[28px] font-bold text-[#263550]">
                        {saudeFinanceira.nota ?? '—'}
                        <span className="text-[14px] font-medium text-[#9aa5ba]">
                          /100
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                <p className="mt-1 text-[16px] font-bold text-[#263550]">
                  {carregandoTransacoes || carregandoRenda || carregandoMetas
                    ? 'Analisando seus dados...'
                    : saudeFinanceira.nota === null
                      ? 'Vamos começar!'
                      : saudeFinanceira.nota >= 80
                        ? 'Excelente organização!'
                        : saudeFinanceira.nota >= 60
                          ? 'Boa organização!'
                          : saudeFinanceira.nota >= 40
                            ? 'Em desenvolvimento'
                            : 'Precisa de atenção'}
                </p>
                <p className="mt-0.5 text-center text-[13px] text-[#8b96aa]">
                  {carregandoTransacoes || carregandoRenda || carregandoMetas
                    ? 'Consultando informações salvas no banco'
                    : erroTransacoes
                      ? 'Não foi possível consultar suas movimentações.'
                      : saudeFinanceira.nota === null
                        ? 'Adicione lançamentos para calcular sua saúde financeira.'
                        : `Cálculo baseado em ${saudeFinanceira.quantidadeDisponivel} de 4 critérios disponíveis.`}
                </p>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl bg-[#f3f4f6] text-[12px] leading-[18px] text-[#71809b]">
                <button
                  type="button"
                  onClick={() => setDetalhesSaudeAberto((aberto) => !aberto)}
                  aria-expanded={detalhesSaudeAberto}
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-[#7b8495] transition-colors hover:bg-[#eceef2] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  <span className="font-medium">
                    {detalhesSaudeAberto ? 'Ocultar detalhes da pontuação' : 'Ver detalhes da pontuação'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 ${detalhesSaudeAberto ? 'rotate-180' : ''}`}
                  />
                </button>
                {detalhesSaudeAberto && (
                  <div className="space-y-2 border-t border-[#e2e5eb] px-3 py-3 text-[#71809b]">
                    {saudeFinanceira.criterios.map((criterio) => (
                      <div key={criterio.nome} className="flex items-center justify-between gap-2">
                        <span>{criterio.nome}</span>
                        <span className="shrink-0 font-semibold text-[#52607b]">
                          {criterio.disponivel
                            ? `${Math.round(criterio.pontos)}/${criterio.maximo}`
                            : 'Sem dados'}
                        </span>
                      </div>
                    ))}
                    {(erroRenda || erroMetas) && (
                      <p className="border-t border-[#e2e7f0] pt-2 text-[11px] text-[#a06a36]">
                        Alguns dados de renda ou metas não puderam ser consultados. A pontuação considera somente os dados disponíveis.
                      </p>
                    )}
                    {!erroRenda && salarioMensal !== null && (
                      <p className="border-t border-[#e2e7f0] pt-2 text-[11px]">
                        Renda mensal cadastrada confirmada pela API: {moeda(salarioMensal)}.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
            <article className="min-h-[270px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcf5eb] text-[#159967]">
                  <Wallet size={22} />
                </span>
                <h2 className="text-[16px] font-bold">
                  Dinheiro disponível
                </h2>
              </div>
              <p className="mt-4 text-[40px] font-extrabold tracking-[-.5px] text-[#168b55]">
                {carregandoTransacoes ? 'Carregando...' : erroTransacoes ? 'Indisponível' : moeda(disponivel)}
              </p>
              <p className="mt-1 text-[14px] text-[#596783]">
                {carregandoTransacoes ? 'Consultando transações...' : 'Saldo líquido das movimentações do mês'}
              </p>
              <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#e0e5ee]">
                <div
                  className="h-full rounded-full bg-[#41c394]"
                  style={{
                    width: `${renda + totalSaidas > 0 ? (renda / (renda + totalSaidas)) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-[13px] text-[#71809b]">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#21aa76]" />
                  Livre {carregandoTransacoes ? '—' : moeda(disponivel)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#aab4c7]" />
                  Parcelas não disponíveis
                </span>
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-xl bg-[#f5f0ff] px-3 py-2.5 text-[13px] leading-[19px] text-[#8060dc]">
                <Lightbulb size={23} className="shrink-0" />
                <span>
                  {erroTransacoes
                    ? 'Não foi possível carregar suas transações. Verifique sua conexão e tente novamente.'
                    : 'O valor considera as entradas e saídas registradas no mês selecionado.'}
                </span>
              </div>
            </article>
            <article className="min-h-[270px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0eaff] text-[#805cf5]">
                  <BarChart3 size={22} />
                </span>
                <div>
                  <h2 className="text-[16px] font-bold text-[#263550]">Onde você mais gasta</h2>
                  <p className="text-[12px] text-[#8994a9]">Maiores despesas por categoria</p>
                </div>
              </div>

              {carregandoTransacoes || carregandoCategorias ? (
                <div className="mt-8 flex h-32 items-center justify-center text-sm text-[#8994a9]">
                  Analisando suas despesas...
                </div>
              ) : erroTransacoes ? (
                <div className="mt-8 rounded-xl bg-[#f5f6fa] p-4 text-sm text-[#7c879c]">
                  Não foi possível consultar suas movimentações.
                </div>
              ) : maioresCategorias.length === 0 ? (
                <div className="mt-8 rounded-xl bg-[#f5f6fa] p-4 text-sm text-[#7c879c]">
                  Ainda não há despesas registradas no mês selecionado.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {maioresCategorias.map((categoria, indice) => {
                    const percentual = totalDespesasMes > 0
                      ? (categoria.valor / totalDespesasMes) * 100
                      : 0
                    return (
                      <div key={categoria.nome}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                          <span className="min-w-0 truncate font-medium text-[#52607b]">{categoria.nome}</span>
                          <span className="shrink-0 font-semibold text-[#263550]">{moeda(categoria.valor)}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-[#edf0f6]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentual}%`,
                              backgroundColor: ['#805cf5', '#43c98b', '#f4ad55', '#78aaf5'][indice],
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  <div className="border-t border-[#edf0f5] pt-3 text-[12px] text-[#8994a9]">
                    Total de despesas no mês: <span className="font-semibold text-[#52607b]">{moeda(totalDespesasMes)}</span>
                  </div>
                </div>
              )}
              {erroCategorias && !erroTransacoes && maioresCategorias.length > 0 && (
                <p className="mt-2 text-[11px] text-[#a06a36]">
                  Algumas categorias foram identificadas diretamente nos lançamentos; nomes não retornados pela API aparecem como “Sem categoria”.
                </p>
              )}
              <button
                type="button"
                onClick={() => navigate('/lancamentos')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f0eaff] px-3 py-2 text-[13px] font-semibold text-[#7654ed] transition hover:bg-[#e8e0ff]"
              >
                Ver lançamentos <ArrowRight size={14} />
              </button>
            </article>
          </section>
          <section className="rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0eaff] text-[#805cf5]">
                  <Lightbulb size={17} />
                </span>
                <h2 className="text-[16px] font-bold text-[#263550]">Dica da semana</h2>
              </div>
              <span className="flex items-center gap-1 rounded-lg bg-[#f0eaff] px-2.5 py-1.5 text-[12px] font-medium text-[#805cf5]">
                Educação financeira
              </span>
            </div>
            <div className="grid items-center gap-4 sm:grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[140px_minmax(0,1fr)_minmax(220px,300px)]">
              <div className="flex h-[125px] items-center justify-center">
                <img
                  src="/porco-grande.png"
                  alt="Porquinho Finly"
                  className="h-[135px] w-[135px] object-contain drop-shadow-sm"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-bold text-[#263550]">
                  Pequenos gastos também pesam no orçamento
                </p>
                <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#8994a9]">
                  Aquele lanche, assinatura ou compra por impulso pode parecer pouco,
                  mas vários pequenos gastos fazem diferença no fim do mês.
                </p>
              </div>
              <div className="rounded-xl bg-[#f6f2ff] px-4 py-3">
                <p className="text-[12px] font-semibold text-[#805cf5]">Uma dica para hoje</p>
                <p className="mt-1 text-[13px] leading-5 text-[#8068c5]">
                  Antes de comprar algo, espere alguns minutos e pense se realmente precisa daquilo.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/aprender')}
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#7958ed] transition hover:text-[#6846dc]"
                >
                  Ver mais dicas <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </section>
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,.85fr)]">
            <article className="min-h-[185px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0eaff] text-[#805cf5]">
                  <Calculator size={15} />
                </span>
                <div>
                  <h2 className="text-[16px] font-bold">
                    Se eu comprar agora...
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[#8994a9]">
                    Veja como uma compra afeta o seu mês antes de decidir.
                  </p>
                </div>
              </div>
              <div
                className={`mt-4 grid min-w-0 items-stretch gap-3 rounded-xl bg-[#f7f5ff] p-3 sm:p-4 ${
                  saldoSimulado !== null
                    ? 'sm:grid-cols-[minmax(130px,.85fr)_minmax(160px,1fr)_minmax(160px,1fr)_auto]'
                    : 'sm:grid-cols-[minmax(130px,.85fr)_minmax(160px,1fr)_auto]'
                }`}
              >
                <div className="flex min-w-0 flex-col justify-center">
                  <label htmlFor="valor-compra" className="mb-1.5 text-xs font-medium text-[#8994a9]">
                    Compra de
                  </label>
                  <div className="flex h-10 min-w-0 items-center gap-1 rounded-lg border border-[#e7e2fa] bg-white px-3 transition focus-within:border-[#9b83f5]">
                    <span className="text-sm text-[#687590]">R$</span>
                    <input
                      id="valor-compra"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={valorCompra}
                      onChange={(evento) => {
                        setValorCompra(evento.target.value)
                        setSaldoSimulado(null)
                      }}
                      className="w-full min-w-0 bg-transparent text-base font-bold text-[#263550] outline-none"
                    />
                  </div>
                </div>
                <div className="flex min-w-0 flex-col justify-center border-t border-[#e5defb] pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                  <p className="text-xs font-medium text-[#8994a9]">Disponível neste mês</p>
                  <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#168b55]">
                    {carregandoTransacoes ? 'Carregando...' : moeda(disponivel)}
                  </p>
                </div>
                {saldoSimulado !== null && (
                  <div className="flex min-w-0 flex-col justify-center rounded-lg bg-white px-3 py-2.5 ring-1 ring-[#e7e2fa]">
                    <p className="text-xs font-semibold text-[#8994a9]">Saldo projetado</p>
                    <p className={`mt-1 text-2xl font-extrabold tracking-tight ${
                      saldoSimulado >= 0 ? 'text-[#168b55]' : 'text-[#ef5350]'
                    }`}>
                      {moeda(saldoSimulado)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#9aa5ba]">Após essa compra</p>
                  </div>
                )}
                <div className="flex items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={simularCompra}
                    className="flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#7958ed] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6846dc] active:scale-[.98] sm:w-auto"
                  >
                    Simular compra <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
            <article className="min-h-[185px] rounded-[22px] border border-[#e9eaf1] bg-white p-5 shadow-[0_2px_8px_rgba(34,45,80,.025)]">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0eaff] text-[#805cf5]">
                  <BookOpen size={15} />
                </span>
                <h2 className="text-[16px] font-bold">
                  Aprenda em 2 min
                </h2>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-[82px] w-[100px] shrink-0 items-center justify-center rounded-xl bg-[#f0eaff] text-[#8969ef]">
                  <div className="relative">
                    <CreditCard size={39} strokeWidth={1.5} />
                    <span className="absolute -bottom-2 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f0eaff] bg-white text-[14px] font-bold">
                      %
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="rounded bg-[#eee8ff] px-2 py-0.5 text-[8px] text-[#7654ed]">
                    Juros
                  </span>
                  <p className="mt-1 text-[14px] font-bold text-[#263550]">
                    Parcelado sem juros também ocupa seu orçamento.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/aprender')}
                    className="mt-2 text-[13px] text-[#8060dc] underline underline-offset-2"
                  >
                    Ver mais conteúdos
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Ver conteúdo"
                  onClick={() => navigate('/aprender')}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0edff] text-[#7654ed]"
                >
                  <ArrowRight size={19} />
                </button>
              </div>
            </article>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
export function invalidarDashboardCache() {
}
export default Dashboard