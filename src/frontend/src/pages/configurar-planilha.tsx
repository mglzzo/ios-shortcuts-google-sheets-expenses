import {
  Check,
  ChevronRight,
  CircleHelp,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import MainLayout from '../../components/layout/MainLayout'

interface Coluna {
  letra: string
  nome: string
  indice: number
}

interface Campo {
  id: string
  titulo: string
  descricao: string
  obrigatorio: boolean
  cor: string
  fundo: string
  borda: string
}

interface Configuracao {
  separador: string
  formatoData: string
  formatoValor: string
}

interface ConfiguracaoPagamento {
  tipo: 'coluna' | 'fixo'
  coluna?: string
  valor?: string
}

const campos: Campo[] = [
  {
    id: 'valor',
    titulo: 'Valor',
    descricao: 'O valor da transação.',
    obrigatorio: true,
    cor: '#7653f5',
    fundo: '#f0edff',
    borda: '#d8d0ff',
  },
  {
    id: 'data',
    titulo: 'Data',
    descricao: 'A data em que o gasto aconteceu.',
    obrigatorio: true,
    cor: '#7653f5',
    fundo: '#f0edff',
    borda: '#d8d0ff',
  },
  {
    id: 'estabelecimento',
    titulo: 'Estabelecimento',
    descricao: 'O local ou nome do estabelecimento onde você gastou.',
    obrigatorio: true,
    cor: '#7653f5',
    fundo: '#f0edff',
    borda: '#d8d0ff',
  },
  {
    id: 'metodo_pagamento',
    titulo: 'Método de pagamento',
    descricao: 'Escolha uma coluna da planilha ou defina um método para todas as transações.',
    obrigatorio: true,
    cor: '#7653f5',
    fundo: '#f0edff',
    borda: '#d8d0ff',
  },
  {
    id: 'categoria',
    titulo: 'Categoria',
    descricao: 'A categoria associada ao gasto.',
    obrigatorio: false,
    cor: '#7653f5',
    fundo: '#f0edff',
    borda: '#d8d0ff',
  },
  {
    id: 'subcategoria',
    titulo: 'Subcategoria',
    descricao: 'Uma classificação mais específica do gasto.',
    obrigatorio: false,
    cor: '#7653f5',
    fundo: '#f0edff',
    borda: '#d8d0ff',
  },
  {
    id: 'parcela_atual',
    titulo: 'Parcela atual',
    descricao: 'O número da parcela atual.',
    obrigatorio: false,
    cor: '#7653f5',
    fundo: '#f0edff',
    borda: '#d8d0ff',
  },
  {
    id: 'parcela_total',
    titulo: 'Total de parcelas',
    descricao: 'A quantidade total de parcelas.',
    obrigatorio: false,
    cor: '#7653f5',
    fundo: '#f0edff',
    borda: '#d8d0ff',
  },
  {
    id: 'observacao',
    titulo: 'Observação',
    descricao: 'Uma informação adicional sobre a transação.',
    obrigatorio: false,
    cor: '#7653f5',
    fundo: '#f0edff',
    borda: '#d8d0ff',
  },
]

const metodosPagamento = [
  {
    valor: 'CARTAO',
    titulo: 'Cartão',
  },
  {
    valor: 'PIX',
    titulo: 'PIX',
  },
  {
    valor: 'DEBITO',
    titulo: 'Débito',
  },
  {
    valor: 'DINHEIRO',
    titulo: 'Dinheiro',
  },
  {
    valor: 'BOLETO',
    titulo: 'Boleto',
  },
  {
    valor: 'OUTRO',
    titulo: 'Outro',
  },
]

function numeroParaLetra(numero: number) {
  let resultado = ''
  let valor = numero + 1

  while (valor > 0) {
    const resto = (valor - 1) % 26
    resultado = String.fromCharCode(65 + resto) + resultado
    valor = Math.floor((valor - 1) / 26)
  }

  return resultado
}

function formatarValor(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') {
    return ''
  }

  if (valor instanceof Date) {
    return valor.toLocaleDateString('pt-BR')
  }

  if (typeof valor === 'number') {
    return String(valor)
  }

  return String(valor)
}

