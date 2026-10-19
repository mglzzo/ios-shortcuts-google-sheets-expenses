import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'

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

interface LinhaPreview {
  data: string
  estabelecimento: string
  valor: string
  metodoPagamento: string
  categoria: string
  subcategoria: string
  parcelaAtual: string
  parcelaTotal: string
  observacao: string
}

const categorias = [
  { id: 1, nome: 'Mercado' },
  { id: 2, nome: 'Lazer' },
  { id: 3, nome: 'Transporte' },
  { id: 4, nome: 'Saúde' },
  { id: 5, nome: 'Educação' },
  { id: 6, nome: 'Vestuário' },
  { id: 7, nome: 'Eletrônicos' },
  { id: 8, nome: 'Contas/Utilidades' },
  { id: 9, nome: 'Moradia' },
  { id: 10, nome: 'Assinaturas' },
  { id: 11, nome: 'Outros' },
  { id: 23, nome: 'Transferências' },
  { id: 24, nome: 'Empréstimos' },
  { id: 25, nome: 'Investimentos' },
]

function formatarData(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') {
    return ''
  }

  if (valor instanceof Date) {
    const dia = String(valor.getDate()).padStart(2, '0')
    const mes = String(valor.getMonth() + 1).padStart(2, '0')
    const ano = valor.getFullYear()

    return `${dia}/${mes}/${ano}`
  }

  const texto = String(valor).trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split('-')
    return `${dia}/${mes}/${ano}`
  }

  return texto
}

function formatarValor(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') {
    return ''
  }

  const texto = String(valor).trim()

  const normalizado = texto
    .replace(/\./g, '')
    .replace(',', '.')

  const numero = Number(normalizado)

  if (!Number.isNaN(numero)) {
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return texto
}

function obterValor(
  linha: unknown[],
  letra: string | undefined,
) {
  if (!letra) {
    return ''
  }

  let valor = 0

  for (const caractere of letra) {
    valor =
      valor * 26 +
      caractere.charCodeAt(0) -
      64
  }

  const indice = valor - 1

  return linha[indice] ?? ''
}

function PreviewPlanilha() {
  const navigate = useNavigate()
  const location = useLocation()

  const arquivoState = location.state?.arquivo as
    | File
    | undefined

  const configuracao = location.state?.configuracao as
    | Configuracao
    | undefined

  const mapeamento =
    (location.state?.mapeamento as Record<string, string>) || {}

  const configuracaoPagamento =
    (location.state?.configuracaoPagamento as
      | ConfiguracaoPagamento
      | undefined) || null

  const [linhas, setLinhas] = useState<LinhaPreview[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!arquivoState) {
      navigate('/conexoes/planilha')
      return
    }

    const arquivoSelecionado = arquivoState

    async function prepararPreview() {
      try {
        setCarregando(true)
        setErro('')

        const extensao =
          arquivoSelecionado.name
            .split('.')
            .pop()
            ?.toLowerCase()

        let workbook: XLSX.WorkBook

        if (extensao === 'csv') {
          const texto = await arquivoSelecionado.text()

          workbook = XLSX.read(texto, {
            type: 'string',
            FS: configuracao?.separador || ',',
            raw: true,
          })
        } else {
          const buffer =
            await arquivoSelecionado.arrayBuffer()

          workbook = XLSX.read(buffer, {
            type: 'array',
            cellDates: true,
          })
        }

        const primeiraAba = workbook.SheetNames[0]

        if (!primeiraAba) {
          throw new Error(
            'A planilha não possui nenhuma aba.',
          )
        }

        const worksheet = workbook.Sheets[primeiraAba]

        const dados =
          XLSX.utils.sheet_to_json<unknown[]>(
            worksheet,
            {
              header: 1,
              defval: '',
              raw: true,
            },
          )

        if (dados.length < 2) {
          throw new Error(
            'A planilha precisa possuir pelo menos uma linha de dados.',
          )
        }

        const dadosSemCabecalho = dados.slice(1)

        const resultado: LinhaPreview[] =
          dadosSemCabecalho
            .filter((linha) =>
              linha.some(
                (valor) =>
                  valor !== null &&
                  valor !== undefined &&
                  String(valor).trim() !== '',
              ),
            )
            .map((linha) => {
              const categoria = obterValor(
                linha,
                mapeamento.categoria,
              )

              let metodoPagamento = ''

              if (
                configuracaoPagamento?.tipo ===
                'fixo'
              ) {
                metodoPagamento =
                  configuracaoPagamento.valor || ''
              } else {
                metodoPagamento = String(
                  obterValor(
                    linha,
                    configuracaoPagamento?.coluna ||
                      mapeamento.metodo_pagamento,
                  ),
                )
              }

              return {
                data: formatarData(
                  obterValor(
                    linha,
                    mapeamento.data,
                  ),
                ),
                estabelecimento: String(
                  obterValor(
                    linha,
                    mapeamento.estabelecimento,
                  ),
                ),
                valor: formatarValor(
                  obterValor(
                    linha,
                    mapeamento.valor,
                  ),
                ),
                metodoPagamento,
                categoria: String(categoria),
                subcategoria: String(
                  obterValor(
                    linha,
                    mapeamento.subcategoria,
                  ),
                ),
                parcelaAtual: String(
                  obterValor(
                    linha,
                    mapeamento.parcela_atual,
                  ),
                ),
                parcelaTotal: String(
                  obterValor(
                    linha,
                    mapeamento.parcela_total,
                  ),
                ),
                observacao: String(
                  obterValor(
                    linha,
                    mapeamento.observacao,
                  ),
                ),
              }
            })

        setLinhas(resultado)
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível preparar a prévia.',
        )
      } finally {
        setCarregando(false)
      }
    }

    prepararPreview()
  }, [
    arquivoState,
    configuracao?.separador,
    configuracaoPagamento,
    mapeamento,
    navigate,
  ])

  const total = linhas.length

  const categoriasEncontradas = useMemo(() => {
    return linhas
      .map((linha) => linha.categoria.trim())
      .filter(Boolean)
      .filter(
        (categoria, indice, lista) =>
          lista.indexOf(categoria) === indice,
      )
  }, [linhas])

  function voltar() {
    navigate('/conexoes/planilha/configurar', {
      state: {
        arquivo: arquivoState,
        configuracao,
        mapeamento,
        configuracaoPagamento,
      },
    })
  }

  function continuar() {
    navigate('/conexoes/planilha/confirmar', {
      state: {
        arquivo: arquivoState,
        configuracao,
        mapeamento,
        configuracaoPagamento,
        linhas,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#f7f7f0] text-[#10231c]">
      <main className="mx-auto max-w-[1450px] px-5 py-7 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={voltar}
          className="mb-7 flex items-center gap-2 text-sm text-[#68736d] transition hover:text-[#10231c]"
        >
          <ArrowLeft size={16} />
          Voltar para configuração
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
              Confira antes de importar
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68736d]">
              Confira como os dados da sua planilha serão
              interpretados antes de enviá-los para sua
              conta.
            </p>
          </div>
        </div>

        {carregando && (
          <div className="rounded-[24px] border border-[#dfe3dc] bg-white p-10 text-center">
            <p className="text-sm text-[#68736d]">
              Preparando sua prévia...
            </p>
          </div>
        )}

        {!carregando && erro && (
          <div className="rounded-[24px] border border-[#e5d4d4] bg-white p-8">
            <p className="text-sm font-semibold text-[#7d3838]">
              Não foi possível preparar a prévia
            </p>

            <p className="mt-2 text-sm text-[#68736d]">
              {erro}
            </p>

            <button
              type="button"
              onClick={voltar}
              className="mt-5 rounded-xl bg-[#10231c] px-5 py-3 text-sm font-semibold text-white"
            >
              Voltar para configuração
            </button>
          </div>
        )}

        {!carregando && !erro && (
          <>
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-[22px] border border-[#dfe3dc] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7d2] text-[#687d25]">
                    <FileSpreadsheet size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a958f]">
                      Arquivo
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold">
                      {arquivoState?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#dfe3dc] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ef] text-[#527b70]">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a958f]">
                      Transações
                    </p>

                    <p className="mt-1 text-xl font-semibold">
                      {total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#dfe3dc] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f3ea] text-[#8a8063]">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a958f]">
                      Origem
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      Planilha
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-5 rounded-[24px] border border-[#dfe3dc] bg-white p-4 sm:p-5">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d8983]">
                    Prévia dos dados
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {total} transações prontas
                  </h2>
                </div>

                <p className="text-xs text-[#8a958f]">
                  Os dados abaixo ainda não foram
                  importados.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#dfe3dc]">
                <div className="max-h-[620px] overflow-auto">
                  <table className="w-full min-w-[1050px] border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#f3f4f1]">
                      <tr className="border-b border-[#dfe3dc]">
                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d8983]">
                          Data
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d8983]">
                          Estabelecimento
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d8983]">
                          Valor
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d8983]">
                          Método
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d8983]">
                          Categoria
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d8983]">
                          Subcategoria
                        </th>

                        <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d8983]">
                          Parcela
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d8983]">
                          Observação
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {linhas.map((linha, indice) => {
                        const categoriaExiste =
                          categorias.some(
                            (item) =>
                              item.nome.toLowerCase() ===
                              linha.categoria.toLowerCase(),
                          )

                        return (
                          <tr
                            key={indice}
                            className="border-b border-[#edf0eb] last:border-b-0"
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-[#526159]">
                              {linha.data}
                            </td>

                            <td className="max-w-[280px] px-4 py-3 text-xs font-medium text-[#10231c]">
                              <span className="block truncate">
                                {linha.estabelecimento}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-[#10231c]">
                              {linha.valor}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-xs text-[#526159]">
                              {linha.metodoPagamento}
                            </td>

                            <td className="px-4 py-3 text-xs">
                              {linha.categoria ? (
                                <span
                                  className={`rounded-lg px-2 py-1 ${
                                    categoriaExiste
                                      ? 'bg-[#eef7d2] text-[#52621f]'
                                      : 'bg-[#f5f3ea] text-[#8a8063]'
                                  }`}
                                >
                                  {linha.categoria}
                                </span>
                              ) : (
                                <span className="text-[#b0b8b2]">
                                  —
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-xs text-[#68736d]">
                              {linha.subcategoria || '—'}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-center text-xs text-[#68736d]">
                              {linha.parcelaAtual
                                ? `${linha.parcelaAtual}${
                                    linha.parcelaTotal
                                      ? `/${linha.parcelaTotal}`
                                      : ''
                                  }`
                                : '—'}
                            </td>

                            <td className="max-w-[220px] px-4 py-3 text-xs text-[#68736d]">
                              <span className="block truncate">
                                {linha.observacao || '—'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {categoriasEncontradas.length > 0 && (
              <div className="mt-5 rounded-[22px] border border-[#dfe3dc] bg-white p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d8983]">
                  Categorias encontradas
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {categoriasEncontradas.map((categoria) => {
                    const encontrada = categorias.find(
                      (item) =>
                        item.nome.toLowerCase() ===
                        categoria.toLowerCase(),
                    )

                    return (
                      <span
                        key={categoria}
                        className={`rounded-xl px-3 py-2 text-xs font-medium ${
                          encontrada
                            ? 'bg-[#eef7d2] text-[#52621f]'
                            : 'bg-[#f5f3ea] text-[#8a8063]'
                        }`}
                      >
                        {categoria}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={voltar}
                className="h-11 rounded-xl border border-[#dfe3dc] bg-white px-5 text-sm font-medium text-[#526159] transition hover:bg-[#f5f6f1]"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={continuar}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#10231c] px-6 text-sm font-semibold text-white transition hover:bg-[#19372c]"
              >
                <Upload size={16} />
                Continuar para importação
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default PreviewPlanilha