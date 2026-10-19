import {
    ArrowLeft,
    Check,
    ChevronDown,
    FileSpreadsheet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'

interface Configuracao {
    separador: string
    formatoData: string
    formatoValor: string
}

function detectarSeparador(texto: string) {
    const primeiraLinha = texto
        .split(/\r?\n/)
        .find((linha) => linha.trim())

    if (!primeiraLinha) {
        return ','
    }

    const separadores = [';', ',', '\t', '|']

    return separadores.reduce((melhor, atual) => {
        const quantidadeAtual = primeiraLinha.split(atual).length
        const quantidadeMelhor = primeiraLinha.split(melhor).length

        return quantidadeAtual > quantidadeMelhor ? atual : melhor
    }, ',')
}

function lerCsv(texto: string, separador: string): string[][] {
    const workbook = XLSX.read(texto, {
        type: 'string',
        FS: separador,
        raw: true,
    })

    const primeiraAba = workbook.SheetNames[0]

    if (!primeiraAba) {
        return []
    }

    const worksheet = workbook.Sheets[primeiraAba]

    const linhas = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: true,
    }) as unknown[][]

    return linhas.map((linha) =>
        linha.map((celula) => {
            if (celula === null || celula === undefined) {
                return ''
            }

            return String(celula)
        }),
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

    const ehCsv = useMemo(() => {
        return arquivo?.name.toLowerCase().endsWith('.csv') ?? false
    }, [arquivo])

    useEffect(() => {
        if (!arquivo) {
            navigate('/conexoes/planilha')
            return
        }

        const arquivoSelecionado = arquivo

        async function carregarArquivo() {
            try {
                setCarregando(true)
                setErro('')

                if (arquivoSelecionado.name.toLowerCase().endsWith('.csv')) {
                    const texto = await arquivoSelecionado.text()
                    const separadorDetectado = detectarSeparador(texto)

                    setSeparador(separadorDetectado)

                    const linhas = lerCsv(texto, separadorDetectado)

                    setDados(linhas)

                    return
                }

                const buffer = await arquivoSelecionado.arrayBuffer()

                const workbook = XLSX.read(buffer, {
                    type: 'array',
                    cellDates: true,
                })

                const primeiraAba = workbook.SheetNames[0]

                if (!primeiraAba) {
                    throw new Error('Não foi encontrada nenhuma aba na planilha.')
                }

                const worksheet = workbook.Sheets[primeiraAba]

                const linhas = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    raw: true,
                }) as unknown[][]

                const linhasFormatadas: string[][] = linhas
                    .map((linha) =>
                        linha.map((celula) => {
                            if (celula instanceof Date) {
                                return celula.toLocaleDateString('pt-BR')
                            }

                            if (celula === null || celula === undefined) {
                                return ''
                            }

                            return String(celula)
                        }),
                    )

                setDados(linhasFormatadas)
            } catch {
                setErro('Não foi possível ler essa planilha.')
            } finally {
                setCarregando(false)
            }
        }

        carregarArquivo()
    }, [arquivo, navigate])

    function atualizarSeparador(novoSeparador: string) {
        setSeparador(novoSeparador)

        if (!arquivo || !ehCsv) {
            return
        }

        arquivo.text().then((texto) => {
            try {
                const linhas = lerCsv(texto, novoSeparador)

                setDados(linhas)
                setErro('')
            } catch {
                setDados([])
                setErro('Não foi possível interpretar a planilha com esse separador.')
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
            },
        })
    }

    if (!arquivo) {
        return null
    }

    return (
        <div className="min-h-screen bg-[#f7f7f0] text-[#10231c]">
            <main className="mx-auto max-w-[1180px] px-5 py-6 sm:px-8 lg:px-11 lg:py-9">
                <button
                    type="button"
                    onClick={() => navigate('/conexoes/planilha')}
                    className="mb-8 flex items-center gap-2 text-sm text-[#68736d] transition hover:text-[#10231c]"
                >
                    <ArrowLeft size={17} />
                    Voltar para envio
                </button>

                <div className="max-w-3xl">
                    

                    <h1 className="mt-2 text-[34px] font-normal tracking-[-0.04em] text-[#10231c] sm:text-[42px]">
                        Prepare sua planilha
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-[#68736d]">
                        Antes de escolher as colunas, vamos entender como os dados estão
                        organizados e padronizar datas e valores.
                    </p>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
                    <section className="min-w-0 rounded-[24px] border border-[#dfe3dc] bg-white p-5 sm:p-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d8ff3e] text-[#10231c]">
                                <FileSpreadsheet size={20} />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                    {arquivo.name}
                                </p>

                                <p className="mt-1 text-xs text-[#8a958f]">
                                    Prévia dos primeiros registros
                                </p>
                            </div>
                        </div>

                        {erro ? (
                            <div className="mt-6 rounded-xl border border-[#ead2cb] bg-[#fbf0ed] px-4 py-3 text-sm text-[#a85b4b]">
                                {erro}
                            </div>
                        ) : carregando ? (
                            <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-2xl border border-[#e5e8e2] bg-[#fafaf6] text-sm text-[#7d8983]">
                                Lendo sua planilha...
                            </div>
                        ) : dados.length === 0 ? (
                            <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-2xl border border-[#e5e8e2] bg-[#fafaf6] text-sm text-[#7d8983]">
                                Não foram encontrados dados para mostrar.
                            </div>
                        ) : (
                            <div className="mt-6 overflow-hidden rounded-2xl border border-[#e1e5df]">
                                <div className="max-h-[430px] overflow-auto">
                                    <table className="min-w-full border-collapse text-left text-xs">
                                        <tbody>
                                            {dados.map((linha, linhaIndex) => (
                                                <tr
                                                    key={linhaIndex}
                                                    className={
                                                        linhaIndex === 0
                                                            ? 'bg-[#f1f4e5]'
                                                            : 'bg-white'
                                                    }
                                                >
                                                    <td className="sticky left-0 w-10 min-w-10 border-b border-r border-[#e5e8e2] bg-[#f7f8f3] px-3 py-3 text-center text-[10px] font-medium text-[#8b958f]">
                                                        {linhaIndex + 1}
                                                    </td>

                                                    {linha.map((celula, colunaIndex) => (
                                                        <td
                                                            key={colunaIndex}
                                                            className={`min-w-[140px] border-b border-r border-[#e5e8e2] px-4 py-3 ${linhaIndex === 0
                                                                ? 'font-semibold text-[#10231c]'
                                                                : 'text-[#68736d]'
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

                    <aside className="rounded-[24px] border border-[#dfe3dc] bg-white p-5 sm:p-6">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8983]">
                                01 · Organização
                            </p>

                            <h2 className="mt-2 text-lg font-semibold text-[#10231c]">
                                Como os dados estão escritos?
                            </h2>

                            <p className="mt-2 text-sm leading-5 text-[#7b857f]">
                                Essas configurações servem apenas para padronizar a leitura
                                dos dados.
                            </p>
                        </div>

                        {ehCsv && (
                            <div className="mt-7">
                                <label className="text-xs font-semibold text-[#526159]">
                                    Separador das colunas
                                </label>

                                <div className="relative mt-2">
                                    <select
                                        value={separador}
                                        onChange={(event) =>
                                            atualizarSeparador(event.target.value)
                                        }
                                        className="h-11 w-full appearance-none rounded-xl border border-[#dfe3dc] bg-[#fafaf6] px-3 pr-10 text-sm text-[#10231c] outline-none transition focus:border-[#9aae35]"
                                    >
                                        <option value=",">Vírgula (,)</option>
                                        <option value=";">Ponto e vírgula (;)</option>
                                        <option value={'\t'}>Tabulação</option>
                                        <option value="|">Barra vertical (|)</option>
                                    </select>

                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8983]"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="text-xs font-semibold text-[#526159]">
                                Formato das datas
                            </label>

                            <div className="relative mt-2">
                                <select
                                    value={formatoData}
                                    onChange={(event) => setFormatoData(event.target.value)}
                                    className="h-11 w-full appearance-none rounded-xl border border-[#dfe3dc] bg-[#fafaf6] px-3 pr-10 text-sm text-[#10231c] outline-none transition focus:border-[#9aae35]"
                                >
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8983]"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="text-xs font-semibold text-[#526159]">
                                Formato dos valores
                            </label>

                            <div className="relative mt-2">
                                <select
                                    value={formatoValor}
                                    onChange={(event) => setFormatoValor(event.target.value)}
                                    className="h-11 w-full appearance-none rounded-xl border border-[#dfe3dc] bg-[#fafaf6] px-3 pr-10 text-sm text-[#10231c] outline-none transition focus:border-[#9aae35]"
                                >
                                    <option value="1234,56">1234,56</option>
                                    <option value="1.234,56">1.234,56</option>
                                    <option value="1234.56">1234.56</option>
                                    <option value="1,234.56">1,234.56</option>
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8983]"
                                />
                            </div>
                        </div>

                        <div className="mt-7 rounded-2xl bg-[#eef7d2] p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#9aae35] text-white">
                                    <Check size={12} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-[#40502f]">
                                        Seus dados serão padronizados
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#68736d]">
                                        Os valores serão convertidos para o formato numérico
                                        esperado pelo Finly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/conexoes/planilha')}
                        className="h-11 rounded-xl border border-[#dfe3dc] bg-white px-5 text-sm font-medium text-[#526159] transition hover:bg-[#f5f6f1]"
                    >
                        Voltar
                    </button>

                    <button
                        type="button"
                        onClick={continuar}
                        disabled={carregando || !!erro || dados.length === 0}
                        className="h-11 rounded-xl bg-[#10231c] px-6 text-sm font-semibold text-white transition hover:bg-[#19372c] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Continuar
                    </button>
                </div>
            </main>
        </div>
    )
}

export default PrepararPlanilha