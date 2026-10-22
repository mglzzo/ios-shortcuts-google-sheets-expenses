import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleHelp,
  FileSpreadsheet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'

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
    cor: '#9aae35',
    fundo: '#f4f8dc',
    borda: '#cfdc8a',
  },
  {
    id: 'data',
    titulo: 'Data',
    descricao: 'A data em que o gasto aconteceu.',
    obrigatorio: true,
    cor: '#6f8f82',
    fundo: '#edf3ef',
    borda: '#b9cbc2',
  },
  {
    id: 'estabelecimento',
    titulo: 'Estabelecimento',
    descricao: 'O local ou nome do estabelecimento onde você gastou.',
    obrigatorio: true,
    cor: '#19a657',
    fundo: '#edf8f0',
    borda: '#a8d5b8',
  },
  {
    id: 'metodo_pagamento',
    titulo: 'Método de pagamento',
    descricao: 'Escolha uma coluna da planilha ou defina um método para todas as transações.',
    obrigatorio: true,
    cor: '#8a8063',
    fundo: '#f5f3ea',
    borda: '#d6d0b8',
  },
  {
    id: 'categoria',
    titulo: 'Categoria',
    descricao: 'A categoria associada ao gasto.',
    obrigatorio: false,
    cor: '#7f8d55',
    fundo: '#f1f4e5',
    borda: '#c8d29f',
  },
  {
    id: 'subcategoria',
    titulo: 'Subcategoria',
    descricao: 'Uma classificação mais específica do gasto.',
    obrigatorio: false,
    cor: '#71847b',
    fundo: '#eef2ef',
    borda: '#c2cec7',
  },
  {
    id: 'parcela_atual',
    titulo: 'Parcela atual',
    descricao: 'O número da parcela atual.',
    obrigatorio: false,
    cor: '#527b70',
    fundo: '#edf4f1',
    borda: '#b4cbc2',
  },
  {
    id: 'parcela_total',
    titulo: 'Total de parcelas',
    descricao: 'A quantidade total de parcelas.',
    obrigatorio: false,
    cor: '#667b72',
    fundo: '#eef2ef',
    borda: '#bcc8c2',
  },
  {
    id: 'observacao',
    titulo: 'Observação',
    descricao: 'Uma informação adicional sobre a transação.',
    obrigatorio: false,
    cor: '#68736d',
    fundo: '#f2f3f0',
    borda: '#d2d6d1',
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
    <div className="min-h-screen bg-[#f7f7f0] text-[#10231c]">
      <main className="mx-auto max-w-[1450px] px-5 py-7 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={voltarParaPlanilha}
          className="mb-7 flex items-center gap-2 text-sm text-[#68736d] transition hover:text-[#10231c]"
        >
          <ArrowLeft size={16} />
          Voltar para a preparação
        </button>

        <div className="mb-7 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d8ff3e] text-[#10231c]">
            <FileSpreadsheet size={21} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8983]">
              Conexões · Planilha
            </p>

            <h1 className="mt-1 text-[30px] font-normal tracking-[-0.04em] sm:text-[38px]">
              Vamos configurar sua planilha
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68736d]">
              Clique na coluna correspondente a cada informação. Você não
              precisa alterar sua planilha.
            </p>
          </div>
        </div>

        {carregando && (
          <div className="rounded-[24px] border border-[#dfe3dc] bg-white p-10 text-center">
            <p className="text-sm text-[#68736d]">
              Lendo sua planilha...
            </p>
          </div>
        )}

        {!carregando && erro && (
          <div className="rounded-[24px] border border-[#e5d4d4] bg-white p-8">
            <p className="text-sm font-semibold text-[#7d3838]">
              Não foi possível abrir a planilha
            </p>

            <p className="mt-2 text-sm text-[#68736d]">
              {erro}
            </p>

            <button
              type="button"
              onClick={() => navigate('/conexoes/planilha')}
              className="mt-5 rounded-xl bg-[#10231c] px-5 py-3 text-sm font-semibold text-white"
            >
              Escolher outra planilha
            </button>
          </div>
        )}

        {!carregando && !erro && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="min-w-0 rounded-[24px] border border-[#dfe3dc] bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d8983]">
                    Visualização da sua planilha:
                  </p>

                  <p className="text-sm font-semibold">
                    {arquivo?.name || 'Planilha selecionada'}
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-xs text-[#7d8983] sm:flex">
                  <CircleHelp size={14} />
                  Clique em uma coluna para selecioná-la
                </div>
              </div>

              <div className="w-fit max-w-full overflow-hidden rounded-xl border border-[#cfd4ce]">
                <div className="max-h-[620px] max-w-full overflow-auto">
                  <div className="w-fit min-w-max">
                    <div className="sticky top-0 z-20 flex w-fit border-b border-[#cfd4ce] bg-[#f3f4f1]">
                      <div className="sticky left-0 z-30 flex h-8 w-10 shrink-0 items-center justify-center border-r border-[#cfd4ce] bg-[#f3f4f1] text-[10px] text-[#7d8983]" />

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
                            className={`relative flex h-8 w-[150px] shrink-0 items-center justify-center border-r border-[#cfd4ce] text-[11px] font-medium transition ${
                              campoSelecionado
                                ? 'text-[#10231c]'
                                : podeSelecionar
                                  ? 'cursor-pointer bg-white text-[#526159] hover:bg-[#d8ff3e]'
                                  : 'text-[#7d8983]'
                            }`}
                            style={
                              campoSelecionado
                                ? {
                                    backgroundColor: '#eef7d2',
                                    boxShadow:
                                      'inset 0 0 0 1px #b8d52e',
                                  }
                                : undefined
                            }
                          >
                            {coluna.letra}

                            {campoSelecionado && (
                              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[#10231c]">
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
                        className="flex border-b border-[#e2e5e0] last:border-b-0"
                      >
                        <div className="sticky left-0 z-10 flex h-11 w-10 shrink-0 items-center justify-center border-r border-[#cfd4ce] bg-[#f7f8f5] text-[10px] text-[#8a958f]">
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
                              className={`flex h-11 w-[150px] shrink-0 items-center overflow-hidden border-r border-[#e2e5e0] px-3 text-left text-xs transition ${
                                campoSelecionado
                                  ? 'font-medium text-[#10231c]'
                                  : selecionando &&
                                      !colunaSelecionadaPorOutroCampo(
                                        coluna.letra,
                                      )
                                    ? 'cursor-pointer hover:bg-[#f5fbdc]'
                                    : ''
                              }`}
                              style={
                                campoSelecionado
                                  ? {
                                      backgroundColor: '#eef7d2',
                                      boxShadow:
                                        'inset 0 0 0 1px #b8d52e',
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

              <p className="mt-3 text-[11px] text-[#8a958f]">
                Mostrando {Math.max(linhas.length - 1, 0)} linhas da sua
                planilha.
              </p>
            </section>

            <aside className="h-fit rounded-[24px] border border-[#dfe3dc] bg-white p-5 sm:p-6 xl:sticky xl:top-5">
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

                <p className="mt-4 text-sm leading-6 text-[#526159]">
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
                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold text-white transition-colors duration-200 hover:border-[#756b52] hover:bg-[#756b52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a8063] focus-visible:ring-offset-2"
                        style={{
                          borderColor: '#8a8063',
                          backgroundColor: '#8a8063',
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
                            ? 'font-semibold text-[#10231c]'
                            : 'bg-white text-[#526159]'
                        }`}
                        style={{
                          borderColor:
                            configuracaoPagamento?.tipo === 'fixo'
                              ? '#8a8063'
                              : '#d8cfb3',
                          backgroundColor:
                            configuracaoPagamento?.tipo === 'fixo'
                              ? '#8a8063'
                              : '#ffffff',
                          color:
                            configuracaoPagamento?.tipo === 'fixo'
                              ? '#ffffff'
                              : '#526159',
                        }}
                        onMouseEnter={(event) => {
                          if (configuracaoPagamento?.tipo !== 'fixo') {
                            event.currentTarget.style.borderColor = '#8a8063'
                            event.currentTarget.style.backgroundColor = '#f3f0e5'
                          }
                        }}
                        onMouseLeave={(event) => {
                          if (configuracaoPagamento?.tipo !== 'fixo') {
                            event.currentTarget.style.borderColor = '#d8cfb3'
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
                                  ? 'text-[#10231c]'
                                  : 'text-[#526159]'
                              }`}
                              style={{
                                borderColor: selecionado ? '#9aae35' : '#cfdc8a',
                                backgroundColor: selecionado ? '#d8ff3e' : '#f8faed',
                              }}
                              onMouseEnter={(event) => {
                                if (!selecionado) {
                                  event.currentTarget.style.borderColor = '#9aae35'
                                  event.currentTarget.style.backgroundColor = '#eaf4c5'
                                }
                              }}
                              onMouseLeave={(event) => {
                                if (!selecionado) {
                                  event.currentTarget.style.borderColor = '#cfdc8a'
                                  event.currentTarget.style.backgroundColor = '#f8faed'
                                }
                              }}
                            >
                              {metodo.titulo}
                            </button>
                          )
                        })}
                      </div>
                    ) : configuracaoPagamento?.tipo === 'coluna' ? (
                      <div className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-center text-xs font-semibold text-[#8a8063]">
                        Clique na coluna da planilha
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-xs leading-5 text-[#68736d]">
                        Se sua planilha não possui uma coluna com o
                        método de pagamento, você pode escolher um
                        método fixo para todas as transações.
                      </div>
                    )}

                    {configuracaoPagamento && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">
                        <span className="text-xs text-[#68736d]">
                          Configuração
                        </span>

                        <span className="text-sm font-bold text-[#8a8063]">
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
                        className="mt-3 w-full rounded-xl px-4 py-2.5 text-xs font-medium text-[#68736d] transition hover:bg-white/70 hover:text-[#10231c]"
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
                      <span className="text-xs text-[#68736d]">
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
                    className="mt-3 w-full rounded-xl px-4 py-2.5 text-xs font-medium text-[#68736d] transition hover:bg-white/70 hover:text-[#10231c]"
                  >
                    Não tenho esta informação
                  </button>
                )}
              </div>

              <div className="mt-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d8983]">
                  Progresso
                </p>

                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#edf0ea]">
                  <div
                    className="h-full rounded-full bg-[#9aae35] transition-all"
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
                            ? 'bg-[#f5f6f2]'
                            : 'hover:bg-[#f7f8f4]'
                        }`}
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: concluido
                              ? item.cor
                              : atual
                                ? item.fundo
                                : '#eef0eb',
                            color: concluido
                              ? '#ffffff'
                              : atual
                                ? item.cor
                                : '#8a958f',
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
                              ? 'font-semibold text-[#10231c]'
                              : 'text-[#68736d]'
                          }`}
                        >
                          {item.titulo}
                        </span>

                        {!item.obrigatorio && (
                          <span className="ml-auto text-[9px] text-[#9aa29d]">
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
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#10231c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18372b]"
                  >
                    Ver prévia
                    <ChevronRight size={16} />
                  </button>
                )}

              {!camposObrigatoriosConcluidos &&
                campoAtual >= obrigatorios.length && (
                  <div className="mt-5 rounded-xl bg-[#f7f7f0] px-4 py-3 text-xs leading-5 text-[#68736d]">
                    Primeiro vamos terminar os campos obrigatórios.
                    Depois você poderá configurar os opcionais.
                  </div>
                )}
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

export default ConfigurarPlanilha