function ConfigurarPlanilha() {
  const navigate = useNavigate()
  const location = useLocation()

  const arquivo = location.state?.arquivo as File | undefined

  const configuracao = location.state?.configuracao as
    | Configuracao
    | undefined

  const [linhas, setLinhas] = useState<unknown[][]>([])
  const [colunas, setColunas] = useState<Coluna[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [campoAtual, setCampoAtual] = useState(0)
  const [selecionando, setSelecionando] = useState(false)
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({})
  const [configuracaoPagamento, setConfiguracaoPagamento] =
    useState<ConfiguracaoPagamento | null>(null)

  useEffect(() => {
    if (!arquivo) {
      navigate('/conexoes/planilha')
      return
    }

    const arquivoSelecionado = arquivo

    async function lerPlanilha() {
      try {
        setCarregando(true)
        setErro('')

        const extensao =
          arquivoSelecionado.name.split('.').pop()?.toLowerCase()

        let workbook: XLSX.WorkBook

        if (extensao === 'csv') {
          const texto = await arquivoSelecionado.text()

          workbook = XLSX.read(texto, {
            type: 'string',
            FS: configuracao?.separador || ',',
            raw: true,
          })
        } else {
          const buffer = await arquivoSelecionado.arrayBuffer()

          workbook = XLSX.read(buffer, {
            type: 'array',
            cellDates: true,
          })
        }

        const primeiraAba = workbook.SheetNames[0]

        if (!primeiraAba) {
          throw new Error('A planilha não possui nenhuma aba.')
        }

        const worksheet = workbook.Sheets[primeiraAba]

        const dados = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
          header: 1,
          defval: '',
          raw: true,
        })

        if (!dados.length) {
          throw new Error('A planilha não possui dados.')
        }

        const quantidadeColunas = Math.max(
          ...dados.map((linha) => linha.length),
        )

        if (!quantidadeColunas) {
          throw new Error('Não foi possível encontrar colunas.')
        }

        const primeiraLinha = dados[0] || []

        const novasColunas = Array.from(
          { length: quantidadeColunas },
          (_, indice) => {
            const valorCabecalho = primeiraLinha[indice]

            return {
              letra: numeroParaLetra(indice),
              nome:
                valorCabecalho !== undefined &&
                valorCabecalho !== null &&
                String(valorCabecalho).trim() !== ''
                  ? String(valorCabecalho)
                  : `Coluna ${numeroParaLetra(indice)}`,
              indice,
            }
          },
        )

        setColunas(novasColunas)
        setLinhas(dados)
      } catch {
        setErro(
          'Não foi possível ler esta planilha. Verifique se o arquivo possui uma estrutura válida.',
        )
      } finally {
        setCarregando(false)
      }
    }

    lerPlanilha()
  }, [arquivo, configuracao?.separador, navigate])

  const campo = campos[campoAtual]

  const obrigatorios = useMemo(
    () => campos.filter((item) => item.obrigatorio),
    [],
  )

  const metodoPagamentoConcluido =
    Boolean(mapeamento.metodo_pagamento) ||
    Boolean(
      configuracaoPagamento?.tipo === 'fixo' &&
        configuracaoPagamento.valor,
    )

  const camposObrigatoriosConcluidos = obrigatorios.every((item) => {
    if (item.id === 'metodo_pagamento') {
      return metodoPagamentoConcluido
    }

    return Boolean(mapeamento[item.id])
  })

  function colunaSelecionadaPorOutroCampo(letra: string) {
    return Object.entries(mapeamento).some(
      ([campoId, coluna]) =>
        campoId !== campo.id && coluna === letra,
    )
  }

  function selecionarCampo(indice: number) {
    setCampoAtual(indice)
    setSelecionando(false)
  }

  function selecionarColuna(coluna: Coluna) {
    if (!selecionando) return

    if (colunaSelecionadaPorOutroCampo(coluna.letra)) {
      return
    }

    if (campo.id === 'metodo_pagamento') {
      setConfiguracaoPagamento({
        tipo: 'coluna',
        coluna: coluna.letra,
      })
    }

    setMapeamento((atual) => ({
      ...atual,
      [campo.id]: coluna.letra,
    }))

    setSelecionando(false)

    if (campoAtual < campos.length - 1) {
      setTimeout(() => {
        setCampoAtual((atual) => atual + 1)
      }, 250)
    }
  }

  function selecionarMetodoFixo(valor: string) {
    setConfiguracaoPagamento({
      tipo: 'fixo',
      valor,
    })

    setMapeamento((atual) => {
      const novo = { ...atual }
      delete novo.metodo_pagamento
      return novo
    })

    setSelecionando(false)

    if (campoAtual < campos.length - 1) {
      setTimeout(() => {
        setCampoAtual((atual) => atual + 1)
      }, 250)
    }
  }

  function alterarMetodoPagamento() {
    setConfiguracaoPagamento(null)

    setMapeamento((atual) => {
      const novo = { ...atual }
      delete novo.metodo_pagamento
      return novo
    })

    setSelecionando(false)
  }

  function pularCampoOpcional() {
    if (campo.obrigatorio) return

    setMapeamento((atual) => {
      const novo = { ...atual }
      delete novo[campo.id]
      return novo
    })

    setSelecionando(false)

    if (campoAtual < campos.length - 1) {
      setCampoAtual((atual) => atual + 1)
    }
  }

  function voltarParaPlanilha() {
    navigate('/conexoes/planilha/preparar', {
      state: {
        arquivo,
        configuracao,
      },
    })
  }

  function continuar() {
    if (!camposObrigatoriosConcluidos || !arquivo) {
      return
    }

    navigate('/conexoes/planilha/preview', {
      state: {
        arquivo,
        configuracao,
        mapeamento,
        configuracaoPagamento,
      },
    })
  }

  const camposConcluidos = Object.keys(mapeamento).length

  const pagamentoConcluido =
    configuracaoPagamento?.tipo === 'fixo' &&
    configuracaoPagamento.valor

  const totalConcluidos =
    camposConcluidos + (pagamentoConcluido ? 1 : 0)

  const progresso = Math.round(
    (totalConcluidos / campos.length) * 100,
  )

  const campoMetodoPagamento = campo.id === 'metodo_pagamento'

  const colunaMetodoPagamento =
    configuracaoPagamento?.tipo === 'coluna'
      ? configuracaoPagamento.coluna
      : undefined

  const valorMetodoPagamento =
    configuracaoPagamento?.tipo === 'fixo'
      ? configuracaoPagamento.valor
      : undefined

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">
        <main className="w-full max-w-none px-5 pb-8 pt-7 sm:px-10 lg:px-12">
  

        <div className="mb-8 flex items-start gap-4">


          <div>


            <h1 className="mt-1 text-[40px] font-extrabold leading-tight tracking-[-.7px] sm:text-[44px]">
              Vamos configurar sua planilha
            </h1>

            <p className="mt-2 max-w-3xl text-[16px] leading-6 text-[#77839e] sm:text-[18px]">
              Clique na coluna correspondente a cada informação. Você não
              precisa alterar sua planilha.
            </p>
          </div>
        </div>

        {carregando && (
          <div className="rounded-[24px] border border-[#e6e8f0] bg-white p-10 text-center">
            <p className="text-sm text-[#77839e]">
              Lendo sua planilha...
            </p>
          </div>
        )}

        {!carregando && erro && (
          <div className="rounded-[24px] border border-[#e5d4d4] bg-white p-8">
            <p className="text-sm font-semibold text-[#7d3838]">
              Não foi possível abrir a planilha
            </p>

            <p className="mt-2 text-sm text-[#77839e]">
              {erro}
            </p>

            <button
              type="button"
              onClick={() => navigate('/conexoes/planilha')}
              className="mt-5 rounded-xl bg-[#17213b] px-5 py-3 text-sm font-semibold text-white"
            >
              Escolher outra planilha
            </button>
          </div>
        )}

        {!carregando && !erro && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="min-w-0 rounded-[24px] border border-[#e6e8f0] bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8994aa]">
                    Visualização da sua planilha:
                  </p>

                  <p className="text-sm font-semibold">
                    {arquivo?.name || 'Planilha selecionada'}
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-xs text-[#8994aa] sm:flex">
                  <CircleHelp size={14} />
                  Clique em uma coluna para selecioná-la
                </div>
              </div>

              <div className="w-fit max-w-full overflow-hidden rounded-xl border border-[#e6e8f0]">
                <div className="max-h-[620px] max-w-full overflow-auto">
                  <div className="w-fit min-w-max">
                    <div className="sticky top-0 z-20 flex w-fit border-b border-[#e6e8f0] bg-[#f8f9fc]">
                      <div className="sticky left-0 z-30 flex h-8 w-10 shrink-0 items-center justify-center border-r border-[#e6e8f0] bg-[#f8f9fc] text-[10px] text-[#8994aa]" />

                      {colunas.map((coluna) => {
                        const campoSelecionado = campos.find(
                          (item) =>
                            mapeamento[item.id] === coluna.letra,
                        )

                        const podeSelecionar =
                          selecionando &&
                          !colunaSelecionadaPorOutroCampo(
                            coluna.letra,
                          )

                        return (
                          <button
                            key={coluna.letra}
                            type="button"
                            onClick={() => selecionarColuna(coluna)}
                            disabled={
                              !selecionando ||
                              colunaSelecionadaPorOutroCampo(
                                coluna.letra,
                              )
                            }
                            className={`relative flex h-8 w-[150px] shrink-0 items-center justify-center border-r border-[#e6e8f0] text-[11px] font-medium transition ${
                              campoSelecionado
                                ? 'text-[#17213b]'
                                : podeSelecionar
                                  ? 'cursor-pointer bg-white text-[#53617b] hover:bg-[#7653f5]'
                                  : 'text-[#8994aa]'
                            }`}
                            style={
                              campoSelecionado
                                ? {
                                    backgroundColor: '#eee9ff',
                                    boxShadow:
                                      'inset 0 0 0 1px #7653f5',
                                  }
                                : undefined
                            }
                          >
                            {coluna.letra}

                            {campoSelecionado && (
                              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[#17213b]">
                                <Check size={10} />
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {linhas.map((linha, indiceLinha) => (
                      <div
                        key={indiceLinha}
                        className="flex border-b border-[#e6e8f0] last:border-b-0"
                      >
                        <div className="sticky left-0 z-10 flex h-11 w-10 shrink-0 items-center justify-center border-r border-[#e6e8f0] bg-[#f8f9fc] text-[10px] text-[#9aa5b8]">
                          {indiceLinha + 1}
                        </div>

                        {colunas.map((coluna) => {
                          const campoSelecionado = campos.find(
                            (item) =>
                              mapeamento[item.id] === coluna.letra,
                          )

                          const valor =
                            linha[coluna.indice] ?? ''

                          return (
                            <button
                              key={`${indiceLinha}-${coluna.letra}`}
                              type="button"
                              onClick={() =>
                                selecionarColuna(coluna)
                              }
                              disabled={
                                !selecionando ||
                                colunaSelecionadaPorOutroCampo(
                                  coluna.letra,
                                )
                              }
                              className={`flex h-11 w-[150px] shrink-0 items-center overflow-hidden border-r border-[#e6e8f0] px-3 text-left text-xs transition ${
                                campoSelecionado
                                  ? 'font-medium text-[#17213b]'
                                  : selecionando &&
                                      !colunaSelecionadaPorOutroCampo(
                                        coluna.letra,
                                      )
                                    ? 'cursor-pointer hover:bg-[#f0edff]'
                                    : ''
                              }`}
                              style={
                                campoSelecionado
                                  ? {
                                      backgroundColor: '#eee9ff',
                                      boxShadow:
                                        'inset 0 0 0 1px #7653f5',
                                    }
                                  : undefined
                              }
                            >
                              <span className="truncate">
                                {formatarValor(valor)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-[#9aa5b8]">
                Mostrando {Math.max(linhas.length - 1, 0)} linhas da sua
                planilha.
              </p>
            </section>

            <aside className="h-fit rounded-[24px] border border-[#e6e8f0] bg-white p-5 sm:p-6 xl:sticky xl:top-5">
              <div
                className="rounded-2xl p-5 transition-all"
                style={{
                  backgroundColor: campo.fundo,
                  border: `1px solid ${campo.borda}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: campo.cor }}
                  >
                    {campoAtual + 1}
                  </div>

                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: campo.cor }}
                    >
                      {campo.obrigatorio
                        ? 'Obrigatório'
                        : 'Opcional'}
                    </p>

                    <h2 className="mt-0.5 text-xl font-semibold">
                      Onde fica o {campo.titulo.toLowerCase()}?
                    </h2>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#53617b]">
                  {campo.descricao}
                </p>

                {campoMetodoPagamento ? (
                  <>
                    <div className="mt-5 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setConfiguracaoPagamento(null)
                          setSelecionando(true)
                        }}
                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold text-white transition-colors duration-200 hover:border-[#6543e8] hover:bg-[#6543e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7653f5] focus-visible:ring-offset-2"
                        style={{
                          borderColor: '#7653f5',
                          backgroundColor: '#7653f5',
                        }}
                      >
                        <span>Usar uma coluna da planilha</span>
                        <ChevronRight size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConfiguracaoPagamento({
                            tipo: 'fixo',
                            valor: '',
                          })
                          setMapeamento((atual) => {
                            const novo = { ...atual }
                            delete novo.metodo_pagamento
                            return novo
                          })
                          setSelecionando(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                          configuracaoPagamento?.tipo === 'fixo'
                            ? 'font-semibold text-[#17213b]'
                            : 'bg-white text-[#53617b]'
                        }`}
                        style={{
                          borderColor:
                            configuracaoPagamento?.tipo === 'fixo'
                              ? '#7653f5'
                              : '#d8d0ff',
                          backgroundColor:
                            configuracaoPagamento?.tipo === 'fixo'
                              ? '#7653f5'
                              : '#ffffff',
                          color:
                            configuracaoPagamento?.tipo === 'fixo'
                              ? '#ffffff'
                              : '#53617b',
                        }}
                        onMouseEnter={(event) => {
                          if (configuracaoPagamento?.tipo !== 'fixo') {
                            event.currentTarget.style.borderColor = '#7653f5'
                            event.currentTarget.style.backgroundColor = '#f0edff'
                          }
                        }}
                        onMouseLeave={(event) => {
                          if (configuracaoPagamento?.tipo !== 'fixo') {
                            event.currentTarget.style.borderColor = '#d8d0ff'
                            event.currentTarget.style.backgroundColor = '#ffffff'
                          }
                        }}
                      >
                        <span>Usar um método para todas</span>

                        {configuracaoPagamento?.tipo === 'fixo' && (
                          <Check size={16} />
                        )}
                      </button>
                    </div>

                    {configuracaoPagamento?.tipo === 'fixo' ? (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {metodosPagamento.map((metodo) => {
                          const selecionado =
                            valorMetodoPagamento === metodo.valor

                          return (
                            <button
                              key={metodo.valor}
                              type="button"
                              onClick={() =>
                                selecionarMetodoFixo(
                                  metodo.valor,
                                )
                              }
                              className={`rounded-xl border px-3 py-3 text-xs font-medium transition ${
                                selecionado
                                  ? 'text-[#17213b]'
                                  : 'text-[#53617b]'
                              }`}
                              style={{
                                borderColor: selecionado ? '#7653f5' : '#d8d0ff',
                                backgroundColor: selecionado ? '#7653f5' : '#f0edff',
                              }}
                              onMouseEnter={(event) => {
                                if (!selecionado) {
                                  event.currentTarget.style.borderColor = '#7653f5'
                                  event.currentTarget.style.backgroundColor = '#eee9ff'
                                }
                              }}
                              onMouseLeave={(event) => {
                                if (!selecionado) {
                                  event.currentTarget.style.borderColor = '#d8d0ff'
                                  event.currentTarget.style.backgroundColor = '#f0edff'
                                }
                              }}
                            >
                              {metodo.titulo}
                            </button>
                          )
                        })}
                      </div>
                    ) : configuracaoPagamento?.tipo === 'coluna' ? (
                      <div className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-center text-xs font-semibold text-[#7653f5]">
                        Clique na coluna da planilha
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-xs leading-5 text-[#77839e]">
                        Se sua planilha não possui uma coluna com o
                        método de pagamento, você pode escolher um
                        método fixo para todas as transações.
                      </div>
                    )}

                    {configuracaoPagamento && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">
                        <span className="text-xs text-[#77839e]">
                          Configuração
                        </span>

                        <span className="text-sm font-bold text-[#7653f5]">
                          {colunaMetodoPagamento ||
                            metodosPagamento.find(
                              (item) =>
                                item.valor === valorMetodoPagamento,
                            )?.titulo}
                        </span>
                      </div>
                    )}

                    {configuracaoPagamento && (
                      <button
                        type="button"
                        onClick={alterarMetodoPagamento}
                        className="mt-3 w-full rounded-xl px-4 py-2.5 text-xs font-medium text-[#77839e] transition hover:bg-white/70 hover:text-[#17213b]"
                      >
                        Alterar método de pagamento
                      </button>
                    )}
                  </>
                ) : !selecionando ? (
                  <button
                    type="button"
                    onClick={() => setSelecionando(true)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: campo.cor }}
                  >
                    {mapeamento[campo.id]
                      ? `Alterar coluna ${mapeamento[campo.id]}`
                      : 'Selecionar coluna'}

                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <div
                    className="mt-5 rounded-xl px-4 py-3 text-center text-xs font-semibold"
                    style={{
                      backgroundColor: campo.cor,
                      color: '#ffffff',
                    }}
                  >
                    Clique na coluna da planilha
                  </div>
                )}

                {!campoMetodoPagamento &&
                  mapeamento[campo.id] && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">
                      <span className="text-xs text-[#77839e]">
                        Coluna selecionada
                      </span>

                      <span
                        className="text-sm font-bold"
                        style={{ color: campo.cor }}
                      >
                        {mapeamento[campo.id]}
                      </span>
                    </div>
                  )}

                {!campo.obrigatorio && (
                  <button
                    type="button"
                    onClick={pularCampoOpcional}
                    className="mt-3 w-full rounded-xl px-4 py-2.5 text-xs font-medium text-[#77839e] transition hover:bg-white/70 hover:text-[#17213b]"
                  >
                    Não tenho esta informação
                  </button>
                )}
              </div>

              <div className="mt-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8994aa]">
                  Progresso
                </p>

                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#eef0f6]">
                  <div
                    className="h-full rounded-full bg-[#7653f5] transition-all"
                    style={{ width: `${progresso}%` }}
                  />
                </div>

                <div className="space-y-2">
                  {campos.map((item, indice) => {
                    const concluido =
                      item.id === 'metodo_pagamento'
                        ? metodoPagamentoConcluido
                        : Boolean(mapeamento[item.id])

                    const atual = indice === campoAtual

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selecionarCampo(indice)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          atual
                            ? 'bg-[#f0edff]'
                            : 'hover:bg-[#f5f6fb]'
                        }`}
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: concluido
                              ? item.cor
                              : atual
                                ? item.fundo
                                : '#eef0f6',
                            color: concluido
                              ? '#ffffff'
                              : atual
                                ? item.cor
                                : '#9aa5b8',
                            border: atual
                              ? `1px solid ${item.borda}`
                              : 'none',
                          }}
                        >
                          {concluido ? (
                            <Check size={13} />
                          ) : (
                            indice + 1
                          )}
                        </div>

                        <span
                          className={`text-xs ${
                            atual
                              ? 'font-semibold text-[#17213b]'
                              : 'text-[#77839e]'
                          }`}
                        >
                          {item.titulo}
                        </span>

                        {!item.obrigatorio && (
                          <span className="ml-auto text-[9px] text-[#9aa5b8]">
                            opcional
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {campoAtual === campos.length - 1 &&
                camposObrigatoriosConcluidos && (
                  <button
                    type="button"
                    onClick={continuar}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17213b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6543e8]"
                  >
                    Ver prévia
                    <ChevronRight size={16} />
                  </button>
                )}

              {!camposObrigatoriosConcluidos &&
                campoAtual >= obrigatorios.length && (
                  <div className="mt-5 rounded-xl bg-[#f5f6fb] px-4 py-3 text-xs leading-5 text-[#77839e]">
                    Primeiro vamos terminar os campos obrigatórios.
                    Depois você poderá configurar os opcionais.
                  </div>
                )}
            </aside>
          </div>
        )}
      </main>
      </div>
    </MainLayout>
  )
}

export default ConfigurarPlanilha