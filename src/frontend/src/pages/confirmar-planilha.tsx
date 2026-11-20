

import {

  ArrowLeft,

  CheckCircle2,

  FileSpreadsheet,

  Loader2,

} from 'lucide-react'



import { useEffect, useMemo, useRef, useState } from 'react'



import { useLocation, useNavigate } from 'react-router-dom'

import MainLayout from '../../components/layout/MainLayout.js'



import {

  importarTransacoes,

  getCategories,

  type TransacaoImportacao,

} from '../services/transicoes.js'



import { invalidarDashboardCache } from './dashboard.js'



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



function converterData(data: string): string {

  const valor = data.trim()



  if (!valor) return ''



  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {

    return valor

  }



  const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)



  if (match) {

    return `${match[3]}-${match[2]}-${match[1]}`

  }



  return valor

}





function converterValor(valor: unknown): number | null {

  if (valor === null || valor === undefined || valor === '') {

    return null

  }



  if (typeof valor === 'number') {

    return Number.isFinite(valor) ? valor : null

  }



  let texto = String(valor)

    .trim()

    .replace(/R\$/gi, '')

    .replace(/\s/g, '')



  if (!texto) return null



  const negativo = texto.startsWith('-')



  texto = texto.replace(/^[+-]/, '')

  texto = texto.replace(/[^\d.,]/g, '')



  if (!texto || !/\d/.test(texto)) {

    return null

  }



  const ultimaVirgula = texto.lastIndexOf(',')

  const ultimoPonto = texto.lastIndexOf('.')



  if (ultimaVirgula > ultimoPonto) {

    texto = texto.replace(/\./g, '').replace(',', '.')

  } else if (ultimoPonto > ultimaVirgula) {

    texto = texto.replace(/,/g, '')

  }



  const numero = Number(texto)



  if (!Number.isFinite(numero)) {

    return null

  }



  return negativo ? -Math.abs(numero) : Math.abs(numero)

}



function converterNumeroOpcional(valor: string): number | null {

  const texto = valor?.trim()



  if (!texto) return null



  const numero = Number(texto)



  return Number.isInteger(numero) && numero > 0 ? numero : null

}



function formatarValor(valor: unknown) {

  const numero = converterValor(valor)



  if (numero === null) {

    return valor === null || valor === undefined ? '' : String(valor)

  }



  return numero.toLocaleString('pt-BR', {

    style: 'currency',

    currency: 'BRL',

  })

}



function obterValor(linha: unknown[], letra: string | undefined) {

  if (!letra) return ''



  let valor = 0



  for (const caractere of letra.toUpperCase()) {

    valor = valor * 26 + caractere.charCodeAt(0) - 64

  }



  const indice = valor - 1



  return linha[indice] ?? ''

}



function PreviewPlanilha() {

  const navigate = useNavigate()

  const location = useLocation()



  const arquivoState = location.state?.arquivo as File | undefined



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

  const [importando, setImportando] = useState(false)

  const [erro, setErro] = useState('')



  const importacaoEmAndamento = useRef(false)



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



        const extensao = arquivoSelecionado.name

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



        const dados = XLSX.utils.sheet_to_json<unknown[]>(

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



        const resultado: LinhaPreview[] = dadosSemCabecalho

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



            if (configuracaoPagamento?.tipo === 'fixo') {

              metodoPagamento = configuracaoPagamento.valor || ''

            } else {

              metodoPagamento = String(

                obterValor(

                  linha,

                  configuracaoPagamento?.coluna ||

                    mapeamento.metodo_pagamento,

                ),

              )

            }



            const valorOriginal = obterValor(

              linha,

              mapeamento.valor,

            )



            const valorConvertido = converterValor(valorOriginal)



            return {

              data: formatarData(

                obterValor(linha, mapeamento.data),

              ),



              estabelecimento: String(

                obterValor(linha, mapeamento.estabelecimento),

              ),



              valor:

                valorConvertido === null

                  ? ''

                  : String(valorConvertido),



              metodoPagamento,



              categoria: String(categoria),



              subcategoria: String(

                obterValor(linha, mapeamento.subcategoria),

              ),



              parcelaAtual: String(

                obterValor(linha, mapeamento.parcela_atual),

              ),



              parcelaTotal: String(

                obterValor(linha, mapeamento.parcela_total),

              ),



              observacao: String(

                obterValor(linha, mapeamento.observacao),

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



  const totalEntradas = linhas.filter((linha) => {

    const valor = converterValor(linha.valor)

    return valor !== null && valor > 0

  }).length



  const totalSaidas = linhas.filter((linha) => {

    const valor = converterValor(linha.valor)

    return valor !== null && valor < 0

  }).length



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

    if (importando) return



    navigate('/conexoes/planilha/configurar', {

      state: {

        arquivo: arquivoState,

        configuracao,

        mapeamento,

        configuracaoPagamento,

      },

    })

  }



  async function handleImportar() {

    if (importacaoEmAndamento.current || importando) return



    importacaoEmAndamento.current = true

    setImportando(true)

    setErro('')



    try {

      const transacoes: TransacaoImportacao[] = linhas.map(

        (linha, indice) => {

          const valor = converterValor(linha.valor)



          if (valor === null) {

            throw new Error(

              `A transação da linha ${indice + 2} possui um valor inválido ou vazio.`,

            )

          }



          return {

            data: converterData(linha.data || ''),



            estabelecimento: (linha.estabelecimento || '').trim(),



           

            valor,



            metodoPagamento: (linha.metodoPagamento || '').trim(),



            categoria: (linha.categoria || '')

              .trim()

              .toLocaleUpperCase('pt-BR'),



            subcategoria: (linha.subcategoria || '').trim(),



            parcelaAtual: converterNumeroOpcional(

              linha.parcelaAtual || '',

            ),



            parcelaTotal: converterNumeroOpcional(

              linha.parcelaTotal || '',

            ),



            observacao: (linha.observacao || '').trim(),

          }

        },

      )



      const categoriasCadastradas = await getCategories()
      const categoriasValidas = new Set(categoriasCadastradas)

      if (!categoriasValidas.has('OUTROS')) {
        throw new Error('A categoria OUTROS não está cadastrada no banco.')
      }

      const transacoesCorrigidas = transacoes.map((transacao) => {
        const categoria = transacao.categoria.trim().toLocaleUpperCase('pt-BR')

        return {
          ...transacao,
          categoria:
            categoria && categoriasValidas.has(categoria)
              ? categoria
              : 'OUTROS',
        }
      })

      const resposta = await importarTransacoes(transacoesCorrigidas)



      invalidarDashboardCache()



      const tipoNotificacao =

        resposta.inseridas > 0

          ? resposta.ignoradas > 0

            ? 'warning'

            : 'success'

          : 'error'



      const mensagem =

        resposta.inseridas > 0

          ? resposta.ignoradas > 0

            ? `Importação parcial: ${resposta.inseridas} transação(ões) adicionada(s) e ${resposta.ignoradas} ignorada(s).`

            : `Planilha importada com sucesso! ${resposta.inseridas} transação(ões) adicionada(s).`

          : resposta.erros?.[0]?.erro ||

            'Nenhuma transação foi inserida.'



      sessionStorage.setItem(

        'finly-import-notification',

        JSON.stringify({

          tipo: tipoNotificacao,

          mensagem,

        }),

      )



      sessionStorage.setItem(

        'finly-refresh-dashboard',

        'true',

      )



      sessionStorage.removeItem(

        'finly-tipo-importacao-planilha',

      )



      navigate('/dashboard', { replace: true })

    } catch (error) {

      invalidarDashboardCache()



      setErro(

        error instanceof Error

          ? `Não foi possível importar a planilha: ${error.message}`

          : 'Não foi possível importar a planilha. Tente novamente.',

      )

    } finally {

      importacaoEmAndamento.current = false

      setImportando(false)

    }

  }



  return (

    <MainLayout>

      <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">

        <main className="mx-auto max-w-[1450px] px-5 py-7 sm:px-8 lg:px-10">

          <button

            type="button"

            onClick={voltar}

            disabled={importando}

            className="mb-7 flex items-center gap-2 text-sm text-[#77839e] transition hover:text-[#17213b] disabled:opacity-50"

          >

            <ArrowLeft size={16} />

            Voltar para configuração

          </button>



          <div className="mb-7 flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7653f5] text-white">

              <FileSpreadsheet size={21} />

            </div>



            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b96aa]">

                Conexões · Planilha

              </p>



              <h1 className="mt-1 text-[30px] font-normal tracking-[-0.04em] sm:text-[38px]">

                Confira antes de importar

              </h1>



              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#77839e]">

                Confira como os dados da sua planilha serão

                interpretados antes de enviá-los para sua conta.

              </p>

            </div>

          </div>



          {carregando && (

            <div className="rounded-[24px] border border-[#e6e8f0] bg-white p-10 text-center">

              <p className="text-sm text-[#77839e]">

                Preparando sua prévia...

              </p>

            </div>

          )}



          {!carregando && erro && linhas.length === 0 && (

            <div className="rounded-[24px] border border-[#fcebea] bg-white p-8">

              <p className="text-sm font-semibold text-[#d65b55]">

                Não foi possível preparar a prévia

              </p>



              <p className="mt-2 text-sm text-[#77839e]">

                {erro}

              </p>



              <button

                type="button"

                onClick={voltar}

                className="mt-5 rounded-xl bg-[#17213b] px-5 py-3 text-sm font-semibold text-white"

              >

                Voltar para configuração

              </button>

            </div>

          )}



          {!carregando && linhas.length > 0 && (

            <>

              <div className="grid gap-5 lg:grid-cols-3">

                <div className="rounded-[22px] border border-[#e6e8f0] bg-white p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edff] text-[#7653f5]">

                      <FileSpreadsheet size={18} />

                    </div>



                    <div className="min-w-0">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa5b8]">

                        Arquivo

                      </p>



                      <p className="mt-1 truncate text-sm font-semibold">

                        {arquivoState?.name}

                      </p>

                    </div>

                  </div>

                </div>



                <div className="rounded-[22px] border border-[#e6e8f0] bg-white p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edff] text-[#7653f5]">

                      <CheckCircle2 size={18} />

                    </div>



                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa5b8]">

                        Transações

                      </p>



                      <p className="mt-1 text-xl font-semibold">

                        {total}

                      </p>

                    </div>

                  </div>

                </div>



                <div className="rounded-[22px] border border-[#e6e8f0] bg-white p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edff] text-[#7653f5]">

                      <CheckCircle2 size={18} />

                    </div>



                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa5b8]">

                        Tipos identificados

                      </p>



                      <div className="mt-1 flex flex-wrap gap-3 text-sm font-semibold">

                        <span className="text-emerald-700">

                          {totalEntradas} entradas

                        </span>



                        <span className="text-red-600">

                          {totalSaidas} saídas

                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>



              <section className="mt-5 rounded-[24px] border border-[#e6e8f0] bg-white p-4 sm:p-5">

                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b96aa]">

                      Prévia dos dados

                    </p>



                    <h2 className="mt-1 text-xl font-semibold">

                      {total} transações prontas

                    </h2>

                  </div>



                  <p className="text-xs text-[#9aa5b8]">

                    Os dados abaixo ainda não foram importados.

                  </p>

                </div>



                <div className="overflow-hidden rounded-xl border border-[#e6e8f0]">

                  <div className="max-h-[620px] overflow-auto">

                    <table className="w-full min-w-[1250px] border-collapse">

                      <thead className="sticky top-0 z-10 bg-[#f7f8fc]">

                        <tr className="border-b border-[#e6e8f0]">

                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Data

                          </th>



                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Estabelecimento

                          </th>



                          <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Valor

                          </th>



                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Tipo

                          </th>



                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Método

                          </th>



                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Categoria

                          </th>



                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Subcategoria

                          </th>



                          <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Parcela

                          </th>



                          <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Total parcelas

                          </th>



                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96aa]">

                            Observação

                          </th>

                        </tr>

                      </thead>



                      <tbody>

                        {linhas.map((linha, indice) => {

                          const valorNumerico = converterValor(linha.valor)



                          return (

                            <tr

                              key={`${linha.data}-${linha.estabelecimento}-${indice}`}

                              className="border-b border-[#f7f8fc] last:border-b-0"

                            >

                              <td className="whitespace-nowrap px-4 py-3 text-sm text-[#77839e]">

                                {linha.data || '-'}

                              </td>



                              <td className="px-4 py-3 text-sm font-medium">

                                {linha.estabelecimento || '-'}

                              </td>



                              <td

                                className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold ${

                                  valorNumerico !== null && valorNumerico < 0

                                    ? 'text-red-600'

                                    : 'text-emerald-700'

                                }`}

                              >

                                {formatarValor(linha.valor) || '-'}

                              </td>



                              <td className="px-4 py-3 text-sm">

                                {valorNumerico === null ? (

                                  <span className="text-[#9aa5b8]">Inválido</span>

                                ) : valorNumerico < 0 ? (

                                  <span className="font-medium text-red-600">

                                    Saída

                                  </span>

                                ) : (

                                  <span className="font-medium text-emerald-700">

                                    Entrada

                                  </span>

                                )}

                              </td>



                              <td className="px-4 py-3 text-sm text-[#77839e]">

                                {linha.metodoPagamento || '-'}

                              </td>



                              <td className="px-4 py-3 text-sm text-[#77839e]">

                                {linha.categoria || '-'}

                              </td>



                              <td className="px-4 py-3 text-sm text-[#77839e]">

                                {linha.subcategoria || '-'}

                              </td>



                              <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-[#77839e]">

                                {linha.parcelaAtual || '-'}

                              </td>



                              <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-[#77839e]">

                                {linha.parcelaTotal || '-'}

                              </td>



                              <td className="max-w-[220px] truncate px-4 py-3 text-sm text-[#77839e]">

                                {linha.observacao || '-'}

                              </td>

                            </tr>

                          )

                        })}

                      </tbody>

                    </table>

                  </div>

                </div>



                {categoriasEncontradas.length > 0 && (

                  <div className="mt-5">

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa5b8]">

                      Categorias encontradas

                    </p>



                    <div className="flex flex-wrap gap-2">

                      {categoriasEncontradas.map((categoria) => (

                        <span

                          key={categoria}

                          className="rounded-full border border-[#e6e8f0] bg-[#f5f6fb] px-3 py-1.5 text-xs text-[#77839e]"

                        >

                          {categoria}

                        </span>

                      ))}

                    </div>

                  </div>

                )}

              </section>



              {erro && (

                <div

                  role="alert"

                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"

                >

                  {erro}

                </div>

              )}



              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">

                <button

                  type="button"

                  onClick={voltar}

                  disabled={importando}

                  className="rounded-xl border border-[#e6e8f0] bg-white px-5 py-3 text-sm font-semibold text-[#17213b] transition hover:bg-[#f7f8fc] disabled:cursor-not-allowed disabled:opacity-50"

                >

                  Voltar

                </button>



                <button

                  type="button"

                  onClick={handleImportar}

                  disabled={importando || linhas.length === 0}

                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17213b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6543e8] disabled:cursor-not-allowed disabled:opacity-60"

                >

                  {importando ? (

                    <>

                      <Loader2 size={17} className="animate-spin" />

                      Importando...

                    </>

                  ) : (

                    <>

                      <CheckCircle2 size={17} />

                      Importar transações

                    </>

                  )}

                </button>

              </div>

            </>

          )}

        </main>

      </div>

    </MainLayout>

  )

}



export default PreviewPlanilha

