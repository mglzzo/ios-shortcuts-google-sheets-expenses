import {
    CheckCircle2,
    ChevronDown,
    FileSpreadsheet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import MainLayout from '../../components/layout/MainLayout'

interface Configuracao {
    separador: string
    formatoData: string
    formatoValor: string
}

function detectarSeparador(texto: string) {
    const primeiraLinha = texto.split(/\r?\n/).find((linha) => linha.trim())

    if (!primeiraLinha) return ','

    const separadores = [';', ',', '\t', '|']

    return separadores.reduce(
        (melhor, atual) =>
            primeiraLinha.split(atual).length >
                primeiraLinha.split(melhor).length
                ? atual
                : melhor,
        ',',
    )
}

function lerCsv(texto: string, separador: string): string[][] {
    const workbook = XLSX.read(texto, {
        type: 'string',
        FS: separador,
        raw: true,
    })

    const primeiraAba = workbook.SheetNames[0]

    if (!primeiraAba) return []

    const linhas = XLSX.utils.sheet_to_json(
        workbook.Sheets[primeiraAba],
        {
            header: 1,
            defval: '',
            raw: true,
        },
    ) as unknown[][]

    return linhas.map((linha) =>
        linha.map((celula) =>
            celula === null || celula === undefined ? '' : String(celula),
        ),
    )
}

function PrepararPlanilha() {
    const navigate = useNavigate()
    const location = useLocation()

    const arquivo = location.state?.arquivo as File | undefined

    const [separador, setSeparador] = useState(',')
    const [formatoData, setFormatoData] = useState('YYYY-MM-DD')
    const [formatoValor, setFormatoValor] = useState('1234,56')
    const [dados, setDados] = useState<string[][]>([])
    const [erro, setErro] = useState('')
    const [carregando, setCarregando] = useState(true)
    const [avisoAberto, setAvisoAberto] = useState(false)

    const ehCsv = useMemo(
        () => arquivo?.name.toLowerCase().endsWith('.csv') ?? false,
        [arquivo],
    )

    const tipoImportacao =
        location.state?.tipoImportacao === 'entrada' ||
            sessionStorage.getItem('finly-tipo-importacao-planilha') === 'entrada'
            ? 'entrada'
            : 'saida'


    useEffect(() => {
        if (!arquivo) {
            navigate('/conexoes/planilha')
            return
        }

        const arquivoAtual = arquivo
        let ativo = true

        async function carregarArquivo() {
            try {
                setCarregando(true)
                setErro('')

                if (arquivoAtual.name.toLowerCase().endsWith('.csv')) {
                    const texto = await arquivoAtual.text()
                    const detectado = detectarSeparador(texto)
                    const linhas = lerCsv(texto, detectado)

                    if (ativo) {
                        setSeparador(detectado)
                        setDados(linhas)
                    }
                } else {
                    const buffer = await arquivoAtual.arrayBuffer()

                    const workbook = XLSX.read(buffer, {
                        type: 'array',
                        cellDates: true,
                    })

                    const primeiraAba = workbook.SheetNames[0]

                    if (!primeiraAba) {
                        throw new Error(
                            'Não foi encontrada nenhuma aba na planilha.',
                        )
                    }

                    const linhas = XLSX.utils.sheet_to_json(
                        workbook.Sheets[primeiraAba],
                        {
                            header: 1,
                            defval: '',
                            raw: true,
                        },
                    ) as unknown[][]

                    const formatadas = linhas.map((linha) =>
                        linha.map((celula) => {
                            if (celula instanceof Date) {
                                return celula.toLocaleDateString('pt-BR')
                            }

                            return celula === null || celula === undefined
                                ? ''
                                : String(celula)
                        }),
                    )

                    if (ativo) {
                        setDados(formatadas)
                    }
                }
            } catch {
                if (ativo) {
                    setErro(
                        'Não foi possível ler essa planilha. Verifique se o arquivo está válido.',
                    )
                }
            } finally {
                if (ativo) {
                    setCarregando(false)
                }
            }
        }

        carregarArquivo()

        return () => {
            ativo = false
        }
    }, [arquivo, navigate])


    function atualizarSeparador(novo: string) {
        setSeparador(novo)

        if (!arquivo || !ehCsv) return

        arquivo.text().then((texto) => {
            try {
                setDados(lerCsv(texto, novo))
                setErro('')
            } catch {
                setDados([])
                setErro(
                    'Não foi possível interpretar a planilha com esse separador.',
                )
            }
        })
    }

    function continuar() {
        if (!arquivo) {
            navigate('/conexoes/planilha')
            return
        }
        const configuracao: Configuracao = {
            separador,
            formatoData,
            formatoValor,
        }

        navigate('/conexoes/planilha/configurar', {
            state: {
                arquivo,
                configuracao,
                tipoImportacao,
            },
        })
    }


    if (!arquivo) return null

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#f5f6fb] text-[#17213b]">
                    <div className="w-full max-w-none px-5 pb-8 pt-7 sm:px-10 lg:px-12">


                        <div className="mb-8">


                            <h1 className="text-[40px] font-extrabold leading-tight tracking-[-.7px] sm:text-[44px]">
                                Prepare sua planilha
                            </h1>

                            <p className="mt-2 max-w-3xl text-[16px] leading-6 text-[#77839e] sm:text-[18px]">
                                Antes de escolher as colunas, vamos entender como os dados
                                estão organizados e padronizar datas e valores.
                            </p>
                        </div>

                        <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">

                            <section className="min-w-0 rounded-[22px] border border-[#e7eaf2] bg-white p-5 shadow-[0_2px_10px_rgba(20,30,60,0.025)] sm:p-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eeeaff] text-[#7653f5]">
                                        <FileSpreadsheet size={21} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[#263654]">
                                            {arquivo.name}
                                        </p>

                                        <p className="mt-1 text-xs text-[#8995ae]">
                                            Prévia dos primeiros registros
                                        </p>
                                    </div>
                                </div>

                                {erro ? (
                                    <div className="mt-6 rounded-xl border border-[#f2d5d2] bg-[#fff5f4] px-4 py-3 text-sm text-[#b85d58]">
                                        {erro}
                                    </div>
                                ) : carregando ? (
                                    <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-2xl border border-[#e8ebf2] bg-[#fafbfe] text-sm text-[#8995ae]">
                                        Lendo sua planilha...
                                    </div>
                                ) : dados.length === 0 ? (
                                    <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-2xl border border-[#e8ebf2] bg-[#fafbfe] text-sm text-[#8995ae]">
                                        Não foram encontrados dados para mostrar.
                                    </div>
                                ) : (
                                    <div className="mt-6 overflow-hidden rounded-xl border border-[#e5e9f1]">
                                        <div className="max-h-[470px] overflow-auto">
                                            <table className="min-w-full border-collapse text-left text-xs">
                                                <tbody>
                                                    {dados.map((linha, linhaIndex) => (
                                                        <tr
                                                            key={linhaIndex}
                                                            className={
                                                                linhaIndex === 0
                                                                    ? 'bg-[#f0efff]'
                                                                    : 'bg-white'
                                                            }
                                                        >
                                                            <td className="sticky left-0 w-10 min-w-10 border-b border-r border-[#e8ebf2] bg-[#f7f8fc] px-3 py-3 text-center text-[10px] text-[#8995ae]">
                                                                {linhaIndex + 1}
                                                            </td>

                                                            {linha.map((celula, colunaIndex) => (
                                                                <td
                                                                    key={colunaIndex}
                                                                    className={`min-w-[140px] border-b border-r border-[#e8ebf2] px-4 py-3 ${linhaIndex === 0
                                                                        ? 'font-semibold text-[#263654]'
                                                                        : 'text-[#71809e]'
                                                                        }`}
                                                                >
                                                                    {celula || '—'}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </section>


                            <aside className="rounded-[22px] border border-[#e7eaf2] bg-white p-5 shadow-[0_2px_10px_rgba(20,30,60,0.025)] sm:p-6">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8995ae]">
                                    01 · Organização
                                </p>

                                <h2 className="mt-2 text-lg font-bold text-[#172b4d]">
                                    Como os dados estão escritos?
                                </h2>

                                <p className="mt-2 text-sm leading-5 text-[#7d8aa5]">
                                    Essas configurações ajudam o Camélia a interpretar
                                    corretamente as informações da sua planilha.
                                </p>

                                {ehCsv && (
                                    <div className="mt-6">
                                        <label className="text-xs font-semibold text-[#52617d]">
                                            Separador das colunas
                                        </label>

                                        <div className="relative mt-2">
                                            <select
                                                value={separador}
                                                onChange={(e) =>
                                                    atualizarSeparador(e.target.value)
                                                }
                                                className="h-11 w-full appearance-none rounded-xl border border-[#e1e5ee] bg-[#fafbfe] px-3 pr-10 text-sm text-[#263654] outline-none focus:border-[#8b73f7]"
                                            >
                                                <option value=",">Vírgula (,)</option>
                                                <option value=";">Ponto e vírgula (;)</option>
                                                <option value={'\t'}>Tabulação</option>
                                                <option value="|">Barra vertical (|)</option>
                                            </select>

                                            <ChevronDown
                                                size={16}
                                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8995ae]"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <label className="text-xs font-semibold text-[#52617d]">
                                        Formato das datas
                                    </label>

                                    <div className="relative mt-2">
                                        <select
                                            value={formatoData}
                                            onChange={(e) => setFormatoData(e.target.value)}
                                            className="h-11 w-full appearance-none rounded-xl border border-[#e1e5ee] bg-[#fafbfe] px-3 pr-10 text-sm text-[#263654] outline-none focus:border-[#8b73f7]"
                                        >
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        </select>

                                        <ChevronDown
                                            size={16}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8995ae]"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <label className="text-xs font-semibold text-[#52617d]">
                                        Formato dos valores
                                    </label>

                                    <div className="relative mt-2">
                                        <select
                                            value={formatoValor}
                                            onChange={(e) => setFormatoValor(e.target.value)}
                                            className="h-11 w-full appearance-none rounded-xl border border-[#e1e5ee] bg-[#fafbfe] px-3 pr-10 text-sm text-[#263654] outline-none focus:border-[#8b73f7]"
                                        >
                                            <option value="1234,56">1234,56</option>
                                            <option value="1.234,56">1.234,56</option>
                                            <option value="1234.56">1234.56</option>
                                            <option value="1,234.56">1,234.56</option>
                                        </select>

                                        <ChevronDown
                                            size={16}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8995ae]"
                                        />
                                    </div>
                                </div>


                                <div className="mt-6 overflow-hidden rounded-2xl border border-[#e6e0ff] bg-[#f7f4ff]">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAvisoAberto((aberto) => !aberto)
                                        }
                                        aria-expanded={avisoAberto}
                                        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-[#f0ecff]"
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <CheckCircle2
                                                size={18}
                                                className="shrink-0 text-[#7653f5]"
                                            />

                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-[#4935a8]">
                                                    Atenção: como preencher os valores da planilha
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-[#65718b]">
                                                    Clique para entender como identificar entradas e
                                                    saídas.
                                                </p>
                                            </div>
                                        </div>

                                        <ChevronDown
                                            size={18}
                                            className={`shrink-0 text-[#7653f5] transition-transform duration-200 ${avisoAberto ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {avisoAberto && (
                                        <div className="border-t border-[#e6e0ff] px-4 pb-4 pt-3">
                                            <p className="text-xs leading-5 text-[#65718b]">
                                                A identificação das movimentações funciona de acordo
                                                com o sinal do valor:
                                            </p>

                                            <div className="mt-3 rounded-xl border border-[#e6e0ff] bg-white p-3">
                                                <p className="text-xs font-bold text-[#263654]">
                                                    Valor positivo (ex.: R$ 200,00)
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-[#65718b]">
                                                    Representa uma entrada de dinheiro na sua conta,
                                                    como salário, Pix recebido ou transferência recebida.
                                                </p>
                                            </div>

                                            <div className="mt-3 rounded-xl border border-[#e6e0ff] bg-white p-3">
                                                <p className="text-xs font-bold text-[#263654]">
                                                    Valor negativo (ex.: -R$ 200,00)
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-[#65718b]">
                                                    Representa uma saída de dinheiro da sua conta,
                                                    como compras, contas, pagamentos e despesas em geral.
                                                </p>
                                            </div>

                                            <div className="mt-3 border-t border-[#e6e0ff] pt-3">
                                                <p className="text-xs font-bold text-[#4935a8]">
                                                    Importante
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-[#65718b]">
                                                    Utilize valores negativos para identificar despesas
                                                    e valores positivos para identificar receitas.
                                                    Não remova o sinal dos valores negativos, pois ele
                                                    é utilizado pelo sistema para classificar corretamente
                                                    as movimentações.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </aside>
                        </div>


                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/conexoes/planilha')}
                                className="h-11 rounded-xl border border-[#e1e5ee] bg-white px-5 text-sm font-semibold text-[#52617d] transition hover:bg-[#f8f9fc]"
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                onClick={continuar}
                                disabled={
                                    carregando || !!erro || dados.length === 0
                                }
                                className="h-11 rounded-xl bg-[#7653f5] px-6 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(118,83,245,0.2)] transition hover:bg-[#6845e8] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
            </div>
        </MainLayout>
    )
}

export default PrepararPlanilha